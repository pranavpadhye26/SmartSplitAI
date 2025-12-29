"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, Receipt, MoreVertical, Trash2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface GroupCardProps {
    group: {
        id: string;
        name: string;
        description: string | null;
        imageUrl: string | null;
        members: Array<{
            user: {
                id: string;
                name: string | null;
                email: string;
                imageUrl: string | null;
            };
        }>;
        _count: {
            expenses: number;
            members: number;
        };
    };
    currentUserId: string;
}

export function GroupCard({ group, currentUserId }: GroupCardProps) {
    const memberAvatars = group.members.slice(0, 3);
    const router = useRouter();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Check if current user is admin
    const isAdmin = group.members.some(
        (m: any) => m.userId === currentUserId && m.role === "admin"
    );

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const response = await fetch(`/api/groups/${group.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to delete group");
            }

            toast.success("Group deleted successfully");
            router.refresh();
        } catch (error) {
            console.error("Error deleting group:", error);
            toast.error("Failed to delete group");
        } finally {
            setDeleting(false);
            setDeleteDialogOpen(false);
        }
    };

    return (
        <>
            <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div className="space-y-1 flex-1">
                        <CardTitle className="text-xl">{group.name}</CardTitle>
                        {group.description && (
                            <CardDescription className="line-clamp-2">
                                {group.description}
                            </CardDescription>
                        )}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/dashboard/groups/${group.id}/settings`}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                </Link>
                            </DropdownMenuItem>
                            {isAdmin && (
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => setDeleteDialogOpen(true)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Stats */}
                        <div className="flex gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{group._count.members} members</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Receipt className="h-4 w-4" />
                                <span>{group._count.expenses} expenses</span>
                            </div>
                        </div>

                        {/* Member Avatars */}
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                {memberAvatars.map((member) => (
                                    <Avatar
                                        key={member.user.id}
                                        className="border-2 border-background"
                                    >
                                        <AvatarImage src={member.user.imageUrl || undefined} />
                                        <AvatarFallback>
                                            {member.user.name?.[0]?.toUpperCase() ||
                                                member.user.email[0].toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                ))}
                            </div>
                            {group._count.members > 3 && (
                                <span className="text-sm text-muted-foreground">
                                    +{group._count.members - 3} more
                                </span>
                            )}
                        </div>

                        {/* View Button */}
                        <Button asChild className="w-full">
                            <Link href={`/dashboard/groups/${group.id}`}>
                                View Group
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            group and all associated expenses.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e: React.MouseEvent) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? "Deleting..." : "Delete Group"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
