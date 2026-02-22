"use client";

import { useState, useEffect } from "react";
import { getMembers, createRound, analyzeScoreImage, getRounds, deleteRound, updateRoundInfo } from "@/lib/actions";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, MapPin, Save, Loader2, PlusCircle, Camera, Sparkles, Trash2, History, X, Edit2 } from "lucide-react";

export default function RoundManager() {
    const [members, setMembers] = useState<any[]>([]);
    const [rounds, setRounds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [analyzingStatus, setAnalyzingStatus] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [course, setCourse] = useState("");
    const [scores, setScores] = useState<Record<string, { memberId?: string, name: string, score: string, frontScore?: number | null, backScore?: number | null }>>({});
    const [selectedRound, setSelectedRound] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editRoundData, setEditRoundData] = useState<any>({ date: "", course: "", scores: [] });

    useEffect(() => {
        loadData();
    }, []);

    // Sync editRoundData when a round is selected
    useEffect(() => {
        if (selectedRound) {
            const dateObj = new Date(selectedRound.date);
            const y = dateObj.getFullYear();
            const m = String(dateObj.getMonth() + 1).padStart(2, '0');
            const d = String(dateObj.getDate()).padStart(2, '0');
            const dateString = `${y}-${m}-${d}`;

            setEditRoundData({
                date: dateString,
                course: selectedRound.course,
                scores: (selectedRound.scores || []).map((s: any) => ({
                    scoreId: s.id,
                    memberName: s.member?.name || "알 수 없음",
                    score: (s.score || 0).toString(),
                    frontScore: s.frontScore?.toString() || "",
                    backScore: s.backScore?.toString() || ""
                }))
            });
        }
    }, [selectedRound]);

    async function loadData() {
        setLoading(true);
        const [membersData, roundsData] = await Promise.all([
            getMembers(),
            getRounds()
        ]);
        setMembers(membersData);
        setRounds(roundsData);

        // Find Park Cheong-san
        const park = membersData.find((m: any) => m.name === "박청산");

        // Initialize scores with exactly 4 slots as requested
        const initialScores: Record<string, any> = {};

        // Slot 1: Park Cheong-san (if exists)
        if (park) {
            initialScores[park.id] = { memberId: park.id, name: park.name, score: "", frontScore: null, backScore: null };
        } else {
            // Fallback if Park is not in DB for some reason, but we'll use a placeholder
            initialScores["default-park"] = { name: "박청산", score: "", frontScore: null, backScore: null };
        }

        // Slots 2-4: Empty placeholders
        for (let i = 1; i <= 3; i++) {
            initialScores[`placeholder-${i}`] = { name: "", score: "", frontScore: null, backScore: null };
        }

        setScores(initialScores);
        setLoading(false);
    }

    function handleOpenDetails(round: any) {
        setSelectedRound(round);
        setIsEditing(false);
    }

    async function handleUpdateRound() {
        if (!editRoundData.course) {
            alert("코스 이름을 입력해 주세요.");
            return;
        }

        setLoading(true);
        try {
            await updateRoundInfo(
                selectedRound.id,
                new Date(editRoundData.date),
                editRoundData.course,
                editRoundData.scores.map((s: any) => ({
                    scoreId: s.scoreId,
                    score: parseInt(s.score),
                    frontScore: s.frontScore ? parseInt(s.frontScore) : null,
                    backScore: s.backScore ? parseInt(s.backScore) : null
                }))
            );
            alert("라운딩 정보가 수정되었습니다!");
            setIsEditing(false);
            setSelectedRound(null);
            await loadData();
        } catch (error) {
            console.error(error);
            alert("수정 저장 중 오류가 발생했습니다.");
            setLoading(false);
        }
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setAnalyzing(true);
        setAnalyzingStatus("사진 압축 중...");
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const originalBase64 = reader.result as string;

                // Client-side resizing to stay under Vercel payload limits (4.5MB)
                const base64 = await new Promise<string>((resolve, reject) => {
                    const img = new Image();
                    img.src = originalBase64;
                    img.onerror = () => reject(new Error("이미지를 불러올 수 없습니다."));
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;
                        const max_size = 1000; // Optimized for faster upload and AI processing

                        if (width > height) {
                            if (width > max_size) {
                                height *= max_size / width;
                                width = max_size;
                            }
                        } else {
                            if (height > max_size) {
                                width *= max_size / height;
                                height = max_size;
                            }
                        }
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx?.drawImage(img, 0, 0, width, height);
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                        console.log(`Original size: ${originalBase64.length}, Optimized size: ${dataUrl.length}`);
                        resolve(dataUrl);
                    };
                });

                setAnalyzingStatus("AI 데이터 분석 중...");
                try {
                    const response = await analyzeScoreImage(base64);

                    if (!response.success) {
                        alert(`AI 분석 오류: ${response.error}`);
                        setAnalyzing(false);
                        setAnalyzingStatus("");
                        return;
                    }

                    const result = response.data;

                    if (result.date) setDate(result.date);
                    if (result.course) setCourse(result.course);

                    // Fresh slate for AI results
                    const newScores: Record<string, any> = {};

                    result.results?.forEach((item: any, idx: number) => {
                        // Find member by name
                        const member = members.find(m => m.name.includes(item.name) || item.name.includes(m.name));
                        const key = member ? member.id : `new-${idx}-${item.name}`;

                        newScores[key] = {
                            memberId: member?.id,
                            name: member ? member.name : item.name,
                            score: item.score.toString(),
                            frontScore: item.frontScore,
                            backScore: item.backScore
                        };
                    });

                    // If Park Cheong-san wasn't in the AI results, keep him in the list if he was already there or add him
                    const park = members.find((m: any) => m.name === "박청산");
                    if (park && !newScores[park.id]) {
                        // We can either add him at the top or just leave him out if he didn't play.
                        // Usually he's always there, so let's ensure he stays if the user wants.
                        // But if it's AI analysis, maybe we should only show who was in the photo?
                        // Let's stick to the AI results but ensure others can be added manually.
                    }

                    setScores(newScores);
                    alert("AI가 성적표를 분석하여 데이터를 입력했습니다. 신규 인원은 저장 시 자동으로 등록됩니다.");
                } catch (err: any) {
                    console.error(err);
                    alert(err.message || "AI 분석 중 오류가 발생했습니다. 직접 입력해 주세요.");
                } finally {
                    setAnalyzing(false);
                    setAnalyzingStatus("");
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error(error);
            setAnalyzing(false);
            setAnalyzingStatus("");
        }
    }

    async function handleSaveRound() {
        if (!course) {
            alert("코스 이름을 입력해 주세요.");
            return;
        }

        const scoresData = Object.values(scores)
            .filter((s) => s.name.trim() !== "" && s.score !== "")
            .map((s) => ({
                memberId: s.memberId,
                name: s.name,
                score: parseInt(s.score),
                frontScore: s.frontScore || null,
                backScore: s.backScore || null,
            }));

        if (scoresData.length === 0) {
            alert("최소 한 명 이상의 인원과 스코어를 입력해 주세요.");
            return;
        }

        setLoading(true);
        try {
            await createRound(new Date(date), course, scoresData);
            alert("라운딩 기록이 저장되었습니다! 신규 회원은 자동으로 등록되었습니다.");
            setCourse("");
            await loadData();
        } catch (error) {
            console.error(error);
            alert("저장 중 오류가 발생했습니다.");
            setLoading(false);
        }
    }

    async function handleDeleteRound(id: string, roundNumber: number, e: React.MouseEvent) {
        e.stopPropagation();
        if (!confirm(`Round ${roundNumber} 기록을 삭제하시겠습니까?`)) return;

        setLoading(true);
        try {
            await deleteRound(id);
            await loadData();
        } catch (error) {
            console.error(error);
            alert("삭제 중 오류가 발생했습니다.");
            setLoading(false);
        }
    }

    return (
        <div className="space-y-8">
            <section className="premium-card">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold gold-text-gradient flex items-center">
                        <PlusCircle className="mr-2 w-5 h-5 text-[#c5a059]" />
                        라운딩 정보 입력
                    </h2>

                    <label className="cursor-pointer group">
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={analyzing} />
                        <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl border border-[#c5a059]/30 transition-all ${analyzing ? 'opacity-50' : 'hover:bg-[#c5a059]/10'}`}>
                            {analyzing ? <Loader2 className="w-5 h-5 animate-spin text-[#c5a059]" /> : <Camera className="w-5 h-5 text-[#c5a059]" />}
                            <span className="text-sm font-medium">
                                {analyzing ? (analyzingStatus || "AI 분석 중...") : "AI 사진 분석"}
                            </span>
                            {!analyzing && <Sparkles className="w-4 h-4 text-[#c5a059] opacity-50 group-hover:opacity-100" />}
                        </div>
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 flex items-center space-x-2">
                            <CalendarIcon className="w-4 h-4" /> <span>날짜</span>
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-black/50 border border-[#c5a059]/20 rounded-xl px-4 py-3 text-white focus:border-[#c5a059] outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 flex items-center space-x-2">
                            <MapPin className="w-4 h-4" /> <span>코스 이름</span>
                        </label>
                        <input
                            type="text"
                            placeholder="예: 블루마운틴 CC"
                            value={course}
                            onChange={(e) => setCourse(e.target.value)}
                            className="w-full bg-black/50 border border-[#c5a059]/20 rounded-xl px-4 py-3 text-white focus:border-[#c5a059] outline-none transition-all"
                        />
                    </div>
                </div>

                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    라운딩 멤버 및 스코어
                    <span className="ml-3 text-xs font-normal text-gray-500 bg-white/5 px-2 py-1 rounded">총 {Object.values(scores).filter(s => s.name).length}명</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                    {Object.entries(scores).map(([key, s]) => {
                        const isPlaceholder = key.startsWith('placeholder-');
                        const isPark = s.name === "박청산";

                        return (
                            <div key={key} className={`bg-black/30 border ${isPark ? 'border-[#c5a059]/40 bg-[#c5a059]/5' : (s.memberId ? 'border-[#c5a059]/10' : 'border-blue-500/20')} rounded-xl p-3 space-y-3 relative group`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        {(isPlaceholder || !s.memberId) && !isPark ? (
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="이름 입력"
                                                    value={s.name}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        // If user types a name that matches an existing member, we could auto-link it
                                                        // For now, just update the name
                                                        setScores({
                                                            ...scores,
                                                            [key]: { ...s, name: val, memberId: undefined }
                                                        });
                                                    }}
                                                    className="w-full bg-transparent border-b border-[#c5a059]/20 text-sm font-medium text-white focus:border-[#c5a059] outline-none py-0.5"
                                                />
                                                {s.name && !s.memberId && (
                                                    <div className="absolute top-full left-0 right-0 z-10 mt-1 max-h-32 overflow-y-auto bg-black border border-[#c5a059]/30 rounded-lg shadow-xl hidden group-focus-within:block">
                                                        {members
                                                            .filter(m => m.name.includes(s.name) && !Object.values(scores).some(sc => sc.memberId === m.id))
                                                            .map(m => (
                                                                <button
                                                                    key={m.id}
                                                                    onClick={() => {
                                                                        setScores({
                                                                            ...scores,
                                                                            [key]: { ...s, name: m.name, memberId: m.id }
                                                                        });
                                                                    }}
                                                                    className="w-full text-left px-3 py-2 text-xs text-white hover:bg-[#c5a059]/20 transition-colors border-b border-white/5 last:border-0"
                                                                >
                                                                    {m.name} <span className="text-[10px] text-gray-500 ml-1">(기존 회원)</span>
                                                                </button>
                                                            ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className={`text-sm font-medium ${isPark ? 'text-[#ffcc00] font-bold' : 'text-white'}`}>
                                                {s.name}
                                                {s.memberId && !isPark && <span className="ml-1 text-[10px] text-gray-500 font-normal">(기존)</span>}
                                            </span>
                                        )}
                                    </div>
                                    {!isPark && (
                                        <button
                                            onClick={() => {
                                                const newScores = { ...scores };
                                                delete newScores[key];
                                                // If we delete a slot and have less than 4, maybe add back a placeholder?
                                                // Or just let it be. Let's filter out empty ones on save.
                                                setScores(newScores);
                                            }}
                                            className="p-1 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-gray-500 text-center uppercase">Out</p>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={s.frontScore || ""}
                                            onChange={(e) => {
                                                const front = e.target.value ? parseInt(e.target.value) : 0;
                                                const back = s.backScore || 0;
                                                setScores({
                                                    ...scores,
                                                    [key]: {
                                                        ...s,
                                                        frontScore: e.target.value ? parseInt(e.target.value) : null,
                                                        score: (front + (back || 0)).toString()
                                                    }
                                                });
                                            }}
                                            className="w-full bg-black/50 border border-[#c5a059]/20 rounded-lg px-1 py-1 text-center text-white focus:border-[#c5a059] outline-none text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-gray-500 text-center uppercase">In</p>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={s.backScore || ""}
                                            onChange={(e) => {
                                                const back = e.target.value ? parseInt(e.target.value) : 0;
                                                const front = s.frontScore || 0;
                                                setScores({
                                                    ...scores,
                                                    [key]: {
                                                        ...s,
                                                        backScore: e.target.value ? parseInt(e.target.value) : null,
                                                        score: ((front || 0) + back).toString()
                                                    }
                                                });
                                            }}
                                            className="w-full bg-black/50 border border-[#c5a059]/20 rounded-lg px-1 py-1 text-center text-white focus:border-[#c5a059] outline-none text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-[#c5a059] text-center uppercase font-bold">Total</p>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={s.score}
                                            onChange={(e) => setScores({ ...scores, [key]: { ...s, score: e.target.value } })}
                                            className="w-full bg-[#c5a059]/10 border border-[#c5a059]/40 rounded-lg px-1 py-1 text-center text-white focus:border-[#c5a059] outline-none text-sm font-bold"
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Add Slot Button */}
                    <button
                        onClick={() => {
                            const newId = `placeholder-${Date.now()}`;
                            setScores({
                                ...scores,
                                [newId]: { name: "", score: "", frontScore: null, backScore: null }
                            });
                        }}
                        className="border-2 border-dashed border-[#c5a059]/20 rounded-xl p-3 flex flex-col items-center justify-center text-gray-500 hover:border-[#c5a059]/40 hover:text-[#c5a059] transition-all group min-h-[100px]"
                    >
                        <PlusCircle className="w-6 h-6 mb-2 opacity-50 group-hover:opacity-100" />
                        <span className="text-xs font-medium">멤버 추가</span>
                    </button>
                </div>

                <button
                    onClick={handleSaveRound}
                    disabled={loading}
                    className="btn-gold w-full flex items-center justify-center space-x-2 py-4"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                            <Save className="w-5 h-5" />
                            <span>전체 라운딩 기록 저장</span>
                        </>
                    )}
                </button>
            </section>

            <section className="premium-card">
                <h2 className="text-xl font-bold gold-text-gradient mb-6 flex items-center">
                    <History className="mr-2 w-5 h-5 text-[#c5a059]" />
                    최근 라운딩 기록 관리
                </h2>

                <div className="space-y-4">
                    {rounds.length === 0 ? (
                        <p className="text-center text-gray-500 py-10">등록된 라운딩이 없습니다.</p>
                    ) : (
                        rounds.map((round) => (
                            <div
                                key={round.id}
                                onClick={() => handleOpenDetails(round)}
                                className="bg-black/40 border border-[#c5a059]/10 rounded-xl p-4 flex justify-between items-center group cursor-pointer hover:bg-[#c5a059]/5 transition-all"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="text-center min-w-[60px]">
                                        <p className="text-[10px] text-[#c5a059] font-bold uppercase">Round</p>
                                        <p className="text-xl font-black text-white">{round.roundNumber}</p>
                                    </div>
                                    <div className="h-8 w-[1px] bg-[#c5a059]/20"></div>
                                    <div>
                                        <div className="flex items-center text-xs text-gray-500 mb-1">
                                            <CalendarIcon className="w-3 h-3 mr-1" />
                                            {new Date(round.date).toLocaleDateString()}
                                        </div>
                                        <p className="font-bold text-white uppercase tracking-tight">{round.course}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="hidden md:flex -space-x-2">
                                        {round.scores.slice(0, 4).map((s: any) => (
                                            <div key={s.id} className="w-8 h-8 rounded-full bg-[#1e3a2b] border border-[#c5a059]/30 flex items-center justify-center text-[10px] font-bold text-[#dfc18d] shadow-lg" title={`${s.member.name}: ${s.score}`}>
                                                {s.score}
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={(e) => handleDeleteRound(round.id, round.roundNumber, e)}
                                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Detailed View Modal */}
            <AnimatePresence>
                {selectedRound && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="premium-card max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold gold-text-gradient">
                                        Round {selectedRound.roundNumber} {isEditing ? '기록 수정' : '상세 기록'}
                                    </h3>
                                    <p className="text-gray-400 text-sm flex items-center mt-1">
                                        <MapPin className="w-3 h-3 mr-1" /> {selectedRound.course} | <CalendarIcon className="w-3 h-3 mx-1" /> {new Date(selectedRound.date).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {!isEditing && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="p-2 text-[#c5a059] hover:bg-[#c5a059]/10 rounded-lg transition-all"
                                            title="수정하기"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setSelectedRound(null)}
                                        className="p-2 text-gray-400 hover:text-white"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {isEditing ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-500">날짜</label>
                                            <input
                                                type="date"
                                                value={editRoundData.date}
                                                onChange={(e) => setEditRoundData({ ...editRoundData, date: e.target.value })}
                                                className="w-full bg-black/50 border border-[#c5a059]/30 rounded-lg px-3 py-2 text-sm text-white focus:border-[#c5a059] outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-500">골프장</label>
                                            <input
                                                type="text"
                                                value={editRoundData.course}
                                                onChange={(e) => setEditRoundData({ ...editRoundData, course: e.target.value })}
                                                className="w-full bg-black/50 border border-[#c5a059]/30 rounded-lg px-3 py-2 text-sm text-white focus:border-[#c5a059] outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="overflow-hidden border border-[#c5a059]/20 rounded-xl">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-[#c5a059]/10 text-[#c5a059] font-bold uppercase">
                                                <tr>
                                                    <th className="px-3 py-2">이름</th>
                                                    <th className="px-3 py-2 text-center">전반</th>
                                                    <th className="px-3 py-2 text-center">후반</th>
                                                    <th className="px-3 py-2 text-center">전체</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#c5a059]/10">
                                                {editRoundData.scores && editRoundData.scores.length > 0 ? (
                                                    editRoundData.scores.map((s: any, idx: number) => (
                                                        <tr key={s.scoreId || idx}>
                                                            <td className="px-3 py-2 text-white">{s.memberName}</td>
                                                            <td className="px-3 py-2">
                                                                <input
                                                                    type="number"
                                                                    value={s.frontScore}
                                                                    onChange={(e) => {
                                                                        const newScores = [...editRoundData.scores];
                                                                        newScores[idx].frontScore = e.target.value;
                                                                        const front = parseInt(e.target.value) || 0;
                                                                        const back = parseInt(newScores[idx].backScore) || 0;
                                                                        newScores[idx].score = (front + back).toString();
                                                                        setEditRoundData({ ...editRoundData, scores: newScores });
                                                                    }}
                                                                    className="w-full bg-black/30 border border-[#c5a059]/20 rounded px-1 py-1 text-center text-white outline-none"
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <input
                                                                    type="number"
                                                                    value={s.backScore}
                                                                    onChange={(e) => {
                                                                        const newScores = [...editRoundData.scores];
                                                                        newScores[idx].backScore = e.target.value;
                                                                        const back = parseInt(e.target.value) || 0;
                                                                        const front = parseInt(newScores[idx].frontScore) || 0;
                                                                        newScores[idx].score = (front + back).toString();
                                                                        setEditRoundData({ ...editRoundData, scores: newScores });
                                                                    }}
                                                                    className="w-full bg-black/30 border border-[#c5a059]/20 rounded px-1 py-1 text-center text-white outline-none"
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <input
                                                                    type="number"
                                                                    value={s.score}
                                                                    onChange={(e) => {
                                                                        const newScores = [...editRoundData.scores];
                                                                        newScores[idx].score = e.target.value;
                                                                        setEditRoundData({ ...editRoundData, scores: newScores });
                                                                    }}
                                                                    className="w-full bg-black/30 border border-[#c5a059]/40 rounded px-1 py-1 text-center text-white font-bold outline-none"
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={4} className="px-3 py-10 text-center text-gray-500">데이터를 불러오는 중이거나 스코어 정보가 없습니다.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="flex space-x-3">
                                        <button onClick={() => setIsEditing(false)} className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-400 hover:text-white transition-all">취소</button>
                                        <button onClick={handleUpdateRound} className="flex-1 btn-gold py-3">저장하기</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-hidden border border-[#c5a059]/20 rounded-xl">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-[#c5a059]/10 text-[#c5a059] font-bold uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-4 py-3">이름</th>
                                                    <th className="px-4 py-3 text-center">전반</th>
                                                    <th className="px-4 py-3 text-center">후반</th>
                                                    <th className="px-4 py-3 text-center">전체</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#c5a059]/10">
                                                {[...selectedRound.scores]
                                                    .sort((a: any, b: any) => a.score - b.score) // Lowest score first
                                                    .map((s: any) => (
                                                        <tr key={s.id} className="hover:bg-white/5 transition-colors">
                                                            <td className={`px-4 py-3 font-medium ${s.member.name === '박청산' ? 'text-[#ffcc00]' : 'text-white'}`}>
                                                                {s.member.name}
                                                            </td>
                                                            <td className="px-4 py-3 text-center text-gray-400">
                                                                {s.frontScore || '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-center text-gray-400">
                                                                {s.backScore || '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-center font-bold text-[#c5a059]">
                                                                {s.score}
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <button
                                        onClick={() => setSelectedRound(null)}
                                        className="btn-gold w-full mt-8 py-3"
                                    >
                                        닫기
                                    </button>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

