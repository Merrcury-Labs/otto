import { AuthPage } from "@/components/auth-page";

export default async function SignupPage({
	searchParams,
}: {
	searchParams: Promise<{ redirectTo?: string }>;
}) {
	const { redirectTo } = await searchParams;
	return <AuthPage mode="signup" redirectTo={redirectTo} />;
}
