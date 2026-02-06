import { ArrowLeft } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Link } from "react-router";
import { authClient } from "~/app/lib/auth";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export default function ForgotPassword() {
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsLoading(true);
		setMessage(null);
		setErrorMessage(null);

		const formData = new FormData(event.currentTarget);
		const email = String(formData.get("email") ?? "");
		const callbackURL = `${window.location.origin}/auth/reset-password`;

		const { error } = await authClient.requestPasswordReset({
			email,
			redirectTo: callbackURL,
		});

		if (error) {
			setErrorMessage(error.message || "Unable to request password reset.");
			setIsLoading(false);
			return;
		}

		setMessage("Reset link sent. Please check your email inbox.");
		setIsLoading(false);
	};

	return (
		<div className="w-full animate-fade-in">
			<div className="mb-6 text-center">
				<h2 className="text-2xl font-bold text-[var(--aksob-darkest)]">
					Forgot Password?
				</h2>
				<p className="text-[var(--gray-600)] mt-2">
					Enter your email and we'll send you a link to reset your password
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				<Input
					type="email"
					name="email"
					label="Email"
					placeholder="name@lau.edu.lb"
					required
					fullWidth
				/>

				{message && (
					<p className="text-sm text-[var(--aksob-primary)]">{message}</p>
				)}
				{errorMessage && (
					<p className="text-sm text-[var(--error)]">{errorMessage}</p>
				)}

				<Button
					type="submit"
					variant="primary"
					fullWidth
					size="lg"
					isLoading={isLoading}
				>
					Send Reset Link
				</Button>
			</form>

			<div className="mt-8 text-center">
				<Link
					to="/auth/login"
					className="inline-flex items-center text-sm font-medium text-[var(--gray-600)] hover:text-[var(--aksob-primary)] transition-colors"
				>
					<ArrowLeft size={16} className="mr-2" />
					Back to Sign In
				</Link>
			</div>
		</div>
	);
}
