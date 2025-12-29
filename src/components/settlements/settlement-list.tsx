"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Settlement {
    fromUserId: string;
    toUserId: string;
    amount: number;
    currency: string;
    fromUser: { name: string; imageUrl: string | null };
    toUser: { name: string; imageUrl: string | null };
}

export function SettlementList({ groupId }: { groupId: string }) {
    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);

    useEffect(() => {
        const fetchSettlements = async () => {
            try {
                const res = await fetch(`/api/groups/${groupId}/settlements`);
                if (res.ok) {
                    const data = await res.json();
                    setSettlements(data.data.settlements);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettlements();
    }, [groupId]);

    const handleSettle = async (s: Settlement, idx: number) => {
        setProcessingId(idx);
        try {
            const res = await fetch(`/api/groups/${groupId}/settlements/pay`, {
                method: "POST",
                body: JSON.stringify({
                    fromUserId: s.fromUserId,
                    toUserId: s.toUserId,
                    amount: s.amount,
                    currency: s.currency
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to process settlement");
            }

            toast.success("Settlement recorded!");
            // Refresh logic: for simplicity reload page to recalculate everything
            window.location.reload();

        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return <div className="p-4 flex justify-center"><Loader2 className="animate-spin h-5 w-5 text-muted-foreground" /></div>;
    }

    if (settlements.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Settlements</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                        <Check className="h-10 w-10 mb-2 text-green-500" />
                        <p>All settled up!</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Suggested Settlements</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {settlements.map((s, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={s.fromUser.imageUrl || undefined} />
                                    <AvatarFallback>{s.fromUser.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="text-sm">
                                    <span className="font-medium text-foreground">{s.fromUser.name}</span>
                                    <span className="text-muted-foreground mx-1">owes</span>
                                    <span className="font-medium text-foreground">{s.toUser.name}</span>
                                </div>
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={s.toUser.imageUrl || undefined} />
                                    <AvatarFallback>{s.toUser.name[0]}</AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-green-600">
                                    {s.currency} {s.amount.toFixed(2)}
                                </span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleSettle(s, idx)}
                                    disabled={processingId === idx}
                                >
                                    {processingId === idx ? <Loader2 className="h-4 w-4 animate-spin" /> : "Settle"}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
