"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";

interface ScoreFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    onSubmit: (data: {
        courseName: string;
        date: string;
        imageUrl?: string;
        scores: { holeNumber: number; score: number; putts: number }[]
    }) => void;
}

export default function ScoreForm({ onSuccess, onCancel, onSubmit }: ScoreFormProps) {
    const [courseName, setCourseName] = useState("블루마운틴 CC");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [imageUrl, setImageUrl] = useState<string | undefined>();
    const [scores, setScores] = useState(
        Array.from({ length: 18 }, (_, i) => ({
            holeNumber: i + 1,
            score: 4,
            putts: 2,
        }))
    );

    const handleScoreChange = (holeIdx: number, field: "score" | "putts", value: number) => {
        const newScores = [...scores];
        newScores[holeIdx][field] = value;
        setScores(newScores);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ courseName, date, imageUrl, scores });
        onSuccess();
    };

    return (
        <div className="glass p-8 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-fade-in">
            <h2 className="text-3xl font-bold mb-8 gold-gradient">신규 라운딩 기록</h2>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">코스 이름</label>
                            <input
                                type="text"
                                value={courseName}
                                onChange={(e) => setCourseName(e.target.value)}
                                className="w-full bg-secondary/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">라운딩 날짜</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-secondary/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl p-6 bg-white/5">
                        {imageUrl ? (
                            <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4">
                                <img src={imageUrl} alt="Round Photo" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => setImageUrl(undefined)}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full text-xs"
                                >
                                    삭제
                                </button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <CldUploadWidget
                                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                                    options={{
                                        folder: process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER,
                                        maxFiles: 1,
                                    }}
                                    onSuccess={(result: any) => {
                                        if (result.info && typeof result.info !== 'string') {
                                            setImageUrl(result.info.secure_url);
                                        }
                                    }}
                                >
                                    {({ open }) => (
                                        <button
                                            type="button"
                                            onClick={() => open()}
                                            className="flex flex-col items-center gap-2 text-gray-400 hover:text-primary transition-colors"
                                        >
                                            <span className="text-4xl">📸</span>
                                            <span className="text-sm font-medium">라운딩 사진 업로드</span>
                                        </button>
                                    )}
                                </CldUploadWidget>
                            </div>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 text-xs uppercase tracking-widest text-gray-500">
                                <th className="py-4 px-2">HOLE</th>
                                <th className="py-4 px-2">SCORE</th>
                                <th className="py-4 px-2">PUTTS</th>
                                <th className="py-4 px-2 hidden sm:table-cell">HOLE</th>
                                <th className="py-4 px-2 hidden sm:table-cell">SCORE</th>
                                <th className="py-4 px-2 hidden sm:table-cell">PUTTS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                    {/* First column (1-9) */}
                                    <td className="py-3 px-2 font-bold text-primary">{i + 1}</td>
                                    <td className="py-3 px-2">
                                        <input
                                            type="number"
                                            value={scores[i].score}
                                            onChange={(e) => handleScoreChange(i, "score", parseInt(e.target.value))}
                                            className="w-16 bg-black/30 border border-white/10 rounded-lg px-2 py-1 focus:outline-none focus:border-primary"
                                        />
                                    </td>
                                    <td className="py-3 px-2">
                                        <input
                                            type="number"
                                            value={scores[i].putts}
                                            onChange={(e) => handleScoreChange(i, "putts", parseInt(e.target.value))}
                                            className="w-16 bg-black/30 border border-white/10 rounded-lg px-2 py-1 focus:outline-none focus:border-primary"
                                        />
                                    </td>
                                    {/* Second column (10-18) */}
                                    <td className="py-3 px-2 font-bold text-primary hidden sm:table-cell">{i + 10}</td>
                                    <td className="py-3 px-2 hidden sm:table-cell">
                                        <input
                                            type="number"
                                            value={scores[i + 9].score}
                                            onChange={(e) => handleScoreChange(i + 9, "score", parseInt(e.target.value))}
                                            className="w-16 bg-black/30 border border-white/10 rounded-lg px-2 py-1 focus:outline-none focus:border-primary"
                                        />
                                    </td>
                                    <td className="py-3 px-2 hidden sm:table-cell">
                                        <input
                                            type="number"
                                            value={scores[i + 9].putts}
                                            onChange={(e) => handleScoreChange(i + 9, "putts", parseInt(e.target.value))}
                                            className="w-16 bg-black/30 border border-white/10 rounded-lg px-2 py-1 focus:outline-none focus:border-primary"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        className="px-8 py-3 rounded-xl bg-primary text-secondary font-bold hover:bg-primary-hover transition-all transform hover:scale-105"
                    >
                        기록 저장
                    </button>
                </div>
            </form>
        </div>
    );
}
