"use client";

import { useEffect, useState } from "react";
export const dynamic = "force-dynamic";

import { getRounds } from "@/lib/actions";
import { motion } from "framer-motion";
import { Calendar, MapPin, ChevronLeft, Trophy } from "lucide-react";
import Link from "next/link";

export default function RoundsPage() {
    const [rounds, setRounds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadRounds() {
            const data = await getRounds();
            setRounds(data);
            setLoading(false);
        }
        loadRounds();
    }, []);

    return (
        <main className="min-h-screen bg-black text-white p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex items-center space-x-4 mb-12">
                    <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6 text-[#c5a059]" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold gold-text-gradient">전체 라운딩 기록</h1>
                        <p className="text-gray-400 text-sm">지금까지의 모든 골프 여정</p>
                    </div>
                </header>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 border-[#c5a059] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : rounds.length === 0 ? (
                    <div className="premium-card text-center py-20">
                        <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">등록된 라운딩 기록이 없습니다.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {rounds.map((round, index) => (
                            <motion.div
                                key={round.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="premium-card relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Trophy className="w-16 h-16 text-[#c5a059]" />
                                </div>

                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-3">
                                            <span className="bg-[#c5a059] text-black text-xs font-bold px-2 py-1 rounded">
                                                ROUND {round.roundNumber}
                                            </span>
                                            <div className="flex items-center text-gray-400 text-sm">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                {new Date(round.date).toLocaleDateString('ko-KR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold flex items-center">
                                            <MapPin className="w-5 h-5 mr-2 text-[#c5a059]" />
                                            {round.course}
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {round.scores.map((score: any) => (
                                            <div key={score.id} className="bg-white/5 rounded-lg p-3 border border-white/5 hover:border-[#c5a059]/20 transition-colors">
                                                <p className="text-xs text-gray-500 mb-1">{score.member.name}</p>
                                                <p className="text-lg font-bold text-[#c5a059]">{score.score}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
