import type { Metadata } from "next";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import "./globals.css";

const sans = Noto_Sans_KR({
    subsets: ["latin"],
    variable: "--font-sans",
});

const serif = Noto_Serif_KR({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--font-serif",
});

export const metadata: Metadata = {
    title: "BlueMountain Golf Club",
    description: "성과를 한눈에 확인하세요 - 블루마운틴 골프 클럽 스코어 관리",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko" className={`${sans.variable} ${serif.variable}`}>
            <body className="font-sans antialiased">{children}</body>
        </html>
    );
}
