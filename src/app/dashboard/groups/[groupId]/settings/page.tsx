"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
    name: z.string().min(1, "Group name is required"),
    description: z.string().optional(),
});

interface GroupSettingsPageProps {
    params: {
        groupId: string;
    };
}

export default function GroupSettingsPage({ params }: GroupSettingsPageProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    });

    // Fetch initial data
    useState(() => {
        const fetchGroup = async () => {
            try {
                const response = await fetch(`/api/groups/${params.groupId}`);
                if (!response.ok) throw new Error("Failed to fetch group");
                const data = await response.json();

                form.reset({
                    name: data.group.name,
                    description: data.group.description || "",
                });
            } catch (error) {
                console.error(error);
                toast.error("Failed to load group details");
                router.push("/dashboard/groups");
            } finally {
                setInitializing(false);
            }
        };
        fetchGroup();
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        try {
            const response = await fetch(`/api/groups/${params.groupId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to update group");
            }

            toast.success("Group updated successfully");
            router.push(`/dashboard/groups/${params.groupId}`);
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update group");
        } finally {
            setLoading(false);
        }
    }

    if (initializing) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <div className="mb-6">
                <Link
                    href={`/dashboard/groups/${params.groupId}`}
                    className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Group
                </Link>
                <h1 className="text-3xl font-bold">Group Settings</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>General Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Group Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Weekend Trip" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="What's this group for?"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Optional description for your group.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push(`/dashboard/groups/${params.groupId}`)}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
