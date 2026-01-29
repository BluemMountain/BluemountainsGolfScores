import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";

// Google Fonts setup
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})

export const metadata: Metadata = {
  title: "Bluemountain Golf Score | 프리미엄 골프 기록 관리",
  description: "블루마운틴 골프 클럽 회원을 위한 품격 있는 스코어 관리 서비스",
};

import Link from "next/link";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${inter.variable} ${outfit.variable}`}>
      <body className="antialiased min-h-screen flex flex-col">
        {/* Navigation Placeholder */}
        <nav className="glass sticky top-0 z-50 px-6 py-4 flex justify-between items-center border-b border-white/5">
          <Link href="/" className="text-2xl font-bold gold-gradient">BLUEMOUNTAIN</Link>
          <div className="space-x-8 hidden md:flex text-sm uppercase tracking-widest font-medium">
            <Link href="/records" className="hover:text-primary transition-colors">라운딩 기록</Link>
            <Link href="#" className="hover:text-primary transition-colors">통계</Link>
            <Link href="#" className="hover:text-primary transition-colors">예약</Link>
          </div>
          <button className="px-5 py-2 rounded-full border border-primary text-primary text-xs font-bold hover:bg-primary hover:text-secondary transition-all">
            LOGIN
          </button>
        </nav>

        <main className="flex-grow">
          {children}
        </main>

        {/* Footer Placeholder */}
        <footer className="py-12 px-6 border-t border-white/5 text-center text-gray-500 text-sm">
          <p>© 2026 Bluemountain Golf Club. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
