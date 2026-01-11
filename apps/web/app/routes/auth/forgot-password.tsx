import { ArrowLeft } from "lucide-react";
import { Form, Link } from "react-router";
import { Button, Input } from "~/components/ui";

export default function ForgotPassword() {
	return (
		<div className="w-full animate-fade-in">
			<div className="mb-6 text-center">
				<h2 className="text-2xl font-bold text-[var(--aksob-darkest)]">Forgot Password?</h2>
				<p className="text-[var(--gray-600)] mt-2">
					Enter your email and we'll send you a link to reset your password
				</p>
			</div>

			<Form method="post" className="space-y-6">
				<Input
					type="email"
					name="email"
					label="Email"
					placeholder="name@lau.edu.lb"
					required
					fullWidth
				/>

				<Button type="submit" variant="primary" fullWidth size="lg">
					Send Reset Link
				</Button>
			</Form>

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
