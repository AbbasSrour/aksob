import { z } from "zod";

export const donorFormSchema = z.object({
	name: z.string().min(1, { message: "Name is required" }),
	position: z.string().min(1, { message: "Position is required" }),
	company: z.string().min(1, { message: "Company is required" }),
	donationAmount: z
		.string()
		.optional()
		.default("")
		.refine(
			(val) => !val || (!Number.isNaN(Number(val)) && Number(val) >= 0),
			{ message: "Amount must be a number 0 or greater" },
		),
	message: z.string().optional().default(""),
	image: z.string().optional().default(""),
});

export type DonorFormSchema = z.infer<typeof donorFormSchema>;
