import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@aksob/ui/core/card";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { ResetPasswordForm } from "@/app/auth/components/form/reset-password-form.tsx";
import { AuthBackground } from "@/app/auth/components/layout/auth-background.tsx";

export const Route = createFileRoute("/auth/reset-password")({
	component: ResetPasswordPage,
	validateSearch: z.object({
		error: z.string().optional(),
		token: z.string().optional(),
	}),
	head: () => ({
		meta: [
			{
				title: "Reset Password - AKSOB Dashboard",
			},
			{
				name: "robots",
				content: "noindex, nofollow",
			},
		],
	}),
});

function ResetPasswordPage() {
	const { error, token } = Route.useSearch();

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
						<CardTitle className="mb-1.5 text-2xl">Create a new password</CardTitle>
						<CardDescription className="text-base">
							Choose a new password for your AKSOB dashboard account.
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent>
					<ResetPasswordForm error={error} token={token} />
				</CardContent>
			</Card>
		</div>
	);
}
