"use client";

import { useState, useEffect } from "react";
import { getMembers, createMember, deleteMember, updateMember } from "@/lib/actions";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Loader2, Trash2, Edit2, Check, X } from "lucide-react";

export default function MemberManager() {
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [handicap, setHandicap] = useState("0.0");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");

    useEffect(() => {
        loadMembers();
    }, []);

    async function loadMembers() {
        const data = await getMembers();
        setMembers(data);
        setLoading(false);
    }

    async function handleAddMember(e: React.FormEvent) {
        e.preventDefault();
        if (!name) return;

        setLoading(true);
        await createMember(name, "MEMBER", parseFloat(handicap));
        setName("");
        setHandicap("0.0");
        await loadMembers();
    }

    async function handleDeleteMember(id: string, name: string) {
        if (!confirm(`${name} 회원을 삭제하시겠습니까? 관련 모든 스코어 기록도 삭제됩니다.`)) return;

        setLoading(true);
        try {
            await deleteMember(id);
            await loadMembers();
        } catch (error) {
            console.error(error);
            alert("삭제 중 오류가 발생했습니다.");
            setLoading(false);
        }
    }

    async function handleUpdateMember(id: string) {
        if (!editingName.trim()) return;
        setLoading(true);
        try {
            await updateMember(id, editingName);
            setEditingId(null);
            await loadMembers();
        } catch (error) {
            console.error(error);
            alert("수정 중 오류가 발생했습니다.");
            setLoading(false);
        }
    }

    return (
        <div className="space-y-8">
            <section className="premium-card">
                <h2 className="text-xl font-bold gold-text-gradient mb-6 flex items-center">
                    <UserPlus className="mr-2 w-5 h-5 text-[#c5a059]" />
                    신규 회원 등록
                </h2>
                <form onSubmit={handleAddMember} className="flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="이름"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="flex-1 bg-black/50 border border-[#c5a059]/20 rounded-xl px-4 py-3 text-white focus:border-[#c5a059] outline-none transition-all"
                    />
                    <input
                        type="number"
                        step="0.1"
                        placeholder="핸디캡"
                        value={handicap}
                        onChange={(e) => setHandicap(e.target.value)}
                        className="w-full md:w-32 bg-black/50 border border-[#c5a059]/20 rounded-xl px-4 py-3 text-white focus:border-[#c5a059] outline-none transition-all"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-gold flex items-center justify-center min-w-[120px]"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "등록하기"}
                    </button>
                </form>
            </section>

            <section className="premium-card">
                <h2 className="text-xl font-bold gold-text-gradient mb-6">회원 목록</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {members.map((member) => (
                            <motion.div
                                key={member.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-black/40 border border-[#c5a059]/10 rounded-xl p-4 flex justify-between items-center group"
                            >
                                <div className="flex items-center space-x-2">
                                    <div className="flex flex-col">
                                        <button
                                            onClick={() => handleDeleteMember(member.id, member.name)}
                                            className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            title="회원 삭제"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingId(member.id);
                                                setEditingName(member.name);
                                            }}
                                            className="p-1.5 text-gray-500 hover:text-[#c5a059] hover:bg-[#c5a059]/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            title="이름 수정"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div className="ml-2">
                                        {editingId === member.id ? (
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="text"
                                                    value={editingName}
                                                    onChange={(e) => setEditingName(e.target.value)}
                                                    className="bg-black/50 border border-[#c5a059] rounded px-2 py-1 text-white text-sm outline-none w-24"
                                                    autoFocus
                                                />
                                                <button onClick={() => handleUpdateMember(member.id)} className="text-green-500 hover:text-green-400">
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-400">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="font-semibold text-white">{member.name}</p>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">{member.role}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-[#c5a059]">HDCP</p>
                                    <p className="font-bold text-white text-lg">{member.handicap.toFixed(1)}</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </section>
        </div>
    );
}
