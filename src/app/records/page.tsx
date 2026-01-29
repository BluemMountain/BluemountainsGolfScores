"use client";

import { useScoreStore } from "@/hooks/useScoreStore";
import { useState } from "react";
import ScoreForm from "@/components/ScoreForm";

export default function RecordsPage() {
    const { records, isLoaded, addRecord, deleteRecord } = useScoreStore();
    const [isAdding, setIsAdding] = useState(false);

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-primary animate-pulse">데이터 로드 중...</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-bold gold-gradient mb-2">라운딩 기록</h1>
                    <p className="text-gray-400">당신의 성과를 한눈에 확인하세요.</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="px-6 py-3 rounded-full bg-primary text-secondary font-bold hover:bg-primary-hover transition-transform transform hover:scale-105"
                    >
                        새 라운딩 추가
                    </button>
                )}
            </div>

            {isAdding ? (
                <div className="flex justify-center py-12">
                    <ScoreForm
                        onSuccess={() => setIsAdding(false)}
                        onCancel={() => setIsAdding(false)}
                        onSubmit={addRecord}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {records.length === 0 ? (
                        <div className="glass p-20 rounded-3xl text-center">
                            <p className="text-gray-500 mb-6 text-lg">아직 기록된 라운딩이 없습니다.</p>
                            <button
                                onClick={() => setIsAdding(true)}
                                className="text-primary font-bold hover:underline"
                            >
                                첫 기록을 남겨보세요 →
                            </button>
                        </div>
                    ) : (
                        records.map((record) => (
                            <div key={record.id} className="glass p-8 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6 animate-fade-in">
                                <div className="flex-grow flex flex-col md:flex-row gap-6 items-center">
                                    {record.imageUrl && (
                                        <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10">
                                            <img src={record.imageUrl} alt="Course" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div>
                                        <div className="flex items-center gap-4 mb-2">
                                            <span className="text-sm font-medium text-primary px-3 py-1 bg-primary/10 rounded-full">
                                                {new Date(record.date).toLocaleDateString('ko-KR')}
                                            </span>
                                            <h3 className="text-xl font-bold">{record.courseName}</h3>
                                        </div>
                                        <div className="flex gap-8 text-sm">
                                            <div>
                                                <span className="text-gray-500">총 타수:</span>{" "}
                                                <span className="font-bold text-white text-lg">{record.totalScore}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">퍼트 수:</span>{" "}
                                                <span className="font-bold text-white text-lg">{record.totalPutts}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button className="px-5 py-2 rounded-xl border border-white/5 hover:bg-white/5 transition-colors text-sm">
                                        상세보기
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm('정말 삭제하시겠습니까?')) deleteRecord(record.id)
                                        }}
                                        className="px-5 py-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors text-sm"
                                    >
                                        삭제
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
