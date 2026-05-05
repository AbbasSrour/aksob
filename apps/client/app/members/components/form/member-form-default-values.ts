import type { UserFormSchema } from "@/app/members/components/form/member-form-schema.ts";

export const memberFormDefaultValues: UserFormSchema = {
	firstName: "",
	lastName: "",
	email: "",
	phoneNumber: "",
	userType: "student",
	major: "",
	company: "",
	title: "",
	password: "",
	passwordConfirmation: "",
};
