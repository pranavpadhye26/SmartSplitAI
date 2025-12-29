import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Receipt, ArrowLeft, Plus, Upload, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { AddMemberDialog } from "@/components/groups/add-member-dialog";
import { SettlementList } from "@/components/settlements/settlement-list";

interface GroupDetailPageProps {
    params: {
        groupId: string;
    };
}

export default async function GroupDetailPage({ params }: GroupDetailPageProps) {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) redirect("/sign-in");

    const group = await db.group.findUnique({
        where: { id: params.groupId },
        include: {
            members: {
                include: { user: true },
            },
            expenses: {
                include: {
                    paidBy: true,
                    splits: { include: { user: true } },
                },
                orderBy: { date: "desc" },
                take: 20,
            },
            _count: {
                select: { expenses: true, members: true },
            },
        },
    });

    if (!group) notFound();

    const isMember = group.members.some((m) => m.userId === user.id);
    if (!isMember) redirect("/dashboard/groups");

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Header */}
            <div className="relative bg-primary/5 border-b border-border/50 pb-12 pt-10">
                <div className="container mx-auto px-6 max-w-5xl">
                    <Link href="/dashboard/groups" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                    </Link>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight text-foreground">{group.name}</h1>
                            <p className="text-lg text-muted-foreground mt-2 max-w-2xl">{group.description || "No description provided."}</p>

                            <div className="flex items-center gap-4 mt-6">
                                <div className="flex -space-x-3">
                                    {group.members.slice(0, 5).map((member) => (
                                        <Avatar key={member.id} className="border-2 border-background w-10 h-10">
                                            <AvatarImage src={member.user.imageUrl || undefined} />
                                            <AvatarFallback>{member.user.name?.[0]}</AvatarFallback>
                                        </Avatar>
                                    ))}
                                    {group.members.length > 5 && (
                                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                                            +{group.members.length - 5}
                                        </div>
                                    )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    <span className="font-semibold text-foreground">{group._count.members}</span> members
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button asChild variant="outline" className="shadow-sm">
                                <Link href={`/dashboard/upload?groupId=${group.id}`}>
                                    <Upload className="mr-2 h-4 w-4" /> Upload Receipt
                                </Link>
                            </Button>
                            <Button asChild className="shadow-lg shadow-primary/20">
                                <Link href={`/dashboard/upload?groupId=${group.id}`}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Expense
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 max-w-5xl -mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content: Settlements & Expenses */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Settlements Section */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold tracking-tight">Balances</h2>
                                <Button variant="link" asChild className="text-primary p-0 h-auto">
                                    <Link href={`/dashboard/groups/${group.id}/settlements`}>View All details</Link>
                                </Button>
                            </div>
                            <SettlementList groupId={group.id} />
                        </section>

                        {/* Recent Transactions */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold tracking-tight">Recent Transactions</h2>
                                <Button variant="link" asChild className="text-muted-foreground p-0 h-auto">
                                    <Link href={`/dashboard/groups/${group.id}/expenses`}>View history</Link>
                                </Button>
                            </div>

                            <Card className="border shadow-sm overflow-hidden">
                                <div className="divide-y divide-border/50">
                                    {group.expenses.length === 0 ? (
                                        <div className="p-8 text-center text-muted-foreground">
                                            <div className="bg-muted/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Receipt className="h-8 w-8 opacity-50" />
                                            </div>
                                            <p>No expenses recorded yet.</p>
                                        </div>
                                    ) : (
                                        group.expenses.map((expense) => (
                                            <Link
                                                href={`/dashboard/groups/${group.id}/expenses/${expense.id}`}
                                                key={expense.id}
                                                className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                                        {new Date(expense.date).getDate()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                                                            {expense.description}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Paid by {expense.paidBy.id === user.id ? "you" : expense.paidBy.name}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-foreground">
                                                        {expense.currency} {expense.amount.toFixed(2)}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(expense.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))
                                    )}
                                </div>
                            </Card>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6 pt-8 lg:pt-0">
                        <Card className="border shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Members</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {group.members.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={member.user.imageUrl || undefined} />
                                                <AvatarFallback>{member.user.name?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium">{member.user.name}</p>
                                                <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                                            </div>
                                        </div>
                                        {member.role === 'admin' && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Admin</span>}
                                    </div>
                                ))}
                                <div className="pt-2">
                                    <AddMemberDialog groupId={group.id} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 border-none text-white shadow-lg overflow-hidden relative">
                            <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
                            <CardHeader className="relative">
                                <CardTitle className="text-white">Smart Split Pro</CardTitle>
                                <CardDescription className="text-indigo-100">Unlock advanced expense analytics and export features.</CardDescription>
                            </CardHeader>
                            <CardContent className="relative">
                                <Button variant="secondary" className="w-full text-indigo-700 font-semibold shadow-md">
                                    Coming Soon
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    );
}
