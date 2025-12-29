import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { syncUser } from "@/lib/auth-sync";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Ensure user is synced to DB on every dashboard visit
    await syncUser();

    return (
        <div className="min-h-screen bg-background">
            <DashboardNav />
            <main>{children}</main>
        </div>
    );
}
