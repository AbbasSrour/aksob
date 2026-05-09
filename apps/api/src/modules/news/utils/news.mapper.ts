import type { schema } from "@/db";

type NewsAuthor = Pick<
	typeof schema.user.$inferSelect,
	"id" | "name" | "image"
>;

type NewsDtoInput = typeof schema.news.$inferSelect & {
	author: NewsAuthor | null;
	category: typeof schema.newsCategory.$inferSelect | null;
};

const toIsoString = (date: Date | null) => date?.toISOString() ?? null;

export const toNewsDto = (news: NewsDtoInput) => {
	if (!news.author) {
		throw new Error(`News article ${news.id} is missing an author`);
	}

	return {
		id: news.id,
		title: news.title,
		excerpt: news.excerpt,
		content: news.content,
		coverImage: news.coverImage,
		thumbnailImage: news.thumbnailImage,
		readTime: news.readTime,
		status: news.status,
		publishedAt: toIsoString(news.publishedAt),
		date: toIsoString(news.date),
		author: {
			id: news.author.id,
			name: news.author.name,
			image: news.author.image,
		},
		category: news.category
			? {
					id: news.category.id,
					name: news.category.name,
				}
			: null,
		createdAt: news.createdAt.toISOString(),
		updatedAt: news.updatedAt.toISOString(),
	};
};
