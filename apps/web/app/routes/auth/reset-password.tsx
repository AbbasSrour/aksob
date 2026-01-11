import { useState } from "react";
import { Form } from "react-router";
import { Button, Input, PasswordStrengthIndicator } from "~/components/ui";

export default function ResetPassword() {
	const [password, setPassword] = useState("");

	return (
		<div className="w-full animate-fade-in">
			<div className="mb-6 text-center">
				<h2 className="text-2xl font-bold text-[var(--aksob-darkest)]">Create New Password</h2>
				<p className="text-[var(--gray-600)] mt-2">Enter a new password for your account</p>
			</div>

			<Form method="post" className="space-y-5">
				<div className="space-y-1">
					<Input
						type="password"
						name="password"
						label="New Password"
						placeholder="••••••••••••"
						required
						fullWidth
						onChange={(e) => setPassword(e.target.value)}
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

				<Button type="submit" variant="primary" fullWidth size="lg">
					Reset Password
				</Button>
			</Form>
		</div>
	);
}
