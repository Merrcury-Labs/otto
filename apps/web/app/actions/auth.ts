"use server";

import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export async function signUpAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
    },
  });

  // Redirect to onboarding — role selection happens there
  redirect("/onboarding");
}

export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });

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
