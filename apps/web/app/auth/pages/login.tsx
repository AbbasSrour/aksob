import { ArrowRight, ShieldCheck } from "lucide-react";
import { Form, Link } from "react-router";
import { LoginPathElement } from "~/app/auth/components/login-path-element";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { LoginGlobElement } from "../components/login-glob-element";

export default function Login() {
	return (
		<div className="relative w-full animate-fade-in">
			<LoginGlobElement />
			<LoginPathElement />

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
						Faculty, alumni, and students can access their network space from
						here.
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
						For students and alumni, use your registered academic email. Faculty
						can sign in with their LAU credentials.
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
