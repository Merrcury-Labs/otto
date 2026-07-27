import { AuthPage } from "@/components/auth-page";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;
  return <AuthPage redirectTo={redirectTo} />;
}
