import { ArrowRight, ShieldCheck } from "lucide-react";
import { Form, Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";

export default function Login() {
	return (
		<div className="relative w-full animate-fade-in">
			<div className="pointer-events-none absolute -right-40 top-0 h-52 w-52 rounded-full bg-(--aksob-primary)/12 blur-3xl" />
			<div className="pointer-events-none absolute -right-32 top-56 h-28 w-28 rounded-full border border-(--aksob-primary)/25 bg-white/30" />
			<div className="pointer-events-none absolute -right-[26rem] -top-8 hidden h-[38rem] w-[38rem] opacity-50 md:block">
				<svg viewBox="0 0 480 480" className="h-full w-full" aria-hidden="true">
					<path
						d="M92 42 C148 72, 196 102, 244 148 C292 194, 332 236, 372 282 C404 318, 428 344, 456 372"
						fill="none"
						stroke="rgba(7,105,81,0.38)"
						strokeWidth="1.6"
						strokeDasharray="3 9"
					/>
					<circle cx="82" cy="36" r="5" fill="rgba(7,105,81,0.12)" />
					<circle cx="82" cy="36" r="8" fill="rgba(7,105,81,0.06)" className="blur-[2px]" />
					<circle cx="308" cy="228" r="6" fill="rgba(7,105,81,0.10)" />
					<circle cx="308" cy="228" r="10" fill="rgba(7,105,81,0.05)" className="blur-[3px]" />
					<circle cx="462" cy="378" r="5" fill="rgba(7,105,81,0.12)" />
					<circle cx="462" cy="378" r="8" fill="rgba(7,105,81,0.06)" className="blur-[2px]" />
					<text x="94" y="26" fill="rgba(54,89,81,0.48)" fontSize="11" letterSpacing="1.1">
						FACULTY
					</text>
					<text x="320" y="218" fill="rgba(54,89,81,0.48)" fontSize="11" letterSpacing="1.1">
						ALUMNI
					</text>
					<text x="380" y="400" fill="rgba(54,89,81,0.48)" fontSize="11" letterSpacing="1.1">
						STUDENTS
					</text>
				</svg>
			</div>

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
							Secure access
						</p>
					</div>
					<h2 className="mt-4 text-3xl font-bold tracking-tight text-(--aksob-darkest)">
						Sign in to your AKSOB account
					</h2>
					<p className="mt-2 max-w-md text-sm leading-relaxed text-(--gray-600)">
						Faculty, alumni, and students can access their network space from here.
					</p>
				</div>

				<Form method="post" className="space-y-5">
					<div className="relative pl-4 sm:pl-5">
						<div className="pointer-events-none absolute inset-y-1 left-0 w-px bg-linear-to-b from-(--aksob-primary)/20 via-(--aksob-primary)/70 to-(--aksob-primary)/20" />
						<div className="space-y-4">
							<Input
								id="email"
								type="email"
								name="email"
								label="Email Address"
								placeholder="name@lau.edu.lb"
								helperText="Use your institutional or registered alumni email"
								required
								fullWidth
							/>

							<Input
								id="password"
								type="password"
								name="password"
								label="Password"
								placeholder="Enter your password"
								required
								fullWidth
							/>
						</div>
					</div>

					<div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
						<Checkbox id="remember" name="remember" label="Keep me signed in" />
						<Link
							to="/auth/forgot-password"
							className="text-sm font-medium text-(--aksob-primary) transition-colors hover:text-(--aksob-secondary) hover:underline"
						>
							Forgot password?
						</Link>
					</div>

					<Button
						type="submit"
						variant="primary"
						fullWidth
						size="lg"
						className="h-12 rounded-full text-base font-semibold shadow-none ring-1 ring-(--aksob-primary)/15 transition-all hover:ring-(--aksob-primary)/40"
					>
						Sign In
						<ArrowRight size={18} className="ml-2" />
					</Button>
				</Form>

				<div className="flex items-start gap-2 border-t border-(--gray-200) pt-4 text-xs text-(--gray-600)">
					<ShieldCheck
						size={16}
						className="mt-0.5 shrink-0 text-(--aksob-primary)"
					/>
					<p>
						For students and alumni, use your registered academic email. Faculty can sign
						in with their LAU credentials.
					</p>
				</div>

				<div className="text-center text-sm">
					<span className="text-(--gray-600)">Need an account? </span>
					<Link
						to="/auth/register"
						className="font-medium text-(--aksob-primary) transition-colors hover:text-(--aksob-secondary) hover:underline"
					>
						Create one here
					</Link>
				</div>
			</div>
		</div>
	);
}
