import { PasswordInput } from "@aksob/ui/components/form/password-input";
import { Button } from "@aksob/ui/core/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@aksob/ui/core/form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useNavigate } from "@tanstack/react-router";
import { type SubmitHandler, useForm, useFormContext } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { authClient } from "@/lib/auth.ts";

const resetPasswordSchema = z
	.object({
		password: z.string().min(8, "Password must be at least 8 characters long."),
		confirmPassword: z.string().min(1, "Please confirm your password."),
	})
	.refine((values) => values.password === values.confirmPassword, {
		message: "Passwords do not match.",
		path: ["confirmPassword"],
	});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
	error?: string;
	token?: string;
}

export const ResetPasswordForm = ({ error, token }: ResetPasswordFormProps) => {
	const navigate = useNavigate();
	const form = useForm<ResetPasswordFormValues>({
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
		resolver: standardSchemaResolver(resetPasswordSchema),
	});

	const linkError =
		error === "INVALID_TOKEN"
			? "This password reset link is invalid or has expired."
			: !token
				? "Missing password reset token. Please request a new reset email."
				: null;

	const handleSubmit: SubmitHandler<ResetPasswordFormValues> = async (
		values,
		event,
	) => {
		event?.preventDefault();

		if (!token) {
			toast.error("Missing password reset token.");
			return;
		}

		const result = await authClient.resetPassword({
			newPassword: values.password,
			token,
		});

		if (result.error) {
			toast.error(result.error.message || "Unable to reset password.");
			return;
		}

		toast.success("Password updated. You can now sign in.");
		await navigate({
			to: "/auth/login",
		});
	};

	return (
		<Form {...form}>
			<form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
				{linkError ? (
					<p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
						{linkError}
					</p>
				) : null}
				<PasswordField />
				<ConfirmPasswordField />
				<Button
					className="w-full"
					type="submit"
					loading={form.formState.isSubmitting}
					disabled={!token || Boolean(linkError)}
				>
					Reset password
				</Button>
			</form>
		</Form>
	);
};

const PasswordField = () => {
	const { control } = useFormContext<ResetPasswordFormValues>();

	return (
		<FormField
			name="password"
			control={control}
			render={({ field }) => (
				<FormItem className="gap-1">
					<FormLabel htmlFor="newPassword" className="leading-5" required>
						New password
					</FormLabel>
					<FormControl>
						<PasswordInput
							{...field}
							id="newPassword"
							placeholder="Enter your new password"
							autoComplete="new-password"
							required
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};

const ConfirmPasswordField = () => {
	const { control } = useFormContext<ResetPasswordFormValues>();

	return (
		<FormField
			name="confirmPassword"
			control={control}
			render={({ field }) => (
				<FormItem className="gap-1">
					<FormLabel htmlFor="confirmPassword" className="leading-5" required>
						Confirm password
					</FormLabel>
					<FormControl>
						<PasswordInput
							{...field}
							id="confirmPassword"
							placeholder="Re-enter your new password"
							autoComplete="new-password"
							required
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};
