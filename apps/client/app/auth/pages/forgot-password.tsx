import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@aksob/ui/core/card";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ForgotPasswordForm } from "@/app/auth/components/form/forgot-password-form.tsx";
import { AuthBackground } from "@/app/auth/components/layout/auth-background.tsx";

export const Route = createFileRoute("/auth/forgot-password")({
	component: ForgotPasswordPage,
	head: () => ({
		meta: [
			{
				title: "Forgot Password - AKSOB Dashboard",
			},
			{
				name: "robots",
				content: "noindex, nofollow",
			},
		],
	}),
});

function ForgotPasswordPage() {
	return (
		<div className="relative flex h-auto min-h-screen items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8">
			<div className="absolute">
				<AuthBackground />
			</div>

			<Card className="z-1 w-full border-none shadow-md sm:max-w-lg">
				<CardHeader className="gap-4">
					<Link
						to="/auth/login"
						className="inline-flex w-fit items-center gap-2 text-sm text-primary hover:underline"
					>
						<ArrowLeft className="size-4" />
						Back to login
					</Link>
					<div>
						<CardTitle className="mb-1.5 text-2xl">Forgot password</CardTitle>
						<CardDescription className="text-base">
							Enter the email address tied to your account and we will send
							you a reset link.
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent>
					<ForgotPasswordForm />
				</CardContent>
			</Card>
		</div>
	);
}
