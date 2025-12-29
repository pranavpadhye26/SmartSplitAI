import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { groupId, description, amount, date, splits, receiptData } = body;

        if (!groupId || !description || !amount || !splits) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Get the internal user ID for the creator
        const creator = await db.user.findUnique({
            where: { clerkId: userId },
        });

        if (!creator) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Transaction to create expense and splits
        const result = await db.$transaction(async (tx) => {
            // 1. Create the Expense
            const expense = await tx.expense.create({
                data: {
                    description,
                    amount: parseFloat(amount),
                    currency: body.currency || "USD",
                    date: new Date(date || Date.now()),
                    groupId,
                    paidById: body.paidById || creator.id,
                    receiptUrl: receiptData?.imageUrl || null, // Placeholder or actual URL
                },
            });

            // 2. Create Splits
            // We need to map the split objects to the schema
            // splits is expected to be array of { userId: string, amount: number }
            for (const split of splits) {
                await tx.split.create({
                    data: {
                        expenseId: expense.id,
                        userId: split.userId,
                        amount: parseFloat(split.amount),
                        percentage: split.percentage || 0, // Optional
                    },
                });
            }

            return expense;
        });

        return NextResponse.json({ data: result }, { status: 201 });
    } catch (error) {
        console.error("Create expense error:", error);
        return NextResponse.json(
            { error: "Failed to create expense" },
            { status: 500 }
        );
    }
}
