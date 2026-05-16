import type { UserFormSchema } from "@/app/members/components/form/member-form-schema.ts";
import type {
	AdminUser,
	CreateUserInput,
	UpdateUserInput,
} from "@/app/users/hooks/api/users.functions.ts";

export type MemberUser = AdminUser & {
	type?: string;
	program?: string | null;
	company?: string | null;
	title?: string | null;
};

export const memberToFormValues = (user: MemberUser): UserFormSchema => {
	const [firstName, ...rest] = user.name?.split(" ") || [""];
	const lastName = rest.join(" ");

	return {
		firstName,
		lastName,
		email: user.email,
		phoneNumber: user.phoneNumber ?? "",
		userType: user.type ?? "student",
		program: user.program ?? "",
		company: user.company ?? "",
		title: user.title ?? "",
		password: "",
		passwordConfirmation: "",
	};
};

export const formToCreateMemberPayload = (
	values: UserFormSchema,
): CreateUserInput => {
	const phoneNumber = values.phoneNumber?.trim();
	const name = `${values.firstName} ${values.lastName}`.trim();

	return {
		email: values.email,
		password: values.password || undefined,
		name,
		role: "user",
		data: {
			...(phoneNumber ? { phoneNumber } : {}),
			type: values.userType,
			major: values.major,
		},
	} satisfies CreateUserInput;
};

export const formToUpdateMemberPayload = (
	values: UserFormSchema,
	userId: string,
): UpdateUserInput => {
	const phoneNumber = values.phoneNumber?.trim();
	const name = `${values.firstName} ${values.lastName}`.trim();

	return {
		userId,
		data: {
			name,
			email: values.email,
			role: "user",
			...(phoneNumber ? { phoneNumber } : {}),
			type: values.userType,
			major: values.major,
		},
	} satisfies UpdateUserInput;
};

export const formToUpdateMemberPayload = (
	values: UserFormSchema,
	userId: string,
): UpdateUserInput => {
	const phoneNumber = values.phoneNumber?.trim();
	const name = `${values.firstName} ${values.lastName}`.trim();

	return {
		userId,
		data: {
			name,
			email: values.email,
			role: "user",
			...(phoneNumber ? { phoneNumber } : {}),
			type: values.userType,
			program: values.program,
			company: values.company?.trim(),
			title: values.title?.trim(),
		},
	} satisfies UpdateUserInput;
};
