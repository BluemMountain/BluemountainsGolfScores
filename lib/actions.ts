"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

/* --- Member Actions --- */

export async function getMembers() {
    try {
        return await prisma.member.findMany({
            orderBy: { name: "asc" },
        });
    } catch (error) {
        console.error("Error in getMembers:", error);
        throw error;
    }
}

export async function createMember(name: string, role: string = "MEMBER", handicap: number = 0.0) {
    const member = await prisma.member.create({
        data: { name, role, handicap },
    });
    revalidatePath("/admin");
    return member;
}

export async function updateMember(id: string, name: string) {
    const member = await prisma.member.update({
        where: { id },
        data: { name },
    });

    await recalculateMemberHandicap(id);

    revalidatePath("/");
    revalidatePath("/rounds");
    revalidatePath("/admin");
    return member;
}

export async function recalculateMemberHandicap(memberId: string) {
    const scores = await prisma.score.findMany({
        where: { memberId },
    });

    if (scores.length === 0) return;

    const average = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;

    // Using (Average Score - 72) as a simple handicap calculation, 
    // or just store the average if that's the convention used.
    // Based on the UI showing 89.8 as average, let's stick to a simple average or average-72.
    // Let's go with (Average - 72) but ensure it's not negative if needed.
    const handicap = Math.max(0, average - 72);

    await prisma.member.update({
        where: { id: memberId },
        data: { handicap },
    });
}

import { GoogleGenerativeAI } from "@google/generative-ai";

/* --- AI Image Analysis --- */

export async function analyzeScoreImage(base64Image: string) {
    try {
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY 가 설정되지 않았습니다.");

        // 사용 가능한 최신 모델인 gemini-2.5-flash (테스트로 검증됨)
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
        });

        // v1beta가 아닌 안정적인 환경을 위해 시도 (모델명이 이미 확인됨)

        // Detect MIME type and extract clean base64 data
        let mimeType = "image/jpeg";
        let data = base64Image;

        if (base64Image.startsWith("data:")) {
            const match = base64Image.match(/^data:([^;]+);base64,(.+)$/);
            if (match) {
                mimeType = match[1];
                data = match[2];
            }
        }

        console.log(`Starting AI Analysis: MIME=${mimeType}, DataLength=${data.length}`);

        const prompt = `
        이 이미지는 골프 라운딩 성적표(스코어카드) 또는 단체팀 스코어보드입니다. 
        이미지에 보이는 모든 참가자의 이름과 점수를 추출해주세요.
        다른 설명은 생략하고 오직 JSON 데이터만 응답하세요.
        
        {
          "date": "YYYY-MM-DD",
          "course": "골프장 이름",
          "results": [
            { "name": "이름", "score": 점수(숫자) }
          ]
        }
        
        - 날짜가 이미지에 없다면 오늘 날짜인 "${new Date().toISOString().split('T')[0]}"를 기본값으로 하세요.
        - 점수는 '총계', 'Total', '합계', '스코어' 등에 해당하는 숫자를 추출하세요.
        - 단체팀 리스트인 경우, 리스트에 있는 모든 사람 정보를 포함하세요.
        `;

        const result = await model.generateContent([
            {
                inlineData: {
                    data,
                    mimeType,
                },
            },
            { text: prompt },
        ]);

        const response = await result.response;
        const text = response.text();
        console.log("AI Raw Response:", text);

        try {
            // JSON 추출 강화: 마크다운 코드 블록 제거 및 순수 JSON 추출
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("JSON 형식을 찾을 수 없습니다.");

            const parsed = JSON.parse(jsonMatch[0]);
            console.log("AI Parsed Result:", parsed);
            return parsed;
        } catch (e) {
            console.error("AI Response Parsing Failed. Raw text:", text);
            throw new Error("AI가 유효한 데이터를 생성하지 못했습니다. (Parsing Error)");
        }
    } catch (error: any) {
        console.error("Critical AI Analysis Error Details:", error);

        let errorMessage = error.message || "이미지 분석 중 알 수 없는 오류가 발생했습니다.";

        if (errorMessage.includes("404")) {
            errorMessage = "Gemini 모델을 찾을 수 없습니다. API 키 설정을 확인하세요.";
        } else if (errorMessage.includes("429") || errorMessage.includes("quota")) {
            errorMessage = "API 할당량 초과입니다. 잠시 후 다시 시도하세요.";
        }

        throw new Error(errorMessage);
    }
}

