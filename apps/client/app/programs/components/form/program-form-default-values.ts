import type { ProgramFormSchema } from "@/app/programs/components/form/program-form-schema";

export const programFormDefaultValues: ProgramFormSchema = {
	name: "",
	level: "",
	description: "",
	credits: 0,
	duration: 4,
};
