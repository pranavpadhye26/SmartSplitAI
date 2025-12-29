import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Receipt, ArrowLeft, Calendar, Trash2, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { DeleteExpenseButton } from "@/components/expenses/delete-expense-button";

interface ExpenseDetailPageProps {
    params: {
        groupId: string;
        expenseId: string;
    };
}

export default async function ExpenseDetailPage({ params }: ExpenseDetailPageProps) {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const expense = await db.expense.findUnique({
        where: { id: params.expenseId },
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
                            email: true,
                            imageUrl: true,
                        },
                    },
                },
            },
        },
    });

    if (!expense) {
        notFound();
    }

    // Check if current user is admin or the payer (to allow deletion)
    // For MVP, letting group members delete is often acceptable, but let's restrict to payer for now? nvm, let's keep it open or restrict to payer in the button component logic if needed. 
    // Actually, usually anyone in group can delete in Splitwise-like apps, or at least admins.

    return (
        <div className="container mx-auto p-6 max-w-3xl">
            <div className="mb-6">
                <Link
                    href={`/dashboard/groups/${params.groupId}/expenses`}
                    className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Expenses
                </Link>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{expense.description}</h1>
                        <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <UserIcon className="h-4 w-4" />
                                Paid by {expense.paidBy.name || expense.paidBy.email}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(expense.date).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    <DeleteExpenseButton expenseId={expense.id} groupId={params.groupId} />
                </div>
            </div>

            <div className="grid gap-6">
                {/* Amount Card */}
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium text-muted-foreground">Total Amount</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-primary">
                            {expense.currency} {expense.amount.toFixed(2)}
                        </div>
                    </CardContent>
                </Card>

                {/* Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Splitting Details</CardTitle>
                        <CardDescription>How this expense is shared</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {expense.splits.map((split) => (
                                <div key={split.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={split.user.imageUrl || undefined} />
                                            <AvatarFallback>{split.user.name?.[0] || split.user.email[0]}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">
                                            {split.user.id === expense.paidBy.id ? "Payer (You?)" : (split.user.name || split.user.email)}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold">
                                            {expense.currency} {split.amount.toFixed(2)}
                                        </div>
                                        {split.percentage && (
                                            <div className="text-xs text-muted-foreground">
                                                {split.percentage}%
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Receipt Image */}
                {/* Note: We aren't storing the real image URL yet unless using blob storage, but if we did: */}
                {expense.receiptUrl && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Receipt Image</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Placeholder for now since we don't have real cloud storage URL */}
                            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                                Receipt Image (Placeholder)
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
