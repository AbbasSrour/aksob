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
	coverImage: z.string().optional(),
	thumbnailImage: z.string().optional(),
	category: z.enum(storyCategoryValues),
	storyDate: z.string().min(1, "Date is required"),
	authorId: z.string().min(1, "Author is required"),
});

export type StoryFormSchema = z.infer<typeof storyFormSchema>;

export const storyFormDefaultValues: StoryFormSchema = {
	title: "",
	description: "",
	content: "",
	coverImage: "",
	thumbnailImage: "",
	category: "career_advancement",
	storyDate: "",
	authorId: "",
};
