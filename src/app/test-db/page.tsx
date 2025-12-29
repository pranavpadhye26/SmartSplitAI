"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function TestDatabasePage() {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const testDatabase = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/test-db");
            const data = await response.json();
            setResult(data);
        } catch (error) {
            setResult({ error: "Failed to test database" });
        } finally {
            setLoading(false);
        }
    };

    const cleanupTestData = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/test-db", { method: "DELETE" });
            const data = await response.json();
            setResult(data);
        } catch (error) {
            setResult({ error: "Failed to cleanup test data" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Database Test</h1>

            <div className="space-y-4">
                <div className="flex gap-4">
                    <Button
                        onClick={testDatabase}
                        disabled={loading}
                        size="lg"
                    >
                        {loading ? "Testing..." : "Test Database Insert"}
                    </Button>

                    <Button
                        onClick={cleanupTestData}
                        disabled={loading}
                        variant="destructive"
                        size="lg"
                    >
                        {loading ? "Cleaning..." : "Cleanup Test Data"}
                    </Button>
                </div>

                {result && (
                    <div className="mt-6 p-6 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">Result:</h2>
                        <pre className="overflow-auto text-sm">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                )}

                <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="font-semibold mb-2">💡 How to verify:</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Click "Test Database Insert" to create a test user</li>
                        <li>Open Prisma Studio: <code className="bg-white dark:bg-slate-900 px-2 py-1 rounded">npm run db:studio</code></li>
                        <li>Navigate to the "User" table to see the inserted data</li>
                        <li>Click "Cleanup Test Data" to remove test users</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
