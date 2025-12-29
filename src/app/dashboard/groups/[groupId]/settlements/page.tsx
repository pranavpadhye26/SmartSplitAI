import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { SettlementList } from "@/components/settlements/settlement-list";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface SettlementsPageProps {
    params: {
        groupId: string;
    };
}

export default async function SettlementsPage({ params }: SettlementsPageProps) {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const group = await db.group.findUnique({
        where: { id: params.groupId },
    });

    if (!group) {
        notFound();
    }

    return (
        <div className="container mx-auto p-6 max-w-3xl">
            <div className="mb-6">
                <Link
                    href={`/dashboard/groups/${params.groupId}`}
                    className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Group
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settlements</h1>
                    <p className="text-muted-foreground mt-2">
                        Suggested payments to settle up all debts in the group.
                    </p>
                </div>
            </div>

            <SettlementList groupId={params.groupId} />
        </div>
    );
}
