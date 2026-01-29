import Link from "next/link";

export default function Home() {
  return (
    <div className="relative isolate px-6 pt-14 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-accent opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>

      <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center animate-fade-in">
        <h1 className="text-5xl font-bold tracking-tight sm:text-7xl mb-6">
          품격 있는 골프의 완성<br />
          <span className="gold-gradient">Bluemountain Score</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-400 max-w-xl mx-auto">
          단순한 기록을 넘어 당신의 성장을 분석합니다.<br />
          블루마운틴 골프 클럽에서 최상의 라운딩 경험을 기록하십시오.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/records"
            className="rounded-full bg-primary px-8 py-4 text-sm font-semibold text-secondary shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all transform hover:scale-105"
          >
            기록 시작하기
          </Link>
          <a href="#" className="text-sm font-semibold leading-6 hover:text-primary transition-colors">
            자세히 알아보기 <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      {/* Feature Section Preview */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="glass p-8 rounded-3xl">
            <div className="text-primary mb-4 text-3xl">📊</div>
            <h3 className="text-xl font-bold mb-2">정밀 통계</h3>
            <p className="text-gray-400 text-sm">라운딩별 평균 타수 및 핸디캡 분석</p>
          </div>
          <div className="glass p-8 rounded-3xl">
            <div className="text-primary mb-4 text-3xl">⛳</div>
            <h3 className="text-xl font-bold mb-2">실시간 기록</h3>
            <p className="text-gray-400 text-sm">현장에서 즉석으로 입력하는 간편한 인터페이스</p>
          </div>
          <div className="glass p-8 rounded-3xl">
            <div className="text-primary mb-4 text-3xl">📅</div>
            <h3 className="text-xl font-bold mb-2">예약 연동</h3>
            <p className="text-gray-400 text-sm">블루마운틴 라운딩 일정과 간편한 연동</p>
          </div>
        </div>
      </div>
    </div>
  );
}
