import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/groups/[groupId] - Fetch group details
export async function GET(
    request: Request,
    { params }: { params: { groupId: string } }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const user = await db.user.findUnique({
            where: { clerkId: userId },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const groupId = params.groupId;

        // Fetch group with all details
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
                    include: {
                        paidBy: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                        splits: {
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
                    orderBy: {
                        date: "desc",
                    },
                    take: 10, // Latest 10 expenses
                },
                _count: {
                    select: {
                        expenses: true,
                        members: true,
                    },
                },
            },
        });

        if (!group) {
            return NextResponse.json(
                { error: "Group not found" },
                { status: 404 }
            );
        }

        // Check if user is a member
        const isMember = group.members.some((m) => m.userId === user.id);
        if (!isMember) {
            return NextResponse.json(
                { error: "You are not a member of this group" },
                { status: 403 }
            );
        }

        return NextResponse.json({ group });
    } catch (error) {
        console.error("Error fetching group:", error);
        return NextResponse.json(
            { error: "Failed to fetch group" },
            { status: 500 }
        );
    }
}

// PUT /api/groups/[groupId] - Update group
export async function PUT(
    request: Request,
    { params }: { params: { groupId: string } }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const user = await db.user.findUnique({
            where: { clerkId: userId },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const groupId = params.groupId;
        const body = await request.json();
        const { name, description, imageUrl } = body;

        // Check if user is admin of the group
        const membership = await db.groupMember.findFirst({
            where: {
                groupId,
                userId: user.id,
                role: "admin",
            },
        });

        if (!membership) {
            return NextResponse.json(
                { error: "Only admins can update the group" },
                { status: 403 }
            );
        }

        // Update group
        const group = await db.group.update({
            where: { id: groupId },
            data: {
                name: name?.trim(),
                description: description?.trim() || null,
                imageUrl: imageUrl || null,
            },
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
                _count: {
                    select: {
                        expenses: true,
                        members: true,
                    },
                },
            },
        });

        return NextResponse.json({ group });
    } catch (error) {
        console.error("Error updating group:", error);
        return NextResponse.json(
            { error: "Failed to update group" },
            { status: 500 }
        );
    }
}

// DELETE /api/groups/[groupId] - Delete group
export async function DELETE(
    request: Request,
    { params }: { params: { groupId: string } }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const user = await db.user.findUnique({
            where: { clerkId: userId },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const groupId = params.groupId;

        // Check if user is admin
        const membership = await db.groupMember.findFirst({
            where: {
                groupId,
                userId: user.id,
                role: "admin",
            },
        });

        if (!membership) {
            return NextResponse.json(
                { error: "Only admins can delete the group" },
                { status: 403 }
            );
        }

        // Delete group (cascade will handle members, expenses, etc.)
        await db.group.delete({
            where: { id: groupId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting group:", error);
        return NextResponse.json(
            { error: "Failed to delete group" },
            { status: 500 }
        );
    }
}
