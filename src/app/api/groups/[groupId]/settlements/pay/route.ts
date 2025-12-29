import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
    req: Request,
    { params }: { params: { groupId: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const user = await db.user.findUnique({ where: { clerkId: userId } });
        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        const { groupId } = params;
        const body = await req.json();
        const { fromUserId, toUserId, amount, currency } = body;

        if (!fromUserId || !toUserId || !amount || !currency) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Verify group membership
        const membership = await db.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId: user.id,
                    groupId: groupId,
                },
            },
        });

        if (!membership) {
            return new NextResponse("Not a member of this group", { status: 403 });
        }

        // Fetch user names for the description
        const fromUser = await db.user.findUnique({ where: { id: fromUserId } });
        const toUser = await db.user.findUnique({ where: { id: toUserId } });

        if (!fromUser || !toUser) {
            return new NextResponse("Users involved in settlement not found", { status: 404 });
        }

        // Create the Settlement Expense
        // Logic: Payer = fromUserId (They paid money)
        // Split = toUserId (They received value/money)
        // This transaction cancels out the debt where fromUserId owed toUserId.

        await db.$transaction(async (tx) => {
            const expense = await tx.expense.create({
                data: {
                    groupId,
                    paidById: fromUserId,
                    amount: amount,
                    currency: currency,
                    description: `Settlement: ${fromUser.name} paid ${toUser.name}`,
                    date: new Date(),
                },
            });

            await tx.split.create({
                data: {
                    expenseId: expense.id,
                    userId: toUserId,
                    amount: amount,
                    percentage: 100,
                },
            });
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[SETTLEMENT_PAY]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
