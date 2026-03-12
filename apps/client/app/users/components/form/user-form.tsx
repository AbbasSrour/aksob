import { EmailInput } from "@aksob/ui/components/form/email-input";
import { PasswordInput } from "@aksob/ui/components/form/password-input";
import { PhoneInput } from "@aksob/ui/components/form/phone-input";
import {
	Form,
	FormContent,
	FormControl,
	FormDescription,
	FormField,
	FormFooter,
	FormItem,
	FormLabel,
	FormMessage,
	FormRow,
	FormSection,
	FormSectionContent,
	FormSectionDescription,
	FormSectionHeader,
	FormSectionTitle,
} from "@aksob/ui/core/form";
import { Input } from "@aksob/ui/core/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@aksob/ui/core/select";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useForm, useFormContext } from "react-hook-form";
import { userFormDefaultValues } from "@/app/users/components/form/user-form-default-values.ts";
import {
	buildUserFormSchema,
	type UserFormSchema,
} from "@/app/users/components/form/user-form-schema.ts";
import { userRoleTypes } from "@/app/users/constants/user-role-types.ts";
import {
	useCreateUser,
	useUpdateUser,
} from "@/app/users/hooks/api/users.queries.ts";
import {
	formToCreateUserPayload,
	formToUpdateUserPayload,
} from "@/app/users/utils/user-form-transformer.ts";
import { formKeyFactory } from "@/constants/form-key-factory.ts";
import { m } from "@/paraglide/messages";

export const UserForm = ({
	defaultValues,
	userId,
}: {
	defaultValues?: UserFormSchema;
	userId?: string;
}) => {
	const location = useLocation();
	const navigate = useNavigate();
	const isCreate = location.pathname.endsWith("/create");

	console.log(defaultValues);

	const form = useForm<UserFormSchema>({
		mode: "onSubmit",
		reValidateMode: "onChange",
		defaultValues: defaultValues || userFormDefaultValues,
		resolver: standardSchemaResolver(
			buildUserFormSchema({ requirePassword: isCreate }),
		),
	});

	const { mutate: createUser } = useCreateUser();
	const { mutate: updateUser } = useUpdateUser();

	const onSubmit = (values: UserFormSchema) => {
		if (isCreate) {
			const payload = formToCreateUserPayload(values);

			createUser(payload, {
				onSuccess: () => {
					void navigate({
						to: "/admin/users",
					});
				},
			});

			return;
		}

		if (!userId) {
			return;
		}

		const payload = formToUpdateUserPayload(values, userId);

		updateUser(payload, {
			onSuccess: () => {
				void navigate({
					to: "/admin/users",
				});
			},
		});
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit, console.log)}
				id={formKeyFactory.users.form}
			>
				<FormContent>
					<FormSection layout={"vertical"}>
						<FormSectionHeader>
							<FormSectionTitle>
								{m.users_form_section_personal_title()}
							</FormSectionTitle>
							<FormSectionDescription>
								{m.users_form_section_personal_description()}
							</FormSectionDescription>
						</FormSectionHeader>

						<FormSectionContent cols={1} spacing="lg">
							<FormRow cols={4}>
								<FirstNameField />
								<LastNameField />
							</FormRow>

							<FormRow cols={4}>
								<EmailField />
							</FormRow>

							<FormRow cols={4}>
								<PhoneField />
							</FormRow>
						</FormSectionContent>
					</FormSection>

					<FormSection layout={"vertical"}>
						<FormSectionHeader>
							<FormSectionTitle>
								{m.users_form_section_account_title()}
							</FormSectionTitle>
							<FormSectionDescription>
								{m.users_form_section_account_description()}
							</FormSectionDescription>
						</FormSectionHeader>

						<FormSectionContent layout="flex" direction="column" spacing="lg">
							<FormRow cols={4}>
								<RoleField />
							</FormRow>

							{isCreate ? (
								<FormRow cols={4}>
									<PasswordField />
									<ConfirmPasswordField />
								</FormRow>
							) : null}
						</FormSectionContent>
					</FormSection>
				</FormContent>
				<FormFooter />
			</form>
		</Form>
	);
};

const FirstNameField = () => {
	const { control } = useFormContext();

	return (
		<FormField
			control={control}
			name={"firstName"}
			render={({ field }) => (
				<FormItem>
					<FormLabel>{m.users_form_first_name_label()}</FormLabel>
					<FormControl>
						<Input
							{...field}
							placeholder={m.users_form_first_name_placeholder()}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};

const LastNameField = () => {
	const { control } = useFormContext();

	return (
		<FormField
			control={control}
			name={"lastName"}
			render={({ field }) => (
				<FormItem>
					<FormLabel>{m.users_form_last_name_label()}</FormLabel>
					<FormControl>
						<Input
							{...field}
							placeholder={m.users_form_last_name_placeholder()}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};

const EmailField = () => {
	const { control } = useFormContext();

	return (
		<FormField
			control={control}
			name={"email"}
			render={({ field }) => (
				<FormItem>
					<FormLabel>{m.users_form_email_label()}</FormLabel>
					<FormControl>
						<EmailInput
							{...field}
							placeholder={m.users_form_email_placeholder()}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};

const PhoneField = () => {
	const { control } = useFormContext();

	return (
		<FormField
			control={control}
			name={"phoneNumber"}
			render={({ field }) => (
				<FormItem>
					<FormLabel>{m.users_form_phone_label()}</FormLabel>
					<FormControl>
						<PhoneInput
							{...field}
							placeholder={m.users_form_phone_placeholder()}
							defaultCountry={"LB"}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};

const RoleField = () => {
	const { control } = useFormContext();

	return (
		<FormField
			name={"role"}
			control={control}
			render={({ field }) => (
				<FormItem>
					<FormLabel>{m.users_form_role_label()}</FormLabel>
					<FormControl>
						<Select value={field.value} onValueChange={field.onChange}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder={m.users_role_select_placeholder()} />
							</SelectTrigger>
							<SelectContent>
								{userRoleTypes.map((role) => {
									const Icon = role.icon;
									return (
										<SelectItem key={role.value} value={role.value}>
											<div className="flex items-center gap-2">
												{Icon && <Icon className="size-4" />}
												{role.label}
											</div>
										</SelectItem>
									);
								})}
							</SelectContent>
						</Select>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};

const PasswordField = () => {
	const { control } = useFormContext();

	return (
		<FormField
			control={control}
			name={"password"}
			render={({ field }) => (
				<FormItem>
					<FormLabel>{m.users_form_password_label()}</FormLabel>
					<FormControl>
						<PasswordInput
							{...field}
							placeholder={m.users_form_password_placeholder()}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};

const ConfirmPasswordField = () => {
	const { control } = useFormContext();

	return (
		<FormField
			name={"passwordConfirmation"}
			control={control}
			render={({ field }) => (
				<FormItem>
					<FormLabel>{m.users_form_password_confirm_label()}</FormLabel>
					<FormControl>
						<PasswordInput
							{...field}
							placeholder={m.users_form_password_placeholder()}
						/>
					</FormControl>
					<FormDescription>
						{m.users_form_password_confirm_description()}
					</FormDescription>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};
