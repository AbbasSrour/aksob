import { z } from "zod";

export const storyCategoryValues = [
	"career_advancement",
	"entrepreneurship",
	"industry_recognition",
	"social_impact",
	"academic_achievement",
	"innovation",
	"leadership",
	"community_service",
	"other",
] as const;

export const storyFormSchema = z.object({
	title: z.string().min(1, "Title is required").max(200, "Title is too long"),
	description: z
		.string()
		.min(1, "Description is required")
		.max(500, "Description is too long"),
	content: z.string().min(1, "Content is required"),
	category: z.enum(storyCategoryValues),
	storyDate: z.string().optional(),
	authorId: z.string().optional(),
});

export type StoryFormSchema = z.infer<typeof storyFormSchema>;

export const storyFormDefaultValues: StoryFormSchema = {
	title: "",
	description: "",
	content: "",
	category: "career_advancement",
	storyDate: "",
	authorId: "",
};
