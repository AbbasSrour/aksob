import { PasswordInput } from "@aksob/ui/components/form/password-input";
import { Button } from "@aksob/ui/core/button";
import { Checkbox } from "@aksob/ui/core/checkbox";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@aksob/ui/core/form";
import { Input } from "@aksob/ui/core/input";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useNavigate } from "@tanstack/react-router";
import { type SubmitHandler, useForm, useFormContext } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { authClient } from "@/lib/auth.ts";
import { m } from "@/paraglide/messages";

const loginSchema = z.object({
	email: z.email(),
	password: z.string(),
	rememberMe: z.boolean().default(false).optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm = () => {
	const navigate = useNavigate();

	const form = useForm<LoginFormValues>({
		defaultValues: {
			email: "",
			password: "",
			rememberMe: false,
		},
		resolver: standardSchemaResolver(loginSchema),
	});

	const handleSubmit: SubmitHandler<LoginFormValues> = async (
		values: LoginFormValues,
		event,
	) => {
		event?.preventDefault();

		const result = await authClient.signIn.email({
			email: values.email,
			password: values.password,
			rememberMe: values.rememberMe,
		});

		if (result.error) {
			toast.error(result.error.message || m.auth_error_generic());
			return;
		}

		await navigate({
			to: "/",
			reloadDocument: true,
		});
	};

	return (
		<Form {...form}>
			<form className={"space-y-4"} onSubmit={form.handleSubmit(handleSubmit)}>
				<EmailField />
				<PasswordField />
				<RememberMeField />
				<Button className={"w-full"} type={"submit"}>
					{m.auth_login_button()}
				</Button>
			</form>
		</Form>
	);
};

const EmailField = () => {
	const { control } = useFormContext();
	return (
		<FormField
			name={"email"}
			control={control}
			render={({ field }) => (
				<FormItem className={"gap-1"}>
					<FormLabel htmlFor={"userEmail"} className={"leading-5"} required>
						{m.auth_login_email_label()}
					</FormLabel>
					<FormControl>
						<Input
							{...field}
							id={"userEmail"}
							type={"email"}
							placeholder={m.auth_login_email_placeholder()}
						/>
					</FormControl>
				</FormItem>
			)}
		/>
	);
};

const PasswordField = () => {
	const { control } = useFormContext();
	return (
		<FormField
			name={"password"}
			control={control}
			render={({ field }) => (
				<FormItem className={"gap-1"}>
					<FormLabel htmlFor={"password"} className={"leading-5"} required>
						{m.auth_login_password_label()}
					</FormLabel>
					<FormControl>
						<PasswordInput
							{...field}
							id={"password"}
							placeholder={m.auth_login_password_placeholder()}
							required
						/>
					</FormControl>
				</FormItem>
			)}
		/>
	);
};

const RememberMeField = () => {
	const { control } = useFormContext();
	return (
		<FormField
			name={"rememberMe"}
			control={control}
			render={({ field }) => (
				<div className={"flex items-center justify-between"}>
					<FormItem className={"flex items-center gap-3 space-y-0"}>
						<FormControl>
							<Checkbox
								id={"rememberMe"}
								checked={field.value}
								onCheckedChange={field.onChange}
								className={"size-6"}
							/>
						</FormControl>
						<FormLabel
							htmlFor={"rememberMe"}
							className={"text-muted-foreground cursor-pointer"}
						>
							{m.auth_login_remember_me()}
						</FormLabel>
					</FormItem>
					<Button
						type={"button"}
						className={"hover:underline hover:bg-transparent p-0"}
						variant={"ghost"}
					>
						{m.auth_login_forgot_password()}
					</Button>
				</div>
			)}
		/>
	);
};
