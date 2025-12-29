import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// POST /api/groups/[groupId]/members - Add member to group
export async function POST(
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
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        // Check if current user is a member (admins can add, but let's allow any member to add)
        const membership = await db.groupMember.findFirst({
            where: {
                groupId,
                userId: user.id,
            },
        });

        if (!membership) {
            return NextResponse.json(
                { error: "You must be a member to add others" },
                { status: 403 }
            );
        }

        // Find user to add by email
        const userToAdd = await db.user.findUnique({
            where: { email: email.toLowerCase().trim() },
        });

        if (!userToAdd) {
            return NextResponse.json(
                { error: "User with this email not found" },
                { status: 404 }
            );
        }

        // Check if already a member
        const existingMember = await db.groupMember.findFirst({
            where: {
                groupId,
                userId: userToAdd.id,
            },
        });

        if (existingMember) {
            return NextResponse.json(
                { error: "User is already a member" },
                { status: 400 }
            );
        }

        // Add member
        const newMember = await db.groupMember.create({
            data: {
                groupId,
                userId: userToAdd.id,
                role: "member",
            },
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
        });

        return NextResponse.json({ member: newMember }, { status: 201 });
    } catch (error) {
        console.error("Error adding member:", error);
        return NextResponse.json(
            { error: "Failed to add member" },
            { status: 500 }
        );
    }
}

// DELETE /api/groups/[groupId]/members/[memberId] - Remove member
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
        const { searchParams } = new URL(request.url);
        const membershipId = searchParams.get("membershipId");

        if (!membershipId) {
            return NextResponse.json(
                { error: "Membership ID is required" },
                { status: 400 }
            );
        }

        // Check if current user is admin
        const isAdmin = await db.groupMember.findFirst({
            where: {
                groupId,
                userId: user.id,
                role: "admin",
            },
        });

        const membershipToDelete = await db.groupMember.findUnique({
            where: { id: membershipId },
        });

        if (!membershipToDelete) {
            return NextResponse.json(
                { error: "Membership not found" },
                { status: 404 }
            );
        }

        // Users can remove themselves, or admins can remove others
        if (membershipToDelete.userId !== user.id && !isAdmin) {
            return NextResponse.json(
                { error: "Only admins can remove other members" },
                { status: 403 }
            );
        }

        // Delete membership
        await db.groupMember.delete({
            where: { id: membershipId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error removing member:", error);
        return NextResponse.json(
            { error: "Failed to remove member" },
            { status: 500 }
        );
    }
}
