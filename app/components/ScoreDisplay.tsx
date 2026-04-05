"use client";

import { motion } from "framer-motion";
import { Trophy, Calendar, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { getDashboardStats } from "@/lib/actions";
import Link from "next/link";

interface StatItem {
    label: string;
    value: string;
    icon: any;
    color: string;
    href?: string;
    details?: string | null;
}

export default function ScoreDisplay() {
    const [stats, setStats] = useState<any[]>([
        { label: "총 라운딩", value: "...", icon: Calendar, color: "#c5a059", href: "/rounds" },
        { label: "평균 스코어", value: "...", icon: Trophy, color: "#dfc18d" },
        { label: "최고 기록", value: "...", icon: Target, color: "#8e6d2f" },
    ]);

    useEffect(() => {
        async function loadStats() {
            try {
                const data = await getDashboardStats();
                setStats([
                    { 
                        label: "총 라운딩", 
                        value: data.totalRounds.toString(), 
                        subValue: `'26년: ${data.totalRounds2026}회`,
                        icon: Calendar, 
                        color: "#c5a059", 
                        href: "/rounds" 
                    },
                    { 
                        label: "평균 스코어", 
                        value: data.averageScore, 
                        subValue: `'26년: ${data.averageScore2026}`,
                        icon: Trophy, 
                        color: "#dfc18d" 
                    },
                    {
                        label: "최고 기록",
                        value: data.bestScore.toString(),
                        subValue: `'26년: ${data.bestScore2026}`,
                        icon: Target,
                        color: "#8e6d2f",
                        details: data.bestScoreDetails ? `${data.bestScoreDetails.course} | ${new Date(data.bestScoreDetails.date).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '')}` : null,
                        details2026: data.bestScoreDetails2026 ? `${data.bestScoreDetails2026.course} | ${new Date(data.bestScoreDetails2026.date).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '')}` : null
                    },
                ]);
            } catch (error) {
                console.error("Failed to load dashboard stats:", error);
            }
        }
        loadStats();
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-4 -mt-20 relative z-30">
            {stats.map((stat, index) => {
                const Content = (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.5 }}
                        className={`premium-card group transition-all ${stat.href ? 'hover:border-[#c5a059]/60 cursor-pointer hover:shadow-[0_0_20px_rgba(197,160,89,0.1)]' : 'hover:border-[#c5a059]/40'}`}
                    >
                        <div className="flex items-center space-x-4">
                            <div className="p-3 rounded-xl bg-white/5 group-hover:bg-[#c5a059]/10 transition-colors">
                                <stat.icon className="w-6 h-6 text-[#c5a059]" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
                                    {stat.subValue && (
                                        <p className="text-[11px] text-[#c5a059] font-bold tracking-tight bg-[#c5a059]/10 px-2 py-0.5 rounded-full">
                                            {stat.subValue}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-3xl font-black text-white mt-0.5 flex items-baseline">
                                        {stat.value}
                                        {stat.label === "총 라운딩" && stat.value !== "..." && <span className="text-sm font-bold text-gray-500 ml-1">회</span>}
                                    </h3>
                                    {stat.details && (
                                        <div className="mt-1.5 space-y-0.5">
                                            <p className="text-[10px] text-gray-500 font-medium flex items-center">
                                                <span className="w-1 h-1 rounded-full bg-gray-600 mr-1.5"></span>
                                                최고: {stat.details}
                                            </p>
                                            {stat.details2026 && (
                                                <p className="text-[10px] text-[#c5a059]/80 font-medium flex items-center">
                                                    <span className="w-1 h-1 rounded-full bg-[#c5a059]/60 mr-1.5"></span>
                                                    '26: {stat.details2026}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );

                return stat.href ? (
                    <Link key={stat.label} href={stat.href}>
                        {Content}
                    </Link>
                ) : (
                    <div key={stat.label}>{Content}</div>
                );
            })}
        </div>
    );
}
