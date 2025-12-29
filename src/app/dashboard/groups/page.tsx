import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { CreateGroupDialog } from "@/components/groups/create-group-dialog";
import { GroupCard } from "@/components/groups/group-card";
import { Users } from "lucide-react";

export default async function GroupsPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    // Find or create user
    // Find user in DB (should be created by layout auth sync)
    let user = await db.user.findUnique({
        where: { clerkId: userId },
    });

    if (!user) {
        // Fallback sync if layout didn't catch it or race condition
        const { syncUser } = await import("@/lib/auth-sync");
        user = await syncUser();

        if (!user) {
            // Should not happen if auth is valid
            redirect("/sign-in");
        }
    }

    // Fetch all groups
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

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your expense groups and start splitting bills
                    </p>
                </div>
                <CreateGroupDialog />
            </div>

            {groups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div className="rounded-full bg-muted p-6 mb-4">
                        <Users className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-2">No groups yet</h2>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        Create your first group to start tracking shared expenses with
                        friends, roommates, or travel companions.
                    </p>
                    <CreateGroupDialog />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map((group) => (
                        <GroupCard key={group.id} group={group} currentUserId={user.id} />
                    ))}
                </div>
            )}
        </div>
    );
}
