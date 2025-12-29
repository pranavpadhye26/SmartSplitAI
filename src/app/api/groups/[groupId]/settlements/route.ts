import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { calculateSettlements } from "@/lib/settlements";

export async function GET(
    req: NextRequest,
    { params }: { params: { groupId: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const groupId = params.groupId;

        // Fetch group expenses with detailed split info
        const group = await db.group.findUnique({
            where: { id: groupId },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                imageUrl: true,
                            },
                        },
                    },
                },
                expenses: {
                    where: {
                        // We could filter out deleted or "paid" expenses logic later
                    },
                    include: {
                        splits: true, // Need splits for calculation
                    },
                },
            },
        });

        if (!group) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        // Verify membership
        const user = await db.user.findUnique({ where: { clerkId: userId } });
        if (!user || !group.members.some(m => m.userId === user.id)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Run calculation
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

        // Enrich the result with user details for display
        const enrichedSettlements = result.settlements.map(s => {
            const fromMember = group.members.find(m => m.userId === s.fromUserId)?.user;
            const toMember = group.members.find(m => m.userId === s.toUserId)?.user;

            return {
                ...s,
                fromUser: fromMember ? { name: fromMember.name || fromMember.email, imageUrl: fromMember.imageUrl } : { name: "Unknown", imageUrl: null },
                toUser: toMember ? { name: toMember.name || toMember.email, imageUrl: toMember.imageUrl } : { name: "Unknown", imageUrl: null }
            };
        });

        return NextResponse.json({
            data: {
                totalNetworkDebt: result.totalNetworkDebt,
                settlements: enrichedSettlements
            }
        });

    } catch (error) {
        console.error("Settlement API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
