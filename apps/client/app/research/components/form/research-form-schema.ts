import { z } from "zod";

export const researchTypeValues = [
	"phd_position",
	"postdoc",
	"research_assistant",
	"visiting_researcher",
	"research_internship",
	"collaboration",
	"fellowship",
	"other",
] as const;

export const fundingValues = [
	"funded",
	"partial",
	"unfunded",
	"negotiable",
] as const;

export const educationLevelValues = [
	"undergraduate",
	"masters",
	"phd",
	"postdoc",
] as const;

export const researchFormSchema = z.object({
	title: z.string().min(1, "Title is required").max(200, "Title is too long"),
	content: z.string().min(1, "Content is required"),
	researchType: z.enum(researchTypeValues),
	institution: z.string().min(1, "Institution is required"),
	department: z.string().optional(),
	duration: z.string().optional(),
	funding: z.enum(fundingValues).optional(),
	location: z.string().optional(),
	startDate: z.string().optional(),
	deadline: z.string().optional(),
	educationLevel: z.enum(educationLevelValues).optional(),
	fieldOfStudy: z.string().optional(),
	experienceRequired: z.string().optional(),
	skillsRequired: z.string().optional(),
	additionalRequirements: z.string().optional(),
});

export type ResearchFormSchema = z.infer<typeof researchFormSchema>;

export const researchFormDefaultValues: ResearchFormSchema = {
	title: "",
	content: "",
	researchType: "phd_position",
	institution: "",
	department: "",
	duration: "",
	funding: undefined,
	location: "",
	startDate: "",
	deadline: "",
	educationLevel: undefined,
	fieldOfStudy: "",
	experienceRequired: "",
	skillsRequired: "",
	additionalRequirements: "",
};
