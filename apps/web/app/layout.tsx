import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Inter, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { AppLayout } from "./app-layout";

const inter = Inter({
	subsets: ['latin'],
	variable: '--font-sans',
	weight: ['400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
	subsets: ['latin'],
	variable: '--font-jetbrains',
	weight: ['400', '500'],
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
		<html lang="en" suppressHydrationWarning className={cn("font-sans", inter.variable, jetbrainsMono.variable)}>
			<body className="antialiased">
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					<AppLayout>{children}</AppLayout>
				</ThemeProvider>
			</body>
		</html>
	);
}
