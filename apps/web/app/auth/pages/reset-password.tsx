import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { authClient } from "~/app/lib/auth";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { PasswordStrengthIndicator } from "~/components/ui/password-strength-indicator";

export default function ResetPassword() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [password, setPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setErrorMessage(null);
		setIsLoading(true);

		const formData = new FormData(event.currentTarget);
		const newPassword = String(formData.get("password") ?? "");
		const confirmPassword = String(formData.get("confirmPassword") ?? "");
		const token = searchParams.get("token") ?? undefined;

		if (newPassword !== confirmPassword) {
			setErrorMessage("Passwords do not match.");
			setIsLoading(false);
			return;
		}

		const { error } = await authClient.resetPassword({
			newPassword,
			token,
		});

		if (error) {
			setErrorMessage(error.message || "Unable to reset password.");
			setIsLoading(false);
			return;
		}

		navigate("/auth/login");
	};

	return (
		<div className="w-full animate-fade-in">
			<div className="mb-6 text-center">
				<h2 className="text-2xl font-bold text-[var(--aksob-darkest)]">
					Create New Password
				</h2>
				<p className="text-[var(--gray-600)] mt-2">
					Enter a new password for your account
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-5">
				<div className="space-y-1">
					<Input
						type="password"
						name="password"
						label="New Password"
						placeholder="••••••••••••"
						required
						fullWidth
						onChange={(e: ChangeEvent<HTMLInputElement>) =>
							setPassword(e.target.value)
						}
					/>
					<PasswordStrengthIndicator password={password} />
				</div>

				<Input
					type="password"
					name="confirmPassword"
					label="Confirm Password"
					placeholder="••••••••••••"
					required
					fullWidth
				/>

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
					Reset Password
				</Button>
			</form>
		</div>
	);
}
