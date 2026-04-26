import { DataTableIconLabelCell } from "@aksob/ui/components/data-table/cells/data-table-icon-label-cell";
import { AvatarInput } from "@aksob/ui/components/form/avatar-input";
import { EmailInput } from "@aksob/ui/components/form/email-input";
import { PasswordInput } from "@aksob/ui/components/form/password-input";
import { PhoneInput } from "@aksob/ui/components/form/phone-input";
import { Main } from "@aksob/ui/components/layout/main";
import { Avatar, AvatarFallback, AvatarImage } from "@aksob/ui/core/avatar";
import { Badge } from "@aksob/ui/core/badge";
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
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CalendarClockIcon, KeyRoundIcon, MailIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { userRoleTypes } from "@/app/users/constants/user-role-types.ts";
import { env } from "@/config/env.ts";
import { type AuthClient, authClient, useSession } from "@/lib/auth.ts";
import { useMediaUpload } from "@/lib/media";
import { m } from "@/paraglide/messages";

const profileFormSchema = z.object({
	firstName: z.string().trim().min(1, { message: "First name is required" }),
	lastName: z.string().trim().min(1, { message: "Last name is required" }),
	phoneNumber: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type SessionUser = AuthClient["$Infer"]["Session"]["user"];

export const Route = createFileRoute("/admin/profile")({
	validateSearch: z.object({
		error: z.string().optional(),
	}),
	head: () => ({
		meta: [
			{
				title: m.profile_page_title(),
			},
			{
				name: "description",
				content: m.profile_page_description(),
			},
			{
				property: "og:title",
				content: m.profile_page_title(),
			},
			{
				property: "og:description",
				content: m.profile_page_description(),
			},
		],
	}),
	component: ProfilePage,
});

function ProfilePage() {
	const navigate = useNavigate();
	const { error: verifyEmailError } = Route.useSearch();
	const { data: sessionData, refetch } = useSession();
	const [mediaFiles, setMediaFiles] = useState<File[]>([]);

	const user = sessionData?.user;
	const session = sessionData?.session;
	const emailStatus = user?.emailVerified
		? m.profile_status_verified()
		: m.profile_status_unverified();
	const defaultValues = useMemo(() => getProfileFormValues(user), [user]);
	const { startUpload } = useMediaUpload("media");

	const refetchSession = async () => {
		await refetch({
			query: {
				disableCookieCache: true,
			},
		});
	};

	useEffect(() => {
		if (!verifyEmailError) {
			return;
		}

		const message =
			verifyEmailError === "TOKEN_EXPIRED"
				? m.profile_verify_email_error_expired()
				: verifyEmailError === "INVALID_TOKEN"
					? m.profile_verify_email_error_invalid()
					: m.profile_verify_email_error_generic();

		toast.error(message);

		void navigate({
			to: "/admin/profile",
			search: {},
			replace: true,
		});
	}, [verifyEmailError, navigate]);

	const form = useForm<ProfileFormValues>({
		mode: "onSubmit",
		reValidateMode: "onChange",
		defaultValues,
		resolver: standardSchemaResolver(profileFormSchema),
	});

	useEffect(() => {
		if (!form.formState.isDirty) {
			form.reset(defaultValues);
		}
	}, [defaultValues, form]);

	const handleSubmit = form.handleSubmit(async (values) => {
		if (!user) {
			return;
		}

		const name = `${values.firstName} ${values.lastName}`.trim();
		const phoneNumber = values.phoneNumber?.trim();
		const pendingAvatar = mediaFiles[0];

		const updateData: {
			name: string;
			phoneNumber: string;
			image?: string;
		} = {
			name,
			phoneNumber: phoneNumber || "",
		};

		if (pendingAvatar) {
			try {
				const uploadedFiles = await startUpload([pendingAvatar]);
				const mediaUrl = uploadedFiles?.[0]?.serverData?.mediaUrl;

				if (!mediaUrl) {
					toast.error(m.profile_photo_upload_error());
					return;
				}

				updateData.image = mediaUrl;
			} catch {
				toast.error(m.profile_photo_upload_error());
				return;
			}
		}

		const result = await authClient.admin.updateUser({
			userId: user.id,
			data: updateData,
		});

		if (result.error) {
			toast.error(result.error.message || m.profile_save_error());
			return;
		}

		setMediaFiles([]);
		form.reset(values);
		await refetchSession();
		toast.success(m.profile_save_success());
	});

	if (!user || !session) {
		return null;
	}

	return (
		<Main>
			<div className="mx-auto w-full max-w-2xl space-y-14 pb-4">
				<header>
					<div className="flex min-w-0 gap-5">
						<AvatarInput
							value={mediaFiles}
							onValueChange={setMediaFiles}
							onFileReject={(_, message) => {
								toast.error(message);
							}}
							accept="image/*"
							maxFiles={1}
							maxSize={4 * 1024 * 1024}
							multiple={false}
							disabled={form.formState.isSubmitting}
							label={m.profile_photo_title()}
							uploading={form.formState.isSubmitting}
							preview={
								<Avatar className="size-full border-0 bg-muted/30">
									<AvatarImage src={user.image ?? ""} alt={user.name} />
									<AvatarFallback className="text-lg font-semibold">
										{getInitials(user.name, user.email)}
									</AvatarFallback>
								</Avatar>
							}
						/>
						<div className="min-w-0 flex-1 space-y-3">
							<div>
								<h1 className="text-2xl font-semibold tracking-tight text-foreground">
									{user.name}
								</h1>
								<p className="mt-1 truncate text-sm text-muted-foreground">
									{user.email}
								</p>
							</div>
							<div className="flex flex-wrap gap-2">
								<Badge variant="outline" className="max-w-full font-normal">
									<DataTableIconLabelCell
										value={user.role}
										options={userRoleTypes}
										capitalize={false}
										fallback={m.profile_empty_value()}
										iconSize={14}
										className="gap-1.5"
										labelClassName="text-xs font-medium"
									/>
								</Badge>
								<Badge
									variant={user.emailVerified ? "secondary" : "outline"}
									className="font-normal"
								>
									<MailIcon />
									{emailStatus}
								</Badge>
								<Badge variant="outline" className="max-w-full font-normal">
									<CalendarClockIcon />
									<span className="truncate">
										{m.profile_field_session_expires()} ·{" "}
										{formatDateValue(session.expiresAt)}
									</span>
								</Badge>
							</div>
					</div>
					</div>
				</header>

				<Form {...form}>
					<form onSubmit={handleSubmit} className="space-y-8">
						<ProfileSectionHeader
							title={m.profile_form_title()}
							description={m.profile_form_description()}
						/>
						<div className="grid gap-5 sm:grid-cols-2">
							<FirstNameField />
							<LastNameField />
							<div className="sm:col-span-2">
								<PhoneField />
							</div>
						</div>
						<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<p className="text-sm text-muted-foreground">
								{m.profile_form_hint()}
							</p>
							<Button
								type="submit"
								className="w-full sm:w-auto"
								loading={form.formState.isSubmitting}
								disabled={
									!form.formState.isDirty &&
									mediaFiles.length === 0 &&
									!form.formState.isSubmitting
								}
							>
								{m.profile_save_button()}
							</Button>
						</div>
					</form>
				</Form>

				<div className="space-y-10 border-t border-border/50 pt-14">
					<ProfileSectionHeader
						title={m.profile_security_section_title()}
						description={m.profile_security_section_description()}
					/>

					<div className="space-y-12">
						<section className="space-y-4">
							<div className="flex items-center gap-2 text-foreground">
								<KeyRoundIcon className="size-4 text-muted-foreground" />
								<h3 className="text-sm font-semibold">
									{m.profile_password_section_title()}
								</h3>
							</div>
							<p className="max-w-lg text-sm text-muted-foreground">
								{m.profile_password_section_hint()}
							</p>
							<ProfilePasswordForm
								embedded
								onPasswordUpdated={refetchSession}
							/>
						</section>

						<section className="space-y-4 border-t border-border/40 pt-12">
							<div className="flex items-center gap-2 text-foreground">
								<MailIcon className="size-4 text-muted-foreground" />
								<h3 className="text-sm font-semibold">
									{m.profile_email_section_title()}
								</h3>
							</div>
							<ProfileEmailChangeForm
								key={user.email}
								embedded
								currentEmail={user.email}
								onEmailChangeRequested={refetchSession}
							/>
						</section>
					</div>
				</div>
			</div>
		</Main>
	);
}

const profilePasswordSchema = z
	.object({
		currentPassword: z.string().min(1),
		newPassword: z.string().min(8),
		confirmPassword: z.string().min(1),
	})
	.refine((values) => values.newPassword === values.confirmPassword, {
		message: m.profile_password_mismatch(),
		path: ["confirmPassword"],
	});

type ProfilePasswordFormValues = z.infer<typeof profilePasswordSchema>;

function ProfilePasswordForm({
	embedded = false,
	onPasswordUpdated,
}: {
	embedded?: boolean;
	onPasswordUpdated: () => Promise<void>;
}) {
	const form = useForm<ProfilePasswordFormValues>({
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
		resolver: standardSchemaResolver(profilePasswordSchema),
	});

	const handleSubmit = form.handleSubmit(async (values) => {
		const result = await authClient.changePassword({
			currentPassword: values.currentPassword,
			newPassword: values.newPassword,
			revokeOtherSessions: true,
		});

		if (result.error) {
			toast.error(result.error.message || m.profile_password_error());
			return;
		}

		form.reset();
		toast.success(m.profile_password_success());
		await onPasswordUpdated();
	});

	return (
		<Form {...form}>
			<form className="space-y-4" onSubmit={handleSubmit}>
				{embedded ? null : (
					<div className="space-y-1">
						<h4 className="text-base font-semibold">
							{m.profile_password_section_title()}
						</h4>
						<p className="text-sm text-muted-foreground">
							{m.profile_password_section_hint()}
						</p>
					</div>
				)}

				<FormField
					control={form.control}
					name="currentPassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{m.profile_password_current_label()}</FormLabel>
							<FormControl>
								<PasswordInput {...field} autoComplete="current-password" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="newPassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{m.profile_password_new_label()}</FormLabel>
							<FormControl>
								<PasswordInput {...field} autoComplete="new-password" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="confirmPassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{m.profile_password_confirm_label()}</FormLabel>
							<FormControl>
								<PasswordInput {...field} autoComplete="new-password" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="flex justify-end">
					<Button
						type="submit"
						className="w-full sm:w-auto"
						loading={form.formState.isSubmitting}
					>
						{m.profile_password_submit()}
					</Button>
				</div>
			</form>
		</Form>
	);
}

function ProfileEmailChangeForm({
	embedded = false,
	currentEmail,
	onEmailChangeRequested,
}: {
	embedded?: boolean;
	currentEmail: string;
	onEmailChangeRequested: () => Promise<void>;
}) {
	const emailSchema = useMemo(
		() =>
			z
				.object({
					newEmail: z.email(),
				})
				.refine(
					(values) =>
						values.newEmail.trim().toLowerCase() !==
						currentEmail.trim().toLowerCase(),
					{
						message: m.profile_email_same_error(),
						path: ["newEmail"],
					},
				),
		[currentEmail],
	);

	const form = useForm<{ newEmail: string }>({
		defaultValues: { newEmail: "" },
		resolver: standardSchemaResolver(emailSchema),
	});

	const handleSubmit = form.handleSubmit(async (values) => {
		const callbackURL = new URL("/admin/profile", env.VITE_APP_URL).toString();
		const result = await authClient.changeEmail({
			newEmail: values.newEmail.trim().toLowerCase(),
			callbackURL,
		});

		if (result.error) {
			toast.error(result.error.message || m.profile_email_error());
			return;
		}

		form.reset({ newEmail: "" });
		toast.success(m.profile_email_success());
		await onEmailChangeRequested();
	});

	return (
		<Form {...form}>
			<form className="space-y-4" onSubmit={handleSubmit}>
				{embedded ? null : (
					<div className="space-y-1">
						<h4 className="text-base font-semibold">
							{m.profile_email_section_title()}
						</h4>
					</div>
				)}

				<FormItem>
					<FormLabel>{m.profile_email_current_label()}</FormLabel>
					<FormControl>
						<Input value={currentEmail} readOnly disabled />
					</FormControl>
				</FormItem>

				<FormField
					control={form.control}
					name="newEmail"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{m.profile_email_new_label()}</FormLabel>
							<FormControl>
								<EmailInput
									{...field}
									type="email"
									autoComplete="email"
									placeholder={m.profile_email_placeholder()}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="flex justify-end">
					<Button
						type="submit"
						className="w-full sm:w-auto"
						loading={form.formState.isSubmitting}
					>
						{m.profile_email_submit()}
					</Button>
				</div>
			</form>
		</Form>
	);
}

const FirstNameField = () => {
	const { control } = useFormContext<ProfileFormValues>();

	return (
		<FormField
			control={control}
			name="firstName"
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
	const { control } = useFormContext<ProfileFormValues>();

	return (
		<FormField
			control={control}
			name="lastName"
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

const PhoneField = () => {
	const { control } = useFormContext<ProfileFormValues>();

	return (
		<FormField
			control={control}
			name="phoneNumber"
			render={({ field }) => (
				<FormItem>
					<FormLabel>{m.users_form_phone_label()}</FormLabel>
					<FormControl>
						<PhoneInput
							{...field}
							placeholder={m.users_form_phone_placeholder()}
							defaultCountry="LB"
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};

function ProfileSectionHeader({
	title,
	description,
}: {
	title: string;
	description?: string;
}) {
	return (
		<div className="space-y-1">
			<h2 className="text-base font-semibold tracking-tight text-foreground">
				{title}
			</h2>
			{description ? (
				<p className="text-sm text-muted-foreground">{description}</p>
			) : null}
		</div>
	);
}

function formatDateValue(value: Date | number | string | null | undefined) {
	if (!value) {
		return m.profile_empty_value();
	}

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return m.profile_empty_value();
	}

	return new Intl.DateTimeFormat(undefined, {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(date);
}

function getInitials(name?: string | null, email?: string | null) {
	const source = name?.trim() || email?.trim() || "AK";
	const parts = source.split(/\s+/).filter(Boolean);

	if (parts.length >= 2) {
		return `${parts[0]?.[0] || ""}${parts[1]?.[0] || ""}`.toUpperCase();
	}

	return source.slice(0, 2).toUpperCase();
}

function getProfileFormValues(user?: SessionUser): ProfileFormValues {
	const [firstName, ...rest] = user?.name?.split(" ") || [""];

	return {
		firstName,
		lastName: rest.join(" "),
		phoneNumber: user?.phoneNumber ?? "",
	};
}
