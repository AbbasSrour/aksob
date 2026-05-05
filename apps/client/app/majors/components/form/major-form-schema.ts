import { z } from "zod";

export const majorFormSchema = z.object({
	name: z.string().min(1, { message: "Name is required" }),
	description: z.string().optional().default(""),
	credits: z.coerce.number().min(0, { message: "Credits must be 0 or more" }).default(0),
	duration: z.coerce.number().min(0, { message: "Duration must be 0 or more" }).default(4),
});

export type MajorFormSchema = z.infer<typeof majorFormSchema>;
