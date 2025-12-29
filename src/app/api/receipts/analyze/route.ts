import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { processReceiptImage } from "@/lib/gemini";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ error: "File must be an image" }, { status: 400 });
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString("base64");

        // Process with Gemini
        const data = await processReceiptImage(base64, file.type);

        return NextResponse.json({ data });
    } catch (error) {
        console.error("Receipt analysis error:", error);
        return NextResponse.json(
            { error: "Failed to analyze receipt" },
            { status: 500 }
        );
    }
}
