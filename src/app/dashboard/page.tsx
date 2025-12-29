"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpRight, ArrowDownLeft, Wallet, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/settlements");
                const json = await res.json();
                setData(json.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const netBalance = data?.summary.totalOwedToYou - data?.summary.totalOwed;
    const isPositive = netBalance >= 0;

    return (
        <div className="min-h-screen bg-background p-6 lg:p-10">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                            Overview
                        </h1>
                        <p className="text-muted-foreground mt-1 text-lg">Your financial snapshot.</p>
                    </div>
                    <Button asChild size="lg" className="rounded-full shadow-lg hover:shadow-primary/25 transition-all">
                        <Link href="/dashboard/upload">
                            <Plus className="mr-2 h-5 w-5" /> New Expense
                        </Link>
                    </Button>
                </div>

                {/* Main Cards */}
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Net Balance - Hero Card */}
                    <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-600 text-white md:col-span-1 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                        <CardHeader className="relative z-10 pb-2">
                            <CardTitle className="text-indigo-100 font-medium text-sm tracking-wide uppercase">Net Balance</CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-4xl font-bold tracking-tight mb-1">
                                {data?.summary.currency} {Math.abs(netBalance).toFixed(2)}
                            </div>
                            <div className="flex items-center gap-2 text-indigo-100 text-sm bg-white/10 w-fit px-2 py-1 rounded-md backdrop-blur-md">
                                {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                {isPositive ? "You are up" : "You are down"}
                            </div>
                        </CardContent>
                        {/* Decorative circles */}
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                        <div className="absolute top-10 -left-10 w-24 h-24 bg-indigo-500/30 rounded-full blur-xl" />
                    </Card>

                    {/* Owed to You */}
                    <Card className="border shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-muted-foreground font-medium text-sm uppercase tracking-wide">Owed to you</CardTitle>
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-full text-emerald-600 dark:text-emerald-400">
                                    <ArrowDownLeft className="h-4 w-4" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                {data?.summary.currency} {data?.summary.totalOwedToYou.toFixed(2)}
                            </div>
                        </CardContent>
                    </Card>

                    {/* You Owe */}
                    <Card className="border shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/30 dark:to-orange-950/30">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-muted-foreground font-medium text-sm uppercase tracking-wide">You owe</CardTitle>
                                <div className="p-2 bg-rose-100 dark:bg-rose-900/50 rounded-full text-rose-600 dark:text-rose-400">
                                    <ArrowUpRight className="h-4 w-4" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">
                                {data?.summary.currency} {data?.summary.totalOwed.toFixed(2)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Settlements List */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold tracking-tight">Active Settlements</h2>
                    {data?.settlements.length === 0 ? (
                        <Card className="bg-muted/30 border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                                <Wallet className="h-10 w-10 mb-4 opacity-20" />
                                <p>All settled up across your groups.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {data?.settlements.map((item: any) => (
                                <Card key={item.id} className="group overflow-hidden border-border/50 hover:border-border transition-colors">
                                    <CardContent className="p-0">
                                        <div className="flex items-center p-4 gap-4">
                                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner ${item.type === 'owe'
                                                    ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
                                                    : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                                                }`}>
                                                {item.type === 'owe' ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownLeft className="h-6 w-6" />}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-baseline justify-between mb-1">
                                                    <p className="font-semibold truncate pr-4 text-base">
                                                        {item.otherUser}
                                                    </p>
                                                    <span className={`font-mono font-bold text-lg ${item.type === 'owe' ? 'text-rose-600' : 'text-emerald-600'
                                                        }`}>
                                                        {item.type === 'owe' ? '-' : '+'}
                                                        {item.currency}
                                                        {item.amount.toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <span>{item.type === 'owe' ? 'Outgoing' : 'Incoming'} transfer pending</span>
                                                    {item.type === 'owe' && (
                                                        <Button variant="link" className="h-auto p-0 text-primary font-medium">
                                                            Settle Now
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
