"use server";

import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export type AuthActionState = {
  error: string | null;
};

export async function signUpAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const cookieStore = await cookies();
  cookieStore.delete("user_role");

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });
  } catch {
    return {
      error: "Unable to create your account. Check your details and try again.",
    };
  }

  // Redirect to onboarding — role selection happens there
  redirect("/onboarding");
}

export async function signInAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const cookieStore = await cookies();
  cookieStore.delete("user_role");

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  try {
    const result = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    // Restore the role for the user who actually signed in. Clearing this
    // cookie and leaving it empty sent every existing user through onboarding,
    // where organization users were then redirected to the dashboard even
    // when they had deliberately signed in to the web app.
    if (result.user.role === "student" || result.user.role === "org") {
      cookieStore.set("user_role", result.user.role, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
    }
  } catch {
    // Use one response for unknown accounts and incorrect passwords so the
    // login form does not reveal whether an email address is registered.
    return { error: "Invalid email or password." };
  }

  // Existing users stay in the web app. Users without a role still pass
  // through onboarding via middleware.
  redirect("/");
}

export async function signOutAction() {
  // Clear the role cookie on sign out
  const cookieStore = await cookies();
  cookieStore.delete("user_role");

  await auth.api.signOut({
    headers: await headers(),
  });

  redirect("/");
}
