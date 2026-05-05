import type { MajorFormSchema } from "@/app/majors/components/form/major-form-schema";

export const majorFormDefaultValues: MajorFormSchema = {
	name: "",
	description: "",
	credits: 0,
	duration: 4,
};
