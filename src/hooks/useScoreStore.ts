"use client";

import { useState, useEffect } from "react";

export interface HoleScore {
    holeNumber: number;
    score: number;
    putts: number;
}

export interface RoundRecord {
    id: string;
    date: string;
    courseName: string;
    imageUrl?: string;
    scores: HoleScore[];
    totalScore: number;
    totalPutts: number;
}

export const useScoreStore = () => {
    const [records, setRecords] = useState<RoundRecord[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const fetchRecords = async () => {
        try {
            const response = await fetch("/api/rounds");
            if (response.ok) {
                const data = await response.json();
                setRecords(data);
            }
        } catch (e) {
            console.error("Failed to fetch records", e);
        } finally {
            setIsLoaded(true);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const addRecord = async (record: Omit<RoundRecord, "id" | "totalScore" | "totalPutts"> & { imageUrl?: string }) => {
        const totalScore = record.scores.reduce((acc, curr) => acc + curr.score, 0);
        const totalPutts = record.scores.reduce((acc, curr) => acc + curr.putts, 0);

        try {
            const response = await fetch("/api/rounds", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...record, totalScore, totalPutts }),
            });

            if (response.ok) {
                fetchRecords();
            }
        } catch (e) {
            console.error("Failed to add record", e);
        }
    };

    const deleteRecord = async (id: string) => {
        try {
            const response = await fetch(`/api/rounds/${id}`, {
                method: "DELETE",
            });
            if (response.ok) {
                setRecords((prev) => prev.filter((r) => r.id !== id));
            }
        } catch (e) {
            console.error("Failed to delete record", e);
        }
    };

    return {
        records,
        isLoaded,
        addRecord,
        deleteRecord,
        refresh: fetchRecords
    };
};
