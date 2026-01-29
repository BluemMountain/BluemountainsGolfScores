import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        await prisma.round.delete({
            where: { id },
        });
        return NextResponse.json({ message: "Deleted successfully" });
    } catch (error) {
        console.error("Failed to delete round:", error);
        return NextResponse.json({ error: "Failed to delete round" }, { status: 500 });
    }
}
