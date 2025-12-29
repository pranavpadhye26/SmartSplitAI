"use client"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Share2, Download } from "lucide-react";
import { MOCK_EXPENSES } from "@/lib/mockData";
import { useParams } from "next/navigation";

export default function ExpensePage() {
    const params = useParams();
    const expenseId = params?.id as string;
    const expense = MOCK_EXPENSES.find(e => e.id === expenseId) || MOCK_EXPENSES[0];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-xl font-bold tracking-tight">Expense Details</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Receipt</CardTitle>
                        <CardDescription>Original receipt image</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center min-h-[300px] bg-muted/20 rounded-md border-2 border-dashed">
                        <div className="text-center text-muted-foreground">
                            <p>Receipt Image Placeholder</p>
                            <p className="text-xs">(Would display extracted image here)</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-2xl">{expense.title}</CardTitle>
                                    <CardDescription>{new Date(expense.date).toLocaleDateString()}</CardDescription>
                                </div>
                                <div className="text-2xl font-bold">${expense.amount.toFixed(2)}</div>
                            </div>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Paid by</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">{expense.paidBy.name}</span>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid gap-3">
                                <div className="font-medium">Split Breakdown</div>
                                <div className="grid gap-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Pranav (You)</span>
                                        <span>$41.50</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Alice</span>
                                        <span>$41.50</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Bob</span>
                                        <span>$41.50</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
