import type { schema } from "@/db";

type StoryAuthor = Pick<
	typeof schema.user.$inferSelect,
	"id" | "name" | "image"
>;

type StoryReviewer = Pick<typeof schema.user.$inferSelect, "id" | "name">;

type StoryDtoInput = typeof schema.story.$inferSelect & {
	author: StoryAuthor | null;
	reviewer?: StoryReviewer | null;
};

const toIsoString = (date: Date | null) => date?.toISOString() ?? null;

export const toStoryDto = (story: StoryDtoInput) => {
	if (!story.author) {
		throw new Error(`Story ${story.id} is missing an author`);
	}

	return {
		id: story.id,
		title: story.title,
		description: story.description,
		content: story.content,
		coverImage: story.coverImage,
		thumbnailImage: story.thumbnailImage,
		category: story.category,
		storyDate: toIsoString(story.storyDate),
		status: story.status,
		author: {
			id: story.author.id,
			name: story.author.name,
			image: story.author.image,
			major: null,
		},
		reviewedBy: story.reviewer
			? {
					id: story.reviewer.id,
					name: story.reviewer.name,
				}
			: null,
		reviewNotes: story.reviewNotes,
		reviewedAt: toIsoString(story.reviewedAt),
		createdAt: story.createdAt.toISOString(),
		updatedAt: story.updatedAt.toISOString(),
	};
};
