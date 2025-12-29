import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Test: Create a test user
        const testUser = await db.user.create({
            data: {
                clerkId: `test_${Date.now()}`,
                email: `test${Date.now()}@example.com`,
                name: "Test User",
            },
        });

        // Test: Fetch all users
        const allUsers = await db.user.findMany();

        return NextResponse.json({
            success: true,
            message: "Database test successful!",
            createdUser: testUser,
            totalUsers: allUsers.length,
            allUsers: allUsers,
        });
    } catch (error) {
        console.error("Database test failed:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

export async function DELETE() {
    try {
        // Clean up test users
        const deleted = await db.user.deleteMany({
            where: {
                email: {
                    contains: "test",
                },
            },
        });

        return NextResponse.json({
            success: true,
            message: `Deleted ${deleted.count} test users`,
        });
    } catch (error) {
        console.error("Cleanup failed:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
