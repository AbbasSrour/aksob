import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Button } from "~/components/ui/button";

export default function VerifyEmail() {
	const [searchParams] = useSearchParams();
	const [status, setStatus] = useState<"loading" | "success" | "error">(
		"loading",
	);

	// Mock verification process
	useEffect(() => {
		const timer = setTimeout(() => {
			// Simulate success if token is present, otherwise error
			if (searchParams.get("token")) {
				setStatus("success");
			} else {
				setStatus("error"); // In real app, this might default to error or stay loading until API responds
			}
		}, 2000);
		return () => clearTimeout(timer);
	}, [searchParams]);

	if (status === "loading") {
		return (
			<div className="w-full text-center py-8 animate-fade-in">
				<div className="flex justify-center mb-6">
					<div className="w-16 h-16 border-4 border-[var(--gray-200)] border-t-[var(--aksob-primary)] rounded-full animate-spin"></div>
				</div>
				<h2 className="text-xl font-bold text-[var(--aksob-darkest)]">
					Verifying your email...
				</h2>
			</div>
		);
	}

	if (status === "success") {
		return (
			<div className="w-full text-center py-4 animate-slide-up">
				<div className="w-16 h-16 bg-[var(--pale-mint)] text-[var(--success)] rounded-full flex items-center justify-center mx-auto mb-6">
					<svg
						className="w-8 h-8"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						role="img"
						aria-label="Success Icon"
					>
						<title>Success Icon</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={3}
							d="M5 13l4 4L19 7"
						/>
					</svg>
				</div>

				<h2 className="text-2xl font-bold text-[var(--aksob-darkest)] mb-2">
					Email Verified!
				</h2>
				<p className="text-[var(--gray-600)] mb-8">
					Your email has been verified. You can now access all features.
				</p>

				<Link to="/dashboard" className="block w-full">
					<Button variant="primary" fullWidth size="lg">
						Continue to App
					</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="w-full text-center py-4 animate-slide-up">
			<div className="w-16 h-16 bg-[#FEF2F2] text-[var(--error)] rounded-full flex items-center justify-center mx-auto mb-6">
				<svg
					className="w-8 h-8"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					role="img"
					aria-label="Error Icon"
				>
					<title>Error Icon</title>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={3}
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</div>

			<h2 className="text-2xl font-bold text-[var(--aksob-darkest)] mb-2">
				Verification Failed
			</h2>
			<p className="text-[var(--gray-600)] mb-8">
				This verification link is invalid or has expired.
			</p>

			<div className="space-y-4">
				<Button variant="primary" fullWidth>
					Request New Link
				</Button>

				<Link
					to="/auth/login"
					className="block text-sm font-medium text-[var(--gray-600)] hover:text-[var(--aksob-primary)]"
				>
					← Back to Sign In
				</Link>
			</div>
		</div>
	);
}
