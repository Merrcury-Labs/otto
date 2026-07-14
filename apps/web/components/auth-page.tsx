"use client";

import Link from "next/link";
import { GithubIcon } from "@/components/icons/github-icon";
import { GoogleIcon } from "@/components/icons/google-icon";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { AuthDivider } from "@/components/auth-divider";
import { signInAction, signUpAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import { AtIcon, LockIcon, UserIcon } from "@phosphor-icons/react";

type AuthMode = "login" | "signup";

type AuthPageProps = {
	mode?: AuthMode;
};

const authCopy = {
	login: {
		title: "Welcome Back!",
		description: "Login to continue learning with efferd.",
		button: "Continue With Email",
		divider: "OR CONTINUE WITH",
		switchText: "Don't have an account?",
		switchHref: "/signup",
		switchLabel: "Sign up",
	},
	signup: {
		title: "Create Account",
		description: "Sign up to start learning with efferd.",
		button: "Create Account",
		divider: "OR SIGN UP WITH",
		switchText: "Already have an account?",
		switchHref: "/login",
		switchLabel: "Login",
	},
} satisfies Record<AuthMode, Record<string, string>>;

export function AuthPage({ mode = "login" }: AuthPageProps) {
	const copy = authCopy[mode];
	const isSignup = mode === "signup";
	const action = isSignup ? signUpAction : signInAction;

	return (
		<div className="relative w-full overflow-hidden md:h-screen">
			<div
				className={cn(
					"relative mx-auto flex min-h-screen w-full max-w-sm flex-col justify-between p-6 md:p-8"
				)}
			>
				<div className="flex justify-center">
					<a href="#">
						<Logo className="h-4.5" />
					</a>
				</div>

				<div className="fade-in slide-in-from-bottom-4 w-full animate-in space-y-4 duration-600">
					<div className="flex flex-col space-y-1">
						<h1 className="font-bold text-2xl tracking-wide">{copy.title}</h1>
						<p className="text-base text-muted-foreground">
							{copy.description}
						</p>
					</div>
					<form action={action} className="space-y-2">
						{isSignup ? (
							<InputGroup>
								<InputGroupInput
									autoComplete="name"
									name="name"
									placeholder="Full name"
									required
									type="text"
								/>
								<InputGroupAddon align="inline-start">
									<UserIcon />
								</InputGroupAddon>
							</InputGroup>
						) : null}
						<InputGroup>
							<InputGroupInput
								autoComplete="email"
								name="email"
								placeholder="your.email@example.com"
								required
								type="email"
							/>
							<InputGroupAddon align="inline-start">
								<AtIcon />
							</InputGroupAddon>
						</InputGroup>
						<InputGroup>
							<InputGroupInput
								autoComplete={isSignup ? "new-password" : "current-password"}
								name="password"
								placeholder="Password"
								required
								type="password"
							/>
							<InputGroupAddon align="inline-start">
								<LockIcon />
							</InputGroupAddon>
						</InputGroup>

						<Button className="w-full" size="sm" type="submit">
							{copy.button}
						</Button>
					</form>
					<AuthDivider>{copy.divider}</AuthDivider>
					<div className="space-y-2">
						<Button className="w-full" type="button" variant="outline">
							<GoogleIcon data-icon="inline-start" />
							Google
						</Button>
						<Button className="w-full" type="button" variant="outline">
							<GithubIcon data-icon="inline-start" />
							GitHub
						</Button>
					</div>
					<p className="text-center text-muted-foreground text-sm">
						{copy.switchText}{" "}
						<Link
							className="font-medium text-primary underline underline-offset-4"
							href={copy.switchHref}
						>
							{copy.switchLabel}
						</Link>
					</p>
				</div>

				<p className="text-center text-muted-foreground text-sm">
					This site is protected by reCAPTCHA and the Google{" "}
					<a
						className="underline underline-offset-4 hover:text-primary"
						href="#"
					>
						Privacy Policy
					</a>{" "}
					and{" "}
					<a
						className="underline underline-offset-4 hover:text-primary"
						href="#"
					>
						Terms of Service
					</a>{" "}
					apply.
				</p>
			</div>
		</div>
	);
}
