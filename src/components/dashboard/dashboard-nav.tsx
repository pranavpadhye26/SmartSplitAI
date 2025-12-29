"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Users, Receipt, LayoutDashboard, Upload } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

const navItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Groups",
        href: "/dashboard/groups",
        icon: Users,
    },
    {
        title: "Upload Receipt",
        href: "/dashboard/upload",
        icon: Upload,
    },
];

export function DashboardNav() {
    const pathname = usePathname();

    return (
        <nav className="border-b bg-background">
            <div className="container mx-auto px-6">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <Link href="/dashboard" className="font-bold text-xl">
                            SmartSplit
                        </Link>
                        <div className="flex space-x-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href ||
                                    (item.href !== "/dashboard" && pathname?.startsWith(item.href));

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                                            isActive
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.title}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                    <UserButton afterSignOutUrl="/" />
                </div>
            </div>
        </nav>
    );
}
