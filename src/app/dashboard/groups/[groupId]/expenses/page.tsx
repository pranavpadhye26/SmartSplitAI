import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, ArrowLeft, Calendar, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface GroupExpensesPageProps {
    params: {
        groupId: string;
    };
}

export default async function GroupExpensesPage({ params }: GroupExpensesPageProps) {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const group = await db.group.findUnique({
        where: { id: params.groupId },
        select: {
            id: true,
            name: true,
            expenses: {
                include: {
                    paidBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            imageUrl: true,
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
            },
        },
    });

    if (!group) {
        notFound();
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-6">
                <Link
                    href={`/dashboard/groups/${group.id}`}
                    className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Group
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
                        <p className="text-muted-foreground mt-1">
                            All transactions in {group.name}
                        </p>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Expense History</CardTitle>
                </CardHeader>
                <CardContent>
                    {group.expenses.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No expenses recorded yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {group.expenses.map((expense) => (
                                <Link
                                    key={expense.id}
                                    href={`/dashboard/groups/${group.id}/expenses/${expense.id}`}
                                    className="block transition-colors hover:bg-muted/50 rounded-lg"
                                >
                                    <div className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-primary/10 rounded-full">
                                                <Receipt className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-lg">{expense.description}</p>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <UserIcon className="h-3 w-3" />
                                                        {expense.paidBy.name || expense.paidBy.email} paid
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(expense.date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold">
                                                {expense.currency} {expense.amount.toFixed(2)}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {expense.splits.length} people involved
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
