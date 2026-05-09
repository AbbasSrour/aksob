import { z } from "zod";

export const newsFormSchema = z.object({
	title: z.string().min(1, "Title is required").max(200, "Title is too long"),
	excerpt: z
		.string()
		.min(1, "Excerpt is required")
		.max(500, "Excerpt is too long"),
	content: z.string().min(1, "Content is required"),
	coverImage: z.string().optional(),
	thumbnailImage: z.string().optional(),
	categoryId: z.string().optional(),
	authorId: z.string().optional(),
	date: z.string().optional(),
});

export type NewsFormSchema = z.infer<typeof newsFormSchema>;

export const newsFormDefaultValues: NewsFormSchema = {
	title: "",
	excerpt: "",
	content: "",
	coverImage: "",
	thumbnailImage: "",
	categoryId: "",
	authorId: "",
	date: "",
};
