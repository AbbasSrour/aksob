import { z } from "zod";

export const opportunityTypeValues = ["job", "internship"] as const;

export const opportunityFormSchema = z.object({
	type: z.enum(opportunityTypeValues),
	company: z
		.string()
		.min(1, "Company is required")
		.max(200, "Company name is too long"),
	contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
	applyUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export type OpportunityFormSchema = z.infer<typeof opportunityFormSchema>;

export const opportunityFormDefaultValues: OpportunityFormSchema = {
	type: "job",
	company: "",
	contactEmail: "",
	applyUrl: "",
};
