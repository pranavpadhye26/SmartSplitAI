"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { VoiceInput } from "@/components/expenses/voice-input";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function UploadContent() {
    const searchParams = useSearchParams();
    const groupId = searchParams.get("groupId");

    const [step, setStep] = useState<"upload" | "verify" | "split" | "done">("upload");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analyzedData, setAnalyzedData] = useState<any>(null);

    // Split State
    const [splitPrompt, setSplitPrompt] = useState("");
    const [audioBase64, setAudioBase64] = useState<string | null>(null);
    const [isSplitting, setIsSplitting] = useState(false);
    const [splitResults, setSplitResults] = useState<any>(null);

    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const [members, setMembers] = useState<any[]>([]);
    const [paidById, setPaidById] = useState("");

    // Fetch members on load
    useEffect(() => {
        if (groupId) {
            fetch(`/api/groups/${groupId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.group) {
                        setMembers(data.group.members);
                        // Default to current user? We don't verify current user ID easily here without auth context in client 
                        // But we can just default to the first member or let user choose.
                        // Ideally we find the current user in the list.
                        if (data.group.members.length > 0) {
                            setPaidById(data.group.members[0].user.id);
                        }
                    }
                })
                .catch(err => console.error("Failed to fetch members", err));
        }
    }, [groupId]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        setIsAnalyzing(true);
        const formData = new FormData();
        formData.append("file", e.target.files[0]);

        try {
            const response = await fetch("/api/receipts/analyze", {
                method: "POST",
                body: formData,
            });
            const result = await response.json();

            if (!response.ok) throw new Error(result.error || "Analysis failed");

            setAnalyzedData(result.data);
            setStep("verify");
            // Set default split prompt based on total
            setSplitPrompt(`Split ${result.data.currency} ${result.data.total} equally`);
        } catch (error) {
            console.error("Analysis failed", error);
            toast.error("Failed to analyze receipt");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSplitCalculation = async () => {
        if ((!splitPrompt && !audioBase64) || !groupId) {
            if (!groupId) toast.error("No group selected! Please start from a group page.");
            return;
        }
        setIsSplitting(true);

        try {
            const response = await fetch("/api/expenses/split", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    groupId,
                    total: analyzedData.total,
                    prompt: splitPrompt,
                    items: analyzedData.items,
                    audio: audioBase64
                })
            });
            const result = await response.json();

            if (!response.ok) throw new Error(result.error || "Split failed");

            if (result.data.transcription) {
                setSplitPrompt(result.data.transcription);
                toast.success("Transcription applied!");
            }
            setSplitResults(result.data.splits);
            setStep("done");
        } catch (error) {
            console.error("Split failed", error);
            toast.error("Failed to calculate splits. Try rephrasing.");
        } finally {
            setIsSplitting(false);
        }
    };

    const handleSaveExpense = async () => {
        if (!groupId || !analyzedData || !splitResults) return;
        setIsSaving(true);

        try {
            const response = await fetch("/api/expenses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    groupId,
                    description: analyzedData.merchant || "Receipt Expense",
                    amount: analyzedData.total,
                    currency: analyzedData.currency || "USD",
                    date: analyzedData.date,
                    paidById: paidById,
                    splits: splitResults,
                    receiptData: analyzedData
                })
            });

            if (!response.ok) throw new Error("Failed to save");

            toast.success("Expense saved successfully!");
            router.push(`/dashboard/groups/${groupId}`);
            router.refresh();
        } catch (error) {
            console.error("Save failed", error);
            toast.error("Failed to save expense");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container mx-auto py-10 max-w-2xl">
            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    {step === "upload" && "Upload Receipt"}
                    {step === "verify" && "Verify Receipt"}
                    {step === "split" && "Split Expense"}
                    {step === "done" && "Confirm Details"}
                </h1>
                <p className="text-muted-foreground">
                    {step === "upload" && "Upload a photo of your bill to automatically split expenses."}
                    {step === "verify" && "Check if the AI extracted the details correctly."}
                    {step === "split" && "Tell us how you want to split this bill."}
                </p>
                {groupId && (
                    <div className="text-sm font-medium text-primary">
                        Adding details for Group ID: {groupId}
                    </div>
                )}
            </div>

            {/* STEP 1: UPLOAD */}
            {step === "upload" && (
                <Card className="border-dashed border-2">
                    <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
                        <div className="p-4 rounded-full bg-primary/10">
                            {isAnalyzing ? (
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            ) : (
                                <Upload className="h-8 w-8 text-primary" />
                            )}
                        </div>
                        <div className="text-center space-y-1">
                            <h3 className="font-medium text-lg">
                                {isAnalyzing ? "Analyzing Receipt..." : "Drag & drop or click to upload"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Supports JPG, PNG (Max 5MB)
                            </p>
                        </div>
                        <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="file-upload"
                            onChange={handleFileUpload}
                            disabled={isAnalyzing}
                        />
                        <Button asChild disabled={isAnalyzing}>
                            <label htmlFor="file-upload" className="cursor-pointer">
                                Select File
                            </label>
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* STEP 2: VERIFY DATA (Read-only for MVP) */}
            {(step === "verify" || step === "split" || step === "done") && analyzedData && (
                <div className="space-y-6 animate-fade-in-up">
                    {/* Summary Card */}
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-center">
                                <CardTitle>Receipt Details</CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => setStep("upload")} className="text-muted-foreground">Change File</Button>
                            </div>
                            <CardDescription>{analyzedData.merchant} • {analyzedData.date}</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-4">
                            <div className="space-y-4">
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>{analyzedData.currency} {analyzedData.total.toFixed(2)}</span>
                                </div>
                                {analyzedData.items && analyzedData.items.length > 0 && (
                                    <div className="border-t pt-4 mt-4 text-sm">
                                        <p className="font-medium mb-2">Items Detected:</p>
                                        <ul className="space-y-1">
                                            {analyzedData.items.map((item: any, i: number) => (
                                                <li key={i} className="flex justify-between text-muted-foreground">
                                                    <span>{item.qty}x {item.name}</span>
                                                    <span>{item.price}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        {step === "verify" && (
                            <div className="p-6 pt-0">
                                <Button className="w-full" onClick={() => setStep("split")}>
                                    Looks Good, Let&apos;s Split <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {/* STEP 3: SPLITTING LOGIC */}
            {step === "split" && (
                <Card className="mt-6 animate-fade-in-up delay-100">
                    <CardHeader>
                        <CardTitle>How should we split this?</CardTitle>
                        <CardDescription>Describe it naturally or use voice commands.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2 items-start">
                            <Textarea
                                placeholder="e.g. Split equally between me and John"
                                className="min-h-[100px] flex-1"
                                value={splitPrompt}
                                onChange={(e) => setSplitPrompt(e.target.value)}
                            />
                            <div className="pt-1">
                                <VoiceInput
                                    onAudioCaptured={(blob) => {
                                        const reader = new FileReader();
                                        reader.readAsDataURL(blob);
                                        reader.onloadend = () => {
                                            const base64 = (reader.result as string).split(",")[1];
                                            setAudioBase64(base64);
                                            toast.success("Voice instruction recorded!");
                                        };
                                    }}
                                />
                            </div>
                        </div>
                        {audioBase64 && (
                            <div className="text-sm text-green-600 flex items-center gap-2 bg-green-50 p-2 rounded border border-green-100">
                                <CheckCircle2 className="h-4 w-4" /> Voice recording ready to process
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-0 text-muted-foreground hover:text-destructive ml-auto"
                                    onClick={() => setAudioBase64(null)}
                                >
                                    Remove
                                </Button>
                            </div>
                        )}
                        <Button className="w-full" onClick={handleSplitCalculation} disabled={isSplitting || (!splitPrompt && !audioBase64)}>
                            {isSplitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Preview Split
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* STEP 4: RESULTS */}
            {step === "done" && splitResults && (
                <Card className="mt-6 animate-fade-in-up border-primary/20">
                    <CardHeader>
                        <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border/50 text-sm">
                            <span className="font-medium text-foreground block mb-2 opacity-80 uppercase tracking-wider text-xs">Instruction Used</span>
                            <p className="text-muted-foreground italic">&quot;{splitPrompt}&quot;</p>
                        </div>
                        <CardTitle className="text-primary flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5" /> Split Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {splitResults.map((split: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                                    <div className="font-medium">{split.user}</div>
                                    <div className="font-bold">{analyzedData.currency} {split.amount.toFixed(2)} <span className="text-xs font-normal text-muted-foreground ml-1">({split.percentage}%)</span></div>
                                </div>
                            ))}
                        </div>

                        {/* Paid By Selection */}
                        <div className="mt-6">
                            <label className="text-sm font-medium mb-2 block">Who paid?</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={paidById}
                                onChange={(e) => setPaidById(e.target.value)}
                            >
                                {members.map((member: any) => (
                                    <option key={member.user.id} value={member.user.id}>
                                        {member.user.name || member.user.email}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Button
                            className="w-full mt-6"
                            onClick={handleSaveExpense}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving Expense...
                                </>
                            ) : (
                                "Save Expense"
                            )}
                        </Button>
                    </CardContent>
                </Card>
            )}

        </div>
    );
}

export default function UploadPageClient() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <UploadContent />
        </Suspense>
    );
}
