import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { api } from "@/lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NewsAuthor {
	id: string;
	name: string;
	image: string | null;
}

export interface NewsCategory {
	id: string;
	name: string;
	createdAt: string;
	updatedAt: string;
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

export interface ListNewsResponse {
	status: "ok";
	data: NewsArticle[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export interface NewsResponse {
	status: "ok";
	data: NewsArticle;
}

export interface NewsCategoryResponse {
	status: "ok";
	data: NewsCategory;
}

export interface ListNewsParams {
	page?: number;
	limit?: number;
	search?: string;
	status?: string;
	category?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toFetchOptions(headers?: Headers): {
	fetch?: { headers: Record<string, string> };
} {
	if (!headers) return {};
	return { fetch: { headers: Object.fromEntries(headers.entries()) } };
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

export const listNewsFn = async (
	params: ListNewsParams,
	headers?: Headers,
): Promise<ListNewsResponse> => {
	const { data, error } = await api.news.get(
		{ query: params as Record<string, string | number | undefined> },
		toFetchOptions(headers),
	);

	if (error) throw error;
	return data as unknown as ListNewsResponse;
};

export const listNewsServerFn = createIsomorphicFn()
	.client((params: ListNewsParams) => listNewsFn(params))
	.server((params: ListNewsParams) => listNewsFn(params, getRequestHeaders()));

// ---------------------------------------------------------------------------
// Get Single
// ---------------------------------------------------------------------------

export interface GetNewsParams {
	id: string;
}

export const getNewsFn = async (
	params: GetNewsParams,
	headers?: Headers,
): Promise<NewsArticle> => {
	const { data, error } = await api
		.news({ id: params.id })
		.get(toFetchOptions(headers));

	if (error) throw error;
	return (data as unknown as NewsResponse).data;
};

export const getNewsServerFn = createIsomorphicFn()
	.client((params: GetNewsParams) => getNewsFn(params))
	.server((params: GetNewsParams) => getNewsFn(params, getRequestHeaders()));

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export interface CreateNewsParams {
	title: string;
	excerpt: string;
	content: string;
	coverImage?: string;
	thumbnailImage?: string;
	readTime?: number;
	categoryId?: string;
	authorId?: string;
	date?: string;
}

export const createNewsFn = async (
	params: CreateNewsParams,
	headers?: Headers,
): Promise<NewsArticle> => {
	const { data, error } = await api.news.post(params, toFetchOptions(headers));

	if (error) throw error;
	return (data as unknown as NewsResponse).data;
};

export const createNewsServerFn = createIsomorphicFn()
	.client((params: CreateNewsParams) => createNewsFn(params))
	.server((params: CreateNewsParams) =>
		createNewsFn(params, getRequestHeaders()),
	);

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export interface UpdateNewsParams {
	id: string;
	title: string;
	excerpt: string;
	content: string;
	coverImage?: string;
	thumbnailImage?: string;
	readTime?: number;
	categoryId?: string;
	authorId?: string;
	date?: string;
}

export const updateNewsFn = async (
	params: UpdateNewsParams,
	headers?: Headers,
): Promise<NewsArticle> => {
	const { id, ...body } = params;
	const { data, error } = await api
		.news({ id })
		.put(body, toFetchOptions(headers));

	if (error) throw error;
	return (data as unknown as NewsResponse).data;
};

export const updateNewsServerFn = createIsomorphicFn()
	.client((params: UpdateNewsParams) => updateNewsFn(params))
	.server((params: UpdateNewsParams) =>
		updateNewsFn(params, getRequestHeaders()),
	);

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export interface DeleteNewsParams {
	id: string;
}

export const deleteNewsFn = async (
	params: DeleteNewsParams,
	headers?: Headers,
): Promise<void> => {
	const { error } = await api
		.news({ id: params.id })
		.delete(undefined, toFetchOptions(headers));

	if (error) throw error;
};

export const deleteNewsServerFn = createIsomorphicFn()
	.client((params: DeleteNewsParams) => deleteNewsFn(params))
	.server((params: DeleteNewsParams) =>
		deleteNewsFn(params, getRequestHeaders()),
	);

// ---------------------------------------------------------------------------
// Publish
// ---------------------------------------------------------------------------

export const publishNewsFn = async (
	params: GetNewsParams,
	headers?: Headers,
): Promise<NewsArticle> => {
	const { data, error } = await api
		.news({ id: params.id })
		.publish.post(undefined, toFetchOptions(headers));

	if (error) throw error;
	return (data as unknown as NewsResponse).data;
};

export const publishNewsServerFn = createIsomorphicFn()
	.client((params: GetNewsParams) => publishNewsFn(params))
	.server((params: GetNewsParams) =>
		publishNewsFn(params, getRequestHeaders()),
	);

// ---------------------------------------------------------------------------
// Unpublish
// ---------------------------------------------------------------------------

export const unpublishNewsFn = async (
	params: GetNewsParams,
	headers?: Headers,
): Promise<NewsArticle> => {
	const { data, error } = await api
		.news({ id: params.id })
		.unpublish.post(undefined, toFetchOptions(headers));

	if (error) throw error;
	return (data as unknown as NewsResponse).data;
};

export const unpublishNewsServerFn = createIsomorphicFn()
	.client((params: GetNewsParams) => unpublishNewsFn(params))
	.server((params: GetNewsParams) =>
		unpublishNewsFn(params, getRequestHeaders()),
	);

// ---------------------------------------------------------------------------
// List Categories
// ---------------------------------------------------------------------------

export const listNewsCategoriesFn = async (
	headers?: Headers,
): Promise<NewsCategory[]> => {
	const { data, error } = await api["news/categories"].get(
		toFetchOptions(headers),
	);

	if (error) throw error;
	return data as unknown as NewsCategory[];
};

export const listNewsCategoriesServerFn = createIsomorphicFn()
	.client(() => listNewsCategoriesFn())
	.server(() => listNewsCategoriesFn(getRequestHeaders()));

// ---------------------------------------------------------------------------
// Create Category
// ---------------------------------------------------------------------------

export interface CreateNewsCategoryParams {
	name: string;
}

export const createNewsCategoryFn = async (
	params: CreateNewsCategoryParams,
	headers?: Headers,
): Promise<NewsCategory> => {
	const { data, error } = await api["news/categories"].post(
		params,
		toFetchOptions(headers),
	);

	if (error) throw error;
	return (data as unknown as NewsCategoryResponse).data;
};

export const createNewsCategoryServerFn = createIsomorphicFn()
	.client((params: CreateNewsCategoryParams) => createNewsCategoryFn(params))
	.server((params: CreateNewsCategoryParams) =>
		createNewsCategoryFn(params, getRequestHeaders()),
	);

// ---------------------------------------------------------------------------
// Delete Category
// ---------------------------------------------------------------------------

export interface DeleteNewsCategoryParams {
	id: string;
}

export const deleteNewsCategoryFn = async (
	params: DeleteNewsCategoryParams,
	headers?: Headers,
): Promise<void> => {
	const { error } = await api["news/categories"]({ id: params.id }).delete(
		undefined,
		toFetchOptions(headers),
	);

	if (error) throw error;
};

export const deleteNewsCategoryServerFn = createIsomorphicFn()
	.client((params: DeleteNewsCategoryParams) => deleteNewsCategoryFn(params))
	.server((params: DeleteNewsCategoryParams) =>
		deleteNewsCategoryFn(params, getRequestHeaders()),
	);
