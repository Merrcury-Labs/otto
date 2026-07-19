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
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });
  } catch {
    // Use one response for unknown accounts and incorrect passwords so the
    // login form does not reveal whether an email address is registered.
    return { error: "Invalid email or password." };
  }

  // After sign-in, redirect to home.
  // The middleware will check for the role cookie and redirect
  // to /onboarding if the user hasn't selected a role yet.
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
