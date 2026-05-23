import { Button } from "@aksob/ui/core/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@aksob/ui/core/form";
import { Input } from "@aksob/ui/core/input";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useState } from "react";
import { type SubmitHandler, useForm, useFormContext } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { env } from "@/config/env.ts";
import { authClient } from "@/lib/auth.ts";

const forgotPasswordSchema = z.object({
	email: z.email("Please enter a valid email address."),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordForm = () => {
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const form = useForm<ForgotPasswordFormValues>({
		defaultValues: {
			email: "",
		},
		resolver: standardSchemaResolver(forgotPasswordSchema),
	});

	const handleSubmit: SubmitHandler<ForgotPasswordFormValues> = async (
		values,
		event,
	) => {
		event?.preventDefault();
		setSuccessMessage(null);

		const result = await authClient.requestPasswordReset({
			email: values.email,
			redirectTo: new URL("/auth/reset-password", env.VITE_APP_URL).toString(),
		});

		if (result.error) {
			toast.error(result.error.message || "Unable to send reset email.");
			return;
		}

		setSuccessMessage(
			"If an account exists for this email, a reset link has been sent.",
		);
		toast.success("Password reset email sent.");
	};

	return (
		<Form {...form}>
			<form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
				<EmailField />
				{successMessage ? (
					<p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
						{successMessage}
					</p>
				) : null}
				<Button
					className="w-full"
					type="submit"
					loading={form.formState.isSubmitting}
				>
					Send reset link
				</Button>
			</form>
		</Form>
	);
};

const EmailField = () => {
	const { control } = useFormContext<ForgotPasswordFormValues>();

	return (
		<FormField
			name="email"
			control={control}
			render={({ field }) => (
				<FormItem className="gap-1">
					<FormLabel htmlFor="resetEmail" className="leading-5" required>
						Email address
					</FormLabel>
					<FormControl>
						<Input
							{...field}
							id="resetEmail"
							type="email"
							placeholder="name@example.com"
							autoComplete="email"
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};
