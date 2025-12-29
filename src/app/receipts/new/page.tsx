"use client"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Upload, FileImage, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadReceiptPage() {
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();

    const handleUpload = () => {
        setIsUploading(true);
        // Mock upload delay
        setTimeout(() => {
            setIsUploading(false);
            // In real app, would redirect to extraction review
            router.push("/expenses/e_1");
        }, 2000);
    };

    return (
        <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto min-h-screen justify-center">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Upload Receipt</h1>
            </div>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Scan Receipt</CardTitle>
                    <CardDescription>Upload an image of your receipt to automatically extract items.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="grid place-items-center gap-4 rounded-lg border-2 border-dashed p-12 hover:bg-muted/10 transition-colors cursor-pointer">
                        <div className="rounded-full bg-muted p-4">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="text-center grid gap-2">
                            <h3 className="text-lg font-semibold">Drag and drop or click to upload</h3>
                            <p className="text-sm text-muted-foreground">Support for JPG, PNG, PDF</p>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center gap-2">
                            <div className="h-[1px] flex-1 bg-border" />
                            <span className="text-xs text-muted-foreground">OR ENTER MANUALLY</span>
                            <div className="h-[1px] flex-1 bg-border" />
                        </div>
                    </div>

                    <Button variant="secondary" className="w-full">MANUAL ENTRY</Button>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleUpload} disabled={isUploading}>
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Extracting...
                            </>
                        ) : (
                            "Process Receipt"
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
