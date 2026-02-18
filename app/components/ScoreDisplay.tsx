"use client";

import { motion } from "framer-motion";
import { Trophy, Calendar, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { getDashboardStats } from "@/lib/actions";
import Link from "next/link";

export default function ScoreDisplay() {
    const [stats, setStats] = useState([
        { label: "총 라운딩", value: "...", icon: Calendar, color: "#c5a059", href: "/rounds" },
        { label: "평균 스코어", value: "...", icon: Trophy, color: "#dfc18d" },
        { label: "최고 기록", value: "...", icon: Target, color: "#8e6d2f" },
    ]);

    useEffect(() => {
        async function loadStats() {
            try {
                const data = await getDashboardStats();
                if (data.error) {
                    const errorMessage = data.error.slice(0, 20);
                    setStats([
                        { label: "총 라운딩", value: errorMessage, icon: Calendar, color: "#ef4444", href: "/rounds" },
                        { label: "평균 스코어", value: errorMessage, icon: Trophy, color: "#ef4444" },
                        { label: "최고 기록", value: errorMessage, icon: Target, color: "#ef4444" },
                    ]);
                } else {
                    setStats([
                        { label: "총 라운딩", value: data.totalRounds.toString(), icon: Calendar, color: "#c5a059", href: "/rounds" },
                        { label: "평균 스코어", value: data.averageScore, icon: Trophy, color: "#dfc18d" },
                        { label: "최고 기록", value: data.bestScore.toString(), icon: Target, color: "#8e6d2f" },
                    ]);
                }
            } catch (error: any) {
                console.error("Failed to load dashboard stats:", error);
                const errorMessage = error.message?.slice(0, 15) || "ERR";
                setStats([
                    { label: "총 라운딩", value: errorMessage, icon: Calendar, color: "#ef4444", href: "/rounds" },
                    { label: "평균 스코어", value: errorMessage, icon: Trophy, color: "#ef4444" },
                    { label: "최고 기록", value: errorMessage, icon: Target, color: "#ef4444" },
                ]);
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
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                                <h3 className="text-3xl font-bold text-white mt-1">
                                    {stat.value}
                                    {stat.label === "총 라운딩" && <span className="text-lg font-normal text-gray-400 ml-1">회</span>}
                                </h3>
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
