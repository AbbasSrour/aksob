import { useState } from "react";
import { Form, Link } from "react-router";
import {
	Button,
	Divider,
	Input,
	PasswordStrengthIndicator,
	SocialButton,
	UserTypeSelector,
} from "~/components/ui";

export default function Register() {
	const [password, setPassword] = useState("");
	const [userType, setUserType] = useState<"student" | "alumni" | "faculty">("student");

	return (
		<div className="w-full animate-fade-in">
			<div className="mb-6 text-center">
				<h2 className="text-2xl font-bold text-[var(--aksob-darkest)]">Create Your Account</h2>
				<p className="text-[var(--gray-600)] mt-2">Join the AKSOB Alumni Network</p>
			</div>

			<div className="space-y-4">
				<SocialButton provider="google" />
			</div>

			<Divider text="OR" />

			<Form method="post" className="space-y-5">
				<Input
					type="text"
					name="fullName"
					label="Full Name"
					placeholder="John Doe"
					required
					fullWidth
				/>

				<Input
					type="email"
					name="email"
					label="Email Address"
					placeholder="name@lau.edu.lb"
					required
					fullWidth
				/>

				<div className="space-y-1">
					<Input
						type="password"
						name="password"
						label="Password"
						placeholder="Create a password"
						required
						fullWidth
						onChange={(e) => setPassword(e.target.value)}
					/>
					<PasswordStrengthIndicator password={password} />
				</div>

				<UserTypeSelector value={userType} onChange={setUserType} />
				{/* Hidden input to submit userType */}
				<input type="hidden" name="userType" value={userType} />

				<Button type="submit" variant="primary" fullWidth size="lg">
					Create Account
				</Button>
			</Form>

			<div className="mt-6 text-center text-sm">
				<span className="text-[var(--gray-600)]">Already have an account? </span>
				<Link
					to="/auth/login"
					className="font-medium text-[var(--aksob-primary)] hover:text-[var(--aksob-secondary)] hover:underline"
				>
					Sign in
				</Link>
			</div>
		</div>
	);
}
