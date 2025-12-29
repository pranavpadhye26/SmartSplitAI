import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { calculateSettlements } from "@/lib/settlements";

export async function GET(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await db.user.findUnique({ where: { clerkId: userId } });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Fetch ALL groups the user is in
        const groups = await db.group.findMany({
            where: {
                members: { some: { userId: user.id } }
            },
            include: {
                members: { include: { user: true } },
                expenses: {
                    include: { splits: true }
                }
            }
        });

        let totalOwed = 0;
        let totalOwedToYou = 0;
        const globalSettlements: any[] = [];

        // Calculate settlements for each group and aggregate
        for (const group of groups) {
            const result = calculateSettlements(group.expenses.map(e => ({
                id: e.id,
                amount: e.amount,
                paidById: e.paidById,
                currency: e.currency,
                splits: e.splits.map(s => ({
                    userId: s.userId,
                    amount: s.amount
                }))
            })));

            // Filter settlements involving the current user
            const userSettlements = result.settlements.filter(s =>
                s.fromUserId === user.id || s.toUserId === user.id
            );

            for (const s of userSettlements) {
                if (s.fromUserId === user.id) {
                    totalOwed += s.amount;
                    const creditor = group.members.find(m => m.userId === s.toUserId)?.user;
                    globalSettlements.push({
                        id: `${group.id}-${s.toUserId}`,
                        type: 'owe',
                        otherUser: creditor?.name || creditor?.email || "Unknown",
                        amount: s.amount,
                        currency: s.currency,
                        date: "Pending" // Placeholder
                    });
                } else if (s.toUserId === user.id) {
                    totalOwedToYou += s.amount;
                    const debtor = group.members.find(m => m.userId === s.fromUserId)?.user;
                    globalSettlements.push({
                        id: `${group.id}-${s.fromUserId}`,
                        type: 'owed',
                        otherUser: debtor?.name || debtor?.email || "Unknown",
                        amount: s.amount,
                        currency: s.currency,
                        date: "Pending"
                    });
                }
            }
        }

        return NextResponse.json({
            data: {
                summary: {
                    totalOwed,
                    totalOwedToYou,
                    currency: "USD" // Simplification
                },
                settlements: globalSettlements
            }
        });
    } catch (error) {
        console.error("Global settlements error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
