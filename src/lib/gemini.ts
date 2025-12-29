import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function processReceiptImage(imageBase64: string, mimeType: string = "image/jpeg") {
    // Use the flash model for speed and efficiency
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

    const prompt = `
    Analyze this receipt image and extract the following information in strict JSON format:
    
    1. Merchant Name
    2. Date (YYYY-MM-DD)
    3. Currency Symbol
    4. Total Amount
    5. List of Items (name, quantity, price)
    6. Tax Amount
    7. Tip Amount (if any)

    Return ONLY the JSON object. Do not wrap it in markdown code blocks.
    Structure:
    {
        "merchant": "string",
        "date": "string",
        "currency": "string",
        "total": number,
        "tax": number,
        "tip": number,
        "items": [
            { "name": "string", "qty": number, "price": number }
        ]
    }
    `;

    try {
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageBase64,
                    mimeType: mimeType
                }
            }
        ]);

        const response = result.response;
        let text = response.text();

        // Clean up any markdown formatting if present
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to process receipt");
    }
}

export async function parseSplitPrompt(
    prompt: string,
    totalAmount: number,
    members: { id: string; name: string }[],
    items: { name: string; price: number; quantity: number }[] = [],
    audioBase64?: string
) {
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

    const systemPrompt = `
    You are an intelligent expense splitting assistant. 
    Parse the user's instructions (which may be text or audio) into structured JSON.
    
    Context:
    - Total Amount: ${totalAmount}
    - Group Members: ${JSON.stringify(members)}
    - Receipt Items: ${JSON.stringify(items)}
    
    User Text Prompt (if any): "${prompt}"
    
    Instructions:
    1. Match usernames in the prompt/audio to the provided Group Members list (fuzzy match if needed).
    2. If the user mentions specific items (e.g., "I had the burger"), look up their prices in the Receipt Items list.
    3. **CRITICAL: Tax/Tip Handling**: checks if the Total Amount is greater than the sum of the Item prices. This difference is Tax/Tip.
       - You MUST distribute this difference PROPORTIONALLY to the items.
       - Calculate the 'Multiplier' = Total Amount / Sum(All Item Prices).
       - When assigning an item to a user, their share for that item is (Item Price * Multiplier).
       - Example: Items total $100. Grand Total $110. Multiplier is 1.1. If User A gets a $10 item, they pay $11.
    4. If the user says "split equally", divide the total amount (or the remainder after specific items) among relevant members.
    5. If percentages are given, calculate amounts.
    6. Ensure the sum of split amounts equals the Total Amount (within 0.01).
    7. Explanation should briefly mention "Included proportional tax/tip" if applicable.
    
    Return ONLY JSON:
    {
        "splits": [
            { "userId": "string", "amount": number, "percentage": number }
        ],
        "explanation": "string",
        "transcription": "string (verbatim text of what was heard/understood from audio)"
    }
    `;

    try {
        const parts: any[] = [systemPrompt];

        if (audioBase64) {
            // Add audio part
            parts.push({
                inlineData: {
                    data: audioBase64,
                    mimeType: "audio/webm" // Assuming webm from MediaRecorder
                }
            });
            parts.push("Please listen to the attached audio instructions for splitting this bill.");
        }

        const result = await model.generateContent(parts);
        const response = result.response;
        let text = response.text();

        // Clean markdown
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini Split Parse Error:", error);
        throw new Error("Failed to parse split instruction");
    }
}
