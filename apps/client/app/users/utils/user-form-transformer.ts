import type { UserFormSchema } from "@/app/users/components/form/user-form-schema.ts";
import type {
	AdminUser,
	CreateUserInput,
	UpdateUserInput,
} from "@/app/users/hooks/api/users.functions.ts";

export const userToFormValues = (user: AdminUser): UserFormSchema => {
	const [firstName, ...rest] = user.name?.split(" ") || [""];
	const lastName = rest.join(" ");

	return {
		firstName,
		lastName,
		email: user.email,
		phoneNumber: user.phoneNumber ?? "",
		password: "",
		passwordConfirmation: "",
	};
};

export const formToCreateUserPayload = (
	values: UserFormSchema,
): CreateUserInput => {
	const phoneNumber = values.phoneNumber?.trim();
	const name = `${values.firstName} ${values.lastName}`.trim();

	return {
		email: values.email,
		password: values.password || undefined,
		name,
		role: "admin",
		...(phoneNumber ? { data: { phoneNumber } } : {}),
	} satisfies CreateUserInput;
};

export const formToUpdateUserPayload = (
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
			role: "admin",
			...(phoneNumber ? { phoneNumber } : {}),
		},
	} satisfies UpdateUserInput;
};
