import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'sonner';

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "SmartSplit - AI Expense Splitting",
    description: "Split expenses smarter, not harder.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="en" className="dark">
                <body className={`${outfit.className} bg-background text-foreground`}>
                    {children}
                    <Toaster richColors position="top-right" />
                </body>
            </html>
        </ClerkProvider>
    );
}
