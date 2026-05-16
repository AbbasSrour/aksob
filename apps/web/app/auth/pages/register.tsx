import { ArrowRight, ShieldCheck } from "lucide-react";
import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useSignUp } from "~/app/auth/hooks/api/auth.queries";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { PasswordStrengthIndicator } from "~/components/ui/password-strength-indicator";
import { UserTypeSelector } from "~/components/ui/user-type-selector";

export default function Register() {
	const navigate = useNavigate();
	const [password, setPassword] = useState("");
	const [userType, setUserType] = useState<"student" | "alumni" | "faculty">(
		"student",
	);
	const [clientError, setClientError] = useState<string | null>(null);

	const signUp = useSignUp();

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setClientError(null);

		const formData = new FormData(event.currentTarget);
		const name = String(formData.get("fullName") ?? "");
		const email = String(formData.get("email") ?? "");
		const submittedPassword = String(formData.get("password") ?? "");

		signUp.mutate(
			{
				name,
				email,
				password: submittedPassword,
				type: userType,
			},
			{
				onSuccess: () => {
					navigate("/onboarding");
				},
			},
		);
	};

	return (
		<div className="relative w-full animate-fade-in">
			<div className="relative z-10 space-y-6">
				<div>
					<Link to="/" className="mb-5 inline-block w-full max-w-[24rem]">
						<img
							src="/logo.png"
							alt="Lebanese American University - Adnan Kassar School of Business"
							className="h-auto w-full"
						/>
					</Link>

					<div className="flex items-center gap-3">
						<span className="h-px w-10 bg-(--aksob-primary)/45" />
						<p className="text-[11px] font-semibold tracking-[0.16em] text-(--aksob-primary) uppercase">
							Join the Network
						</p>
					</div>
					<h2 className="mt-4 text-3xl font-bold tracking-tight text-(--aksob-darkest)">
						Create your AKSOB Alumni account
					</h2>
					<p className="mt-2 max-w-md text-sm leading-relaxed text-(--gray-600)">
						Join the community of faculty, alumni, and students to access your
						network space.
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-5">
					<div className="relative pl-4 sm:pl-5">
						<div className="pointer-events-none absolute inset-y-1 left-0 w-px bg-linear-to-b from-(--aksob-primary)/20 via-(--aksob-primary)/70 to-(--aksob-primary)/20" />
						<div className="space-y-4">
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
								helperText="Use your institutional or registered alumni email"
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
									onChange={(e: ChangeEvent<HTMLInputElement>) =>
										setPassword(e.target.value)
									}
								/>
								<PasswordStrengthIndicator password={password} />
							</div>

							<div className="space-y-1 pt-2">
								<UserTypeSelector value={userType} onChange={setUserType} />
								<input type="hidden" name="userType" value={userType} />
							</div>

	
						</div>
					</div>

					{clientError && (
						<p className="text-sm text-[var(--error)]">{clientError}</p>
					)}

					<Button
						type="submit"
						isLoading={signUp.isPending}
						variant="primary"
						fullWidth
						size="lg"
						className="h-12 rounded-full text-base font-semibold shadow-none ring-1 ring-(--aksob-primary)/15 transition-all hover:ring-(--aksob-primary)/40"
					>
						Create Account
						<ArrowRight size={18} className="ml-2" />
					</Button>
				</form>

				<div className="flex items-start gap-2 border-t border-(--gray-200) pt-4 text-xs text-(--gray-600)">
					<ShieldCheck
						size={16}
						className="mt-0.5 shrink-0 text-(--aksob-primary)"
					/>
					<p>
						Your personal information is securely processed. We verify all
						academic credentials before granting access.
					</p>
				</div>

				<div className="text-center text-sm">
					<span className="text-(--gray-600)">Already have an account? </span>
					<Link
						to="/auth/login"
						className="font-medium text-(--aksob-primary) transition-colors hover:text-(--aksob-secondary) hover:underline"
					>
						Sign in here
					</Link>
				</div>
			</div>
		</div>
	);
}
