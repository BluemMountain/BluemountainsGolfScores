"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Settings } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black z-10" />

            {/* Background decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#c5a059]/5 blur-[120px] rounded-full z-0" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-20 text-center px-4"
            >
                <h2 className="text-[#c5a059] font-serif tracking-widest text-lg md:text-xl mb-4 uppercase">
                    블루마운틴 골프 클럽
                </h2>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
                    성과를 <span className="gold-text-gradient">한눈에</span> 확인하세요
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-8">
                    당신의 라운딩 데이터를 기반으로 한 체계적인 스코어 관리 시스템
                </p>
                <div className="flex justify-center space-x-4">
                    <Link href="/admin" className="btn-gold flex items-center space-x-2">
                        <Settings className="w-5 h-5" />
                        <span>관리자 대시보드</span>
                    </Link>
                </div>
            </motion.div>
        </section>
    );
}
