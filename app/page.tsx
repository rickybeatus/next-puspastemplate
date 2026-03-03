"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth/client";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setIsPending(true);

        const { error } = await signIn.email({
            email,
            password,
        });

        setIsPending(false);

        if (error) {
            toast.error(error.message || "Kredensial tidak valid");
        } else {
            router.push("/dashboard");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <h1 className="text-2xl font-bold">Sign In</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-64">
                <Input
                    type="email"
                    placeholder="Email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isPending}
                />
                <Input
                    type="password"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isPending}
                />

                <Button type="submit" disabled={isPending}>
                    {isPending ? "Signing In..." : "Sign In"}
                </Button>
            </form>
        </div>
    );
}