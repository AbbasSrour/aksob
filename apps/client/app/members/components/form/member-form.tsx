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
import { memberFormDefaultValues } from "@/app/members/components/form/member-form-default-values";
import {
	buildMemberFormSchema,
	type UserFormSchema,
} from "@/app/members/components/form/member-form-schema";
import { memberUserTypes } from "@/app/members/constants/member-user-types";
import {
	useCreateMember,
	useUpdateMember,
} from "@/app/members/hooks/api/members.queries";
import {
	formToCreateMemberPayload,
	formToUpdateMemberPayload,
} from "@/app/members/utils/member-form-transformer";
import { formKeyFactory } from "@/constants/form-key-factory";
import { m } from "@/paraglide/messages";

export const MemberForm = ({
	defaultValues,
	memberId,
}: {
	defaultValues?: UserFormSchema;
	memberId?: string;
}) => {
	const location = useLocation();
	const navigate = useNavigate();
	const isCreate = location.pathname.endsWith("/create");

	const form = useForm<UserFormSchema>({
		mode: "onSubmit",
		reValidateMode: "onChange",
		defaultValues: defaultValues || memberFormDefaultValues,
		resolver: standardSchemaResolver(
			buildMemberFormSchema({ requirePassword: isCreate }),
		),
	});

	const { mutate: createMember } = useCreateMember();
	const { mutate: updateMember } = useUpdateMember();

	const onSubmit = (values: UserFormSchema) => {
		if (isCreate) {
			const payload = formToCreateMemberPayload(values);

			createMember(payload, {
				onSuccess: () => {
					void navigate({
						to: "/admin/members",
					});
				},
			});

			return;
		}

		if (!memberId) {
			return;
		}

		const payload = formToUpdateMemberPayload(values, memberId);

		updateMember(payload, {
			onSuccess: () => {
				void navigate({
					to: "/admin/members",
				});
			},
		});
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit, console.log)}
				id={formKeyFactory.members.form}
			>
				<FormContent>
					<FormSection layout={"vertical"}>
						<FormSectionHeader>
							<FormSectionTitle>
								{m.members_form_section_personal_title()}
							</FormSectionTitle>
							<FormSectionDescription>
								{m.members_form_section_personal_description()}
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
								{m.members_form_section_profile_title()}
							</FormSectionTitle>
							<FormSectionDescription>
								{m.members_form_section_profile_description()}
							</FormSectionDescription>
						</FormSectionHeader>

						<FormSectionContent cols={1} spacing="lg">
							<FormRow cols={4}>
								<UserTypeField />
							</FormRow>
						</FormSectionContent>
					</FormSection>

					<FormSection layout={"vertical"}>
						<FormSectionHeader>
							<FormSectionTitle>
								{m.members_form_section_account_title()}
							</FormSectionTitle>
							<FormSectionDescription>
								{m.members_form_section_account_description()}
							</FormSectionDescription>
						</FormSectionHeader>

						<FormSectionContent layout="flex" direction="column" spacing="lg">
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
					<FormLabel>{m.members_form_first_name_label()}</FormLabel>
					<FormControl>
						<Input
							{...field}
							placeholder={m.members_form_first_name_placeholder()}
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
					<FormLabel>{m.members_form_last_name_label()}</FormLabel>
					<FormControl>
						<Input
							{...field}
							placeholder={m.members_form_last_name_placeholder()}
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
					<FormLabel>{m.members_form_email_label()}</FormLabel>
					<FormControl>
						<EmailInput
							{...field}
							placeholder={m.members_form_email_placeholder()}
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
					<FormLabel>{m.members_form_phone_label()}</FormLabel>
					<FormControl>
						<PhoneInput
							{...field}
							placeholder={m.members_form_phone_placeholder()}
							defaultCountry={"LB"}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};

const UserTypeField = () => {
	const { control } = useFormContext();

	return (
		<FormField
			name={"userType"}
			control={control}
			render={({ field }) => (
				<FormItem>
					<FormLabel>{m.members_form_user_type_label()}</FormLabel>
					<FormControl>
						<Select value={field.value} onValueChange={field.onChange}>
							<SelectTrigger className="w-full">
								<SelectValue
									placeholder={m.members_form_user_type_placeholder()}
								/>
							</SelectTrigger>
							<SelectContent>
								{memberUserTypes.map((type) => {
									const Icon = type.icon;
									return (
										<SelectItem key={type.value} value={type.value}>
											<div className="flex items-center gap-2">
												{Icon && <Icon className="size-4" />}
												{type.label}
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
					<FormLabel>{m.members_form_password_label()}</FormLabel>
					<FormControl>
						<PasswordInput
							{...field}
							placeholder={m.members_form_password_placeholder()}
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
					<FormLabel>{m.members_form_password_confirm_label()}</FormLabel>
					<FormControl>
						<PasswordInput
							{...field}
							placeholder={m.members_form_password_placeholder()}
						/>
					</FormControl>
					<FormDescription>
						{m.members_form_password_confirm_description()}
					</FormDescription>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};
