"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@repo/ui/button";
import { AtIcon, LockIcon } from "@phosphor-icons/react";

const WEB_APP_URL = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";

export default function DashboardLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        // Do not reveal whether the email address or password was incorrect.
        setError("Invalid email or password.");
        return;
      }

      // Check user's role via API to determine redirect
      const roleResponse = await fetch("/api/auth/role");
      if (roleResponse.ok) {
        const roleData = await roleResponse.json();
        const role = roleData.role as string | null;

        if (!role) {
          // No role set, redirect to onboarding on the web app
          window.location.href = `${WEB_APP_URL}/onboarding`;
          return;
        }

        if (role === "student") {
          // Student users go to the web app
          window.location.href = `${WEB_APP_URL}`;
          return;
        }
      }

      // Org users stay on dashboard
      router.push("/");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 text-center mb-8">
          <h1 className="text-2xl font-bold tracking-wide">Welcome Back</h1>
          <p className="text-base text-muted-foreground">
            Sign in to your organization dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="relative">
            <AtIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              autoComplete="email"
              name="email"
              placeholder="your.email@example.com"
              required
              type="email"
              className="w-full rounded-lg border border-border/10 bg-surface-100 py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/20 focus:border-border-medium transition-all"
            />
          </div>

          <div className="relative">
            <LockIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              autoComplete="current-password"
              name="password"
              placeholder="Password"
              required
              type="password"
              className="w-full rounded-lg border border-border/10 bg-surface-100 py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/20 focus:border-border-medium transition-all"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl font-bold"
          >
            {loading ? "Signing in..." : "Continue With Email"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href={`${WEB_APP_URL}/signup`}
              className="font-medium text-primary underline underline-offset-4"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
