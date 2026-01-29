import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const rounds = await prisma.round.findMany({
            include: {
                scores: true,
            },
            orderBy: {
                date: "desc",
            },
        });
        return NextResponse.json(rounds);
    } catch (error) {
        console.error("Failed to fetch rounds:", error);
        return NextResponse.json({ error: "Failed to fetch rounds" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { courseName, date, totalScore, totalPutts, imageUrl, scores } = body;

        const round = await prisma.round.create({
            data: {
                courseName,
                date: new Date(date),
                totalScore,
                totalPutts,
                imageUrl,
                scores: {
                    create: scores.map((s: any) => ({
                        holeNumber: s.holeNumber,
                        score: s.score,
                        putts: s.putts,
                    })),
                },
            },
            include: {
                scores: true,
            },
        });

        return NextResponse.json(round);
    } catch (error) {
        console.error("Failed to create round:", error);
        return NextResponse.json({ error: "Failed to create round" }, { status: 500 });
    }
}
