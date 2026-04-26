import { AKSOB_MAJORS } from "@aksob/sdk";
import { ArrowRight, ShieldCheck } from "lucide-react";
import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
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
	const [major, setMajor] = useState<string>(AKSOB_MAJORS[0]);
	const [company, setCompany] = useState("");
	const [title, setTitle] = useState("");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setErrorMessage(null);
		setIsLoading(true);

		const formData = new FormData(event.currentTarget);
		const name = String(formData.get("fullName") ?? "");
		const email = String(formData.get("email") ?? "");
		const submittedPassword = String(formData.get("password") ?? "");

		if (userType === "alumni" && !company.trim()) {
			setErrorMessage("Company is required for alumni registrations.");
			setIsLoading(false);
			return;
		}

		const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
		const response = await fetch(`${apiBaseUrl}/api/auth/sign-up/email`, {
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				name,
				email,
				password: submittedPassword,
				userType,
				major,
				company: company.trim() || undefined,
				title: title.trim() || undefined,
			}),
		});

		if (!response.ok) {
			const bodyText = await response.text();
			setErrorMessage(
				bodyText || "Unable to create account. Please try again.",
			);
			setIsLoading(false);
			return;
		}

		navigate("/galaxy");
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
						Create your AKSOB account
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

							{(userType === "alumni" || userType === "faculty") && (
								<div className="space-y-1 pt-2">
									<Input
										type="text"
										name="title"
										label="Title (Optional)"
										placeholder="e.g. Senior Analyst, Professor"
										value={title}
										onChange={(event) => setTitle(event.target.value)}
										fullWidth
									/>
								</div>
							)}

							<div className="space-y-1 pt-2">
								<Input
									type="text"
									name="company"
									label={
										userType === "alumni"
											? "Company (Required for Alumni)"
											: "Company (Optional)"
									}
									placeholder="Current company or institution"
									value={company}
									onChange={(event) => setCompany(event.target.value)}
									required={userType === "alumni"}
									fullWidth
								/>
							</div>

							<div className="space-y-1 pt-2">
								<label
									htmlFor="major"
									className="block text-sm font-medium text-[var(--aksob-darkest)]"
								>
									Major
								</label>
								<select
									id="major"
									name="major"
									value={major}
									onChange={(event) => setMajor(event.target.value)}
									className="h-12 w-full rounded-md border border-[var(--gray-200)] bg-white px-4 text-[var(--aksob-darkest)] focus:border-[var(--aksob-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--aksob-primary)]/20"
								>
									{AKSOB_MAJORS.map((majorOption) => (
										<option key={majorOption} value={majorOption}>
											{majorOption}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>

					{errorMessage && (
						<p className="text-sm text-[var(--error)]">{errorMessage}</p>
					)}

					<Button
						type="submit"
						isLoading={isLoading}
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
