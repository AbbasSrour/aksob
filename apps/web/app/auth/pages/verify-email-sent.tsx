import { ArrowLeft, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Button } from "~/components/ui/button";

export default function VerifyEmailSent() {
	const [searchParams] = useSearchParams();
	const email = searchParams.get("email") || "your email";
	const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">(
		"idle",
	);
	const [countdown, setCountdown] = useState(0);

	const handleResend = () => {
		setResendStatus("sending");
		// Simulate API call
		setTimeout(() => {
			setResendStatus("sent");
			setCountdown(60);
		}, 1500);
	};

	useEffect(() => {
		if (countdown > 0) {
			const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
			return () => clearTimeout(timer);
		} else if (countdown === 0 && resendStatus === "sent") {
			setResendStatus("idle");
		}
	}, [countdown, resendStatus]);

	return (
		<div className="w-full text-center py-4 animate-fade-in">
			<div className="w-16 h-16 bg-[var(--pale-mint)] text-[var(--aksob-primary)] rounded-full flex items-center justify-center mx-auto mb-6">
				<Mail size={32} />
			</div>

			<h2 className="text-2xl font-bold text-[var(--aksob-darkest)] mb-2">
				Check Your Email
			</h2>
			<p className="text-[var(--gray-600)] mb-6">
				We've sent a verification link to:
				<br />
				<span className="font-bold text-[var(--aksob-primary)]">{email}</span>
			</p>

			<p className="text-sm text-[var(--gray-600)] mb-8">
				Click the link in the email to verify your account.
			</p>

			<div className="space-y-6">
				<Button
					variant="primary"
					fullWidth
					size="lg"
					onClick={() => window.open("mailto:")}
				>
					Open Email App
				</Button>

				<div className="text-sm">
					<p className="text-[var(--gray-600)] mb-2">
						Didn't receive the email?
					</p>
					<div className="flex flex-col gap-1">
						<span className="text-[var(--gray-500)] text-xs">
							Check spam folder or
						</span>
						<button
							type="button"
							onClick={handleResend}
							disabled={resendStatus !== "idle"}
							className={`font-medium transition-colors ${
								resendStatus === "idle"
									? "text-[var(--aksob-primary)] hover:text-[var(--aksob-secondary)] hover:underline cursor-pointer"
									: "text-[var(--gray-400)] cursor-not-allowed"
							}`}
						>
							{resendStatus === "sending"
								? "Sending..."
								: resendStatus === "sent"
									? `Email sent! Resend again in ${countdown}s`
									: "Resend verification email"}
						</button>
					</div>
				</div>

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
