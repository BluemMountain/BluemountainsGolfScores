import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DebugPage() {
    console.log("Debug page: starting database check");
    const connectionString = process.env.DATABASE_URL || "NOT SET";

    try {
        const memberCount = await prisma.member.count();
        const roundCount = await prisma.round.count();
        const scoreCount = await prisma.score.count();

        return (
            <div className="p-10 bg-black text-white font-mono min-h-screen">
                <h1 className="text-2xl font-bold mb-4 text-green-500">Database Connection Success!</h1>
                <div className="space-y-2">
                    <p>Members: {memberCount}</p>
                    <p>Rounds: {roundCount}</p>
                    <p>Scores: {scoreCount}</p>
                    <p className="mt-4 text-gray-500">Connection string exists: {connectionString !== "NOT SET" ? "YES" : "NO"}</p>
                    <p className="text-gray-500">Length: {connectionString.length}</p>
                </div>
            </div>
        );
    } catch (error: any) {
        console.error("Debug page error:", error);
        return (
            <div className="p-10 bg-black text-white font-mono min-h-screen">
                <h1 className="text-2xl font-bold mb-4 text-red-500">Database Connection FAILED</h1>
                <div className="premium-card bg-red-900/10 border-red-500/30 p-4">
                    <p className="text-red-400 font-bold mb-2">Error Message:</p>
                    <pre className="whitespace-pre-wrap text-sm mb-4">{error.message}</pre>

                    <p className="text-gray-400 mb-2">Error Code:</p>
                    <pre className="text-sm mb-4">{error.code || "None"}</pre>

                    <p className="text-gray-400 mb-2">Full Error Object (Stringified):</p>
                    <pre className="text-xs break-all opacity-70">
                        {JSON.stringify(error, Object.getOwnPropertyNames(error))}
                    </pre>
                </div>
            </div>
        );
    }
}
