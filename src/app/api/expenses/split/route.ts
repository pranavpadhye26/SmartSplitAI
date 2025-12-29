import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { parseSplitPrompt } from "@/lib/gemini";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { groupId, total, prompt, items, audio } = await req.json();

        if (!groupId || !total || (!prompt && !audio)) {
            return NextResponse.json(
                { error: "Missing required fields (prompt or audio required)" },
                { status: 400 }
            );
        }

        // Fetch group members to provide context to Gemini
        const group = await db.group.findUnique({
            where: { id: groupId },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        if (!group) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        const members = group.members.map((m) => ({
            id: m.userId,
            name: m.user.name || "Unknown",
        }));

        // Call Gemini to parse the split
        const result = await parseSplitPrompt(prompt || "", total, members, items, audio);

        // Map userIds back to names for UI display
        const enrichedSplits = result.splits.map((split: any) => {
            const member = members.find((m) => m.id === split.userId);
            return {
                ...split,
                user: member ? member.name : "Unknown",
            };
        });

        return NextResponse.json({
            data: {
                splits: enrichedSplits,
                explanation: result.explanation,
                transcription: result.transcription,
            },
        });
    } catch (error) {
        console.error("Split parsing error:", error);
        return NextResponse.json(
            { error: "Failed to parse split" },
            { status: 500 }
        );
    }
}
