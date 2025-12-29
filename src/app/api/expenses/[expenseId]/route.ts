import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function DELETE(
    req: NextRequest,
    { params }: { params: { expenseId: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify user has access to the expense (via group membership)
        const expense = await db.expense.findUnique({
            where: { id: params.expenseId },
            include: {
                group: {
                    include: {
                        members: true,
                    },
                },
            },
        });

        if (!expense) {
            return NextResponse.json({ error: "Expense not found" }, { status: 404 });
        }



        // Correct logic:
        const user = await db.user.findUnique({
            where: { clerkId: userId },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const hasAccess = expense.group.members.some((m) => m.userId === user.id);

        if (!hasAccess) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Delete (cascade should handle splits)
        await db.expense.delete({
            where: { id: params.expenseId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete expense error:", error);
        return NextResponse.json(
            { error: "Failed to delete expense" },
            { status: 500 }
        );
    }
}
