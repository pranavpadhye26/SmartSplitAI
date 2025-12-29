import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function syncUser() {
    try {
        const clerkUser = await currentUser();
        if (!clerkUser) return null;

        const email = clerkUser.emailAddresses[0]?.emailAddress;
        if (!email) return null;

        // Construct name (Google Auth usually provides this, Email/Password might not setup name initially)
        const name = clerkUser.firstName
            ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
            : null;

        // Upsert user to ensure they exist and details are up to date
        const user = await db.user.upsert({
            where: { clerkId: clerkUser.id },
            update: {
                email,
                name: name, // Update name if it changes or becomes available
                imageUrl: clerkUser.imageUrl,
            },
            create: {
                clerkId: clerkUser.id,
                email,
                name: name,
                imageUrl: clerkUser.imageUrl,
            },
        });

        return user;
    } catch (error) {
        console.error("Failed to sync user:", error);
        return null; // Don't crash the app if sync fails, just logging
    }
}
