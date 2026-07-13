"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import {
  Buildings,
  Globe,
  ImageSquare,
  TextAa,
  CircleNotch,
} from "@phosphor-icons/react";

export default function CreateOrgPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("/api/org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          description: formData.get("description") || null,
          logo: formData.get("logo") || "",
          website: formData.get("website") || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create organization");
      }

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-2 text-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-surface-200">
            <Buildings className="h-7 w-7 text-foreground" weight="duotone" />
          </div>
          <h1 className="text-2xl font-bold tracking-wide">
            Create Your Organization
          </h1>
          <p className="text-sm text-muted-foreground">
            Set up your organization to start managing courses and tutors.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="name"
              className="text-sm font-medium text-foreground"
            >
              Organization Name <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <TextAa className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Acme Learning Academy"
                required
                className="w-full rounded-lg border border-border/10 bg-surface-100 py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/20 focus:border-border-medium transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="description"
              className="text-sm font-medium text-foreground"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Tell us about your organization..."
              rows={3}
              className="w-full rounded-lg border border-border/10 bg-surface-100 p-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/20 focus:border-border-medium transition-all resize-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="logo"
              className="text-sm font-medium text-foreground"
            >
              Logo URL
            </label>
            <div className="relative">
              <ImageSquare className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="logo"
                name="logo"
                type="url"
                placeholder="https://example.com/logo.png"
                className="w-full rounded-lg border border-border/10 bg-surface-100 py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/20 focus:border-border-medium transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="website"
              className="text-sm font-medium text-foreground"
            >
              Website
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="website"
                name="website"
                type="url"
                placeholder="https://example.com"
                className="w-full rounded-lg border border-border/10 bg-surface-100 py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/20 focus:border-border-medium transition-all"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl font-bold mt-2"
          >
            {submitting ? (
              <>
                <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Organization"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
