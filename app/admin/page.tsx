"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, UserPlus, Settings, LayoutDashboard } from "lucide-react";
import MemberManager from "./components/MemberManager";
import RoundManager from "./components/RoundManager";
import Link from "next/link";

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<"members" | "rounds" | "settings">("rounds");

    return (
        <main className="min-h-screen bg-black text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-bold gold-text-gradient mb-2">관리자 대시보드</h1>
                        <p className="text-gray-400">블루마운틴 골프 클럽 데이터 관리 시스템</p>
                    </div>
                    <Link href="/" className="btn-gold flex items-center space-x-2">
                        <LayoutDashboard className="w-5 h-5" />
                        <span>메인 페이지로 이동</span>
                    </Link>
                </header>

                {/* Tab Navigation */}
                <div className="flex space-x-4 mb-8 border-b border-[#c5a059]/20 pb-4 overflow-x-auto">
                    <TabButton
                        active={activeTab === "rounds"}
                        onClick={() => setActiveTab("rounds")}
                        icon={PlusCircle}
                        label="라운딩 등록"
                    />
                    <TabButton
                        active={activeTab === "members"}
                        onClick={() => setActiveTab("members")}
                        icon={UserPlus}
                        label="회원 관리"
                    />
                    <TabButton
                        active={activeTab === "settings"}
                        onClick={() => setActiveTab("settings")}
                        icon={Settings}
                        label="설정"
                    />
                </div>

                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === "rounds" && <RoundManager />}
                    {activeTab === "members" && <MemberManager />}
                    {activeTab === "settings" && (
                        <div className="premium-card text-center py-20">
                            <Settings className="w-12 h-12 text-[#c5a059] mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-semibold mb-2">시스템 설정</h3>
                            <p className="text-gray-400">환경 변수 및 기타 고급 설정 기능이 곧 추가될 예정입니다.</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </main>
    );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center space-x-2 px-6 py-2 rounded-full transition-all ${active
                ? "bg-[#c5a059] text-black font-bold"
                : "bg-[#1e3a2b]/30 text-gray-400 hover:text-white"
                }`}
        >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
        </button>
    );
}
