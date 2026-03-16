import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@aksob/ui/core/card";
import { cn } from "@aksob/ui/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "@/app/auth/components/form/login-form.tsx";
import { AuthBackground } from "@/app/auth/components/layout/auth-background.tsx";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/auth/login")({
	component: LoginPage,
	head: () => ({
		meta: [
			{
				title: "Login - AKSOB Dashboard",
			},
			{
				name: "description",
				content:
					"Sign in to your LAU AKSOB account to connect with alumni, explore the Galaxy of Stars, and access the AKSOB community platform.",
			},
			{
				property: "og:title",
				content: "Login - LAU AKSOB",
			},
			{
				property: "og:description",
				content:
					"Sign in to access the LAU AKSOB alumni community and Galaxy of Stars platform.",
			},
			{
				property: "og:type",
				content: "website",
			},
			{
				name: "robots",
				content: "noindex, nofollow",
			},
		],
	}),
});

function LoginPage() {
	return (
		<div className="relative flex h-auto min-h-screen items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8">
			<div className="absolute">
				<AuthBackground />
			</div>

			<Card className="z-1 w-full border-none shadow-md sm:max-w-lg">
				<CardHeader className={"gap-6"}>
					<img
						src={"/images/logo-large-aksob.png"}
						alt={"AKSOB Logo"}
						className={cn("h-auto w-full")}
					/>
					<div>
						<CardTitle className={"mb-1.5 text-2xl"}>
							{m.auth_login_title()}
						</CardTitle>
						<CardDescription className={"text-base"}>
							{m.auth_login_description()}
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent>
					<LoginForm />
				</CardContent>
			</Card>
		</div>
	);
}
