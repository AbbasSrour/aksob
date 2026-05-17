import { apiFetch } from "~/app/lib/api";

export interface NewsAuthor {
	id: string;
	name: string;
	image: string | null;
}

export interface NewsCategory {
	id: string;
	name: string;
}

export type NewsStatus = "draft" | "published";

export interface NewsArticle {
	id: string;
	title: string;
	excerpt: string;
	content: string;
	coverImage: string | null;
	thumbnailImage: string | null;
	readTime: number | null;
	status: NewsStatus;
	publishedAt: string | null;
	date: string | null;
	author: NewsAuthor;
	category: NewsCategory | null;
	createdAt: string;
	updatedAt: string;
}

interface NewsListResponse {
	status: string;
	data: NewsArticle[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

interface NewsArticleResponse {
	status: string;
	data: NewsArticle;
}

export async function listLatestNews(limit = 3) {
	return apiFetch<NewsListResponse>(`/api/news?limit=${limit}`);
}

export async function getNewsArticle(id: string) {
	return apiFetch<NewsArticleResponse>(`/api/news/${id}`);
}