/* --- Round Actions --- */

export async function getRounds() {
    try {
        return await prisma.round.findMany({
            include: {
                scores: {
                    include: {
                        member: true,
                    },
                },
            },
            orderBy: { date: "desc" },
        });
    } catch (error) {
        console.error("Error in getRounds:", error);
        throw error;
    }
}

export async function createRound(
    date: Date,
    course: string,
    scoresData: { memberId?: string; name?: string; score: number }[]
) {
    // Process scores and create/find members if needed
    const finalizedScores = await Promise.all(
        scoresData.map(async (item) => {
            let memberId = item.memberId;

            if (!memberId && item.name) {
                // Find existing member by exact name or create new one
                let member = await prisma.member.findFirst({
                    where: { name: item.name },
                });

                if (!member) {
                    member = await prisma.member.create({
                        data: { name: item.name, role: "MEMBER", handicap: 0.0 },
                    });
                }
                memberId = member.id;
            }

            return {
                memberId: memberId as string,
                score: item.score,
            };
        })
    );

    // Filter out items without a valid memberId (should not happen with logic above)
    const validScores = finalizedScores.filter(s => s.memberId);

    const round = await prisma.round.create({
        data: {
            date,
            course,
            scores: {
                create: validScores,
            },
        },
    });

    // Re-numbering all rounds by date
    const allRounds = await prisma.round.findMany({
        orderBy: { date: "asc" },
    });

    for (let i = 0; i < allRounds.length; i++) {
        await prisma.round.update({
            where: { id: allRounds[i].id },
            data: { roundNumber: i + 1 },
        });
    }

    revalidatePath("/");
    revalidatePath("/rounds");
    revalidatePath("/admin");

    // Recalculate handicaps for all involved members
    await Promise.all(validScores.map(s => recalculateMemberHandicap(s.memberId)));

    return round;
}

export async function deleteRound(roundId: string) {
    // Get scores to know which members' handicaps to update
    const roundScores = await prisma.score.findMany({
        where: { roundId },
    });
    const memberIds = roundScores.map(s => s.memberId);

    await prisma.score.deleteMany({
        where: { roundId },
    });

    await prisma.round.delete({
        where: { id: roundId },
    });

    // Re-numbering all rounds by date
    const allRounds = await prisma.round.findMany({
        orderBy: { date: "asc" },
    });

    for (let i = 0; i < allRounds.length; i++) {
        await prisma.round.update({
            where: { id: allRounds[i].id },
            data: { roundNumber: i + 1 },
        });
    }

    // Recalculate handicaps
    await Promise.all(memberIds.map(id => recalculateMemberHandicap(id)));

    revalidatePath("/");
    revalidatePath("/rounds");
    revalidatePath("/admin");
}

export async function deleteMember(memberId: string) {
    // Delete all scores associated with this member first
    await prisma.score.deleteMany({
        where: { memberId },
    });

    await prisma.member.delete({
        where: { id: memberId },
    });

    revalidatePath("/");
    revalidatePath("/rounds");
    revalidatePath("/admin");
}

/* --- Stats Actions --- */

export async function getDashboardStats() {
    try {
        console.log("Fetching dashboard stats...");
        const totalRounds = await prisma.round.count();
        const averageScoreResult = await prisma.score.aggregate({
            _avg: {
                score: true,
            },
        });

        const bestScoreResult = await prisma.score.aggregate({
            _min: {
                score: true,
            },
        });

        return {
            totalRounds,
            averageScore: averageScoreResult._avg.score?.toFixed(1) || "0.0",
            bestScore: bestScoreResult._min.score || "-",
        };
    } catch (error) {
        console.error("Critical error in getDashboardStats:", error);
        throw error;
    }
}
