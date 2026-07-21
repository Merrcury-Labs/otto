"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { GraduationCap, Buildings, CircleNotch } from "@phosphor-icons/react";

const DASHBOARD_URL = (() => {
  const value = process.env.NEXT_PUBLIC_DASHBOARD_URL;
  if (!value) throw new Error("NEXT_PUBLIC_DASHBOARD_URL must be set.");
  return value;
})();

export default function OnboardingPage() {
  const { data: session, isPending } = authClient.useSession();
  const [checking, setChecking] = useState(true);

  // Auto-detect existing users who already have a role or org
  useEffect(() => {
    async function checkExistingUser() {
      if (!session?.user?.id) return;

      try {
        const response = await fetch("/api/onboarding/check");
        if (response.ok) {
          const data = await response.json();

          if (data.role) {
            // User already has a role set — redirect accordingly
            if (data.role === "org") {
              window.location.replace(DASHBOARD_URL);
            } else {
              window.location.replace("/");
            }
            return;
          }

          // User has an org in Django but no role — auto-assign "org"
          if (data.hasOrg) {
            const setRoleResponse = await fetch("/api/onboarding", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ role: "org" }),
            });

            if (setRoleResponse.ok) {
              window.location.replace(DASHBOARD_URL);
              return;
            }
          }

          // User has a student record in Django but no role — auto-assign "student"
          if (data.hasStudent) {
            const setRoleResponse = await fetch("/api/onboarding", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ role: "student" }),
            });

            if (setRoleResponse.ok) {
              window.location.replace("/");
              return;
            }
          }
        }
      } catch (error) {
        console.error("Failed to check existing user:", error);
      } finally {
        setChecking(false);
      }
    }

    if (session?.user) {
      checkExistingUser();
    }
  }, [session?.user]);

  if (isPending || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <CircleNotch className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    window.location.replace("/login");
    return null;
  }

  const handleSelectRole = async (role: "student" | "org") => {
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        throw new Error("Failed to set role");
      }

      if (role === "student") {
        window.location.replace("/");
      } else {
        window.location.replace(
          new URL("/create-org", DASHBOARD_URL).toString(),
        );
      }
    } catch (error) {
      console.error("Failed to set role:", error);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="relative mx-auto flex w-full max-w-lg flex-col items-center gap-8 p-6 md:p-8">
        <div className="flex justify-center">
          <a href="#">
            <Logo className="h-4.5" />
          </a>
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold tracking-wide">
            How will you use Otto?
          </h1>
          <p className="text-base text-muted-foreground">
            Choose how you want to get started. You can always change this
            later.
          </p>
        </div>

        <div className="grid w-full gap-4">
          <button
            type="button"
            onClick={() => handleSelectRole("student")}
            className="group flex items-start gap-4 rounded-xl border border-border/10 bg-card p-6 text-left transition-all duration-150 hover:border-border-medium hover:bg-surface-100 cursor-pointer"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-200">
              <GraduationCap className="h-6 w-6 text-foreground" weight="duotone" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-base font-semibold text-foreground">
                I&apos;m a Learner
              </span>
              <span className="text-sm text-muted-foreground">
                Explore courses, take quizzes, and track your learning
                progress.
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSelectRole("org")}
            className="group flex items-start gap-4 rounded-xl border border-border/10 bg-card p-6 text-left transition-all duration-150 hover:border-border-medium hover:bg-surface-100 cursor-pointer"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-200">
              <Buildings className="h-6 w-6 text-foreground" weight="duotone" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-base font-semibold text-foreground">
                I&apos;m an Organization
              </span>
              <span className="text-sm text-muted-foreground">
                Create and manage courses, quizzes, and tutors for your
                organization.
              </span>
            </div>
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Signed in as{" "}
          <span className="font-medium text-foreground">
            {session.user.email}
          </span>
        </p>
      </div>
    </div>
  );
}
