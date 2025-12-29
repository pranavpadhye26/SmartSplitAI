import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/groups - Fetch all groups for current user
export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Find or create user in our database
        let user = await db.user.findUnique({
            where: { clerkId: userId },
        });

        if (!user) {
            // Auto-create user if they don't exist
            const clerkUser = await auth();
            user = await db.user.create({
                data: {
                    clerkId: userId,
                    email: clerkUser.sessionClaims?.email as string || "",
                    name: clerkUser.sessionClaims?.name as string || null,
                },
            });
        }

        // Fetch all groups where user is a member
        const groups = await db.group.findMany({
            where: {
                members: {
                    some: {
                        userId: user.id,
                    },
                },
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
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({ groups });
    } catch (error) {
        console.error("Error fetching groups:", error);
        return NextResponse.json(
            { error: "Failed to fetch groups" },
            { status: 500 }
        );
    }
}

// POST /api/groups - Create a new group
export async function POST(request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name, description, imageUrl } = body;

        if (!name || name.trim().length === 0) {
            return NextResponse.json(
                { error: "Group name is required" },
                { status: 400 }
            );
        }

        // Find or create user
        let user = await db.user.findUnique({
            where: { clerkId: userId },
        });

        if (!user) {
            const clerkUser = await auth();
            user = await db.user.create({
                data: {
                    clerkId: userId,
                    email: clerkUser.sessionClaims?.email as string || "",
                    name: clerkUser.sessionClaims?.name as string || null,
                },
            });
        }

        // Create group and add creator as admin member
        const group = await db.group.create({
            data: {
                name: name.trim(),
                description: description?.trim() || null,
                imageUrl: imageUrl || null,
                members: {
                    create: {
                        userId: user.id,
                        role: "admin",
                    },
                },
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

        return NextResponse.json({ group }, { status: 201 });
    } catch (error) {
        console.error("Error creating group:", error);
        return NextResponse.json(
            { error: "Failed to create group" },
            { status: 500 }
        );
    }
}
