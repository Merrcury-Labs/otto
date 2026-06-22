"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { backendGraphqlFetch } from "@/lib/graphql/backend";

const registerStudentMutation = /* GraphQL */ `
  mutation RegisterStudent($name: String!, $email: String!, $userId: String) {
    registerStudent(name: $name, email: $email, userId: $userId) {
      id
      name
      email
      userID
    }
  }
`;

export async function signUpAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  const result = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
    },
  });

  await backendGraphqlFetch({
    query: registerStudentMutation,
    operationName: "RegisterStudent",
    variables: {
      name,
      email,
      userId: result.user.id,
    },
  });

  redirect("/");
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

  redirect("/");
}

export async function signOutAction() {
  await auth.api.signOut({
    headers: await headers(),
  });

  redirect("/");
}
