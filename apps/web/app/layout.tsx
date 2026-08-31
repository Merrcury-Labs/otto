import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";
import { ThemeProvider } from "@/components/theme-provider";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";
import { AppLayout } from "./app-layout";

const geistSans = localFont({
	src: "./fonts/GeistVF.woff",
	variable: "--font-sans",
	weight: "100 900",
});

const geistMono = localFont({
	src: "./fonts/GeistMonoVF.woff",
	variable: "--font-jetbrains",
	weight: "100 900",
});

export const metadata: Metadata = {
	title: "Otto — AI-Powered Learning Platform",
	description: "A modern AI-first learning platform for personalized education",
	icons: {
		icon: [
			{
				url: "/otto%20logo.svg",
				type: "image/svg+xml",
			},
		],
		shortcut: [
			{
				url: "/otto%20logo.svg",
				type: "image/svg+xml",
			},
		],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning className={cn("font-sans", geistSans.variable, geistMono.variable)}>
			<body className="antialiased">
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					<AppLayout>{children}</AppLayout>
				</ThemeProvider>
			</body>
		</html>
	);
}
