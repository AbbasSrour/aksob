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

export interface ListNewsParams {
	page?: number;
	limit?: number;
	category?: string;
	status?: string;
	search?: string;
}

export async function listNews(params?: ListNewsParams) {
	const searchParams = new URLSearchParams();
	if (params?.page) searchParams.set("page", String(params.page));
	if (params?.limit) searchParams.set("limit", String(params.limit));
	if (params?.category) searchParams.set("category", params.category);
	if (params?.status) searchParams.set("status", params.status);
	if (params?.search) searchParams.set("search", params.search);

	const qs = searchParams.toString();
	return apiFetch<NewsListResponse>(`/api/news${qs ? `?${qs}` : ""}`);
}

export async function getNewsArticle(id: string) {
	return apiFetch<NewsArticleResponse>(`/api/news/${id}`);
}
