import Hero from "./components/Hero";
import ScoreDisplay from "./components/ScoreDisplay";

export const dynamic = "force-dynamic";

export default function Home() {
    return (
        <main className="min-h-screen bg-black">
            <Hero />
            <div className="pb-20">
                <ScoreDisplay />

                {/* Placeholder for more content */}
                <div className="max-w-5xl mx-auto px-4 mt-20">
                    <div className="premium-card text-center">
                        <h3 className="text-xl font-semibold mb-2">최근 활동</h3>
                        <p className="text-gray-400">등록된 최근 활동이 없습니다. 관리자 페이지에서 스코어를 등록해 보세요.</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
