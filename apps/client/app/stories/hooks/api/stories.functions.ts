import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { api } from "@/lib/api";

// ---------------------------------------> Types <----------------------------------------------------------//

export interface StoryAuthor {
	id: string;
	name: string;
	image: string | null;
	major: string;
}

export interface StoryReviewer {
	id: string;
	name: string;
}

export type StoryStatus = "pending" | "approved" | "rejected";

export type StoryCategory =
	| "career_advancement"
	| "entrepreneurship"
	| "industry_recognition"
	| "social_impact"
	| "academic_achievement"
	| "innovation"
	| "leadership"
	| "community_service"
	| "other";

export interface Story {
	id: string;
	title: string;
	description: string;
	content: string;
	category: StoryCategory;
	storyDate: string | null;
	status: StoryStatus;
	author: StoryAuthor;
	reviewedBy: StoryReviewer | null;
	reviewNotes: string | null;
	reviewedAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface ListStoriesResponse {
	status: "ok";
	data: Story[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export interface ListStoriesParams {
	page?: number;
	limit?: number;
	category?: string;
	authorId?: string;
	status?: string;
	search?: string;
}

// ---------------------------------------> Helpers <----------------------------------------------------------//

function toFetchOptions(
	headers?: Headers,
): { fetch?: { headers: Record<string, string> } } {
	if (!headers) return {};
	return { fetch: { headers: Object.fromEntries(headers.entries()) } };
}

// ---------------------------------------> List Stories <----------------------------------------------------------//

export const listStoriesFn = async (
	params: ListStoriesParams,
	headers?: Headers,
): Promise<ListStoriesResponse> => {
	const { data, error } = await api.stories.get(
		{ query: params as Record<string, string | number | undefined> },
		toFetchOptions(headers),
	);

	if (error) throw error;
	return data as unknown as ListStoriesResponse;
};

export const listStoriesServerFn = createIsomorphicFn()
	.client((params: ListStoriesParams) => listStoriesFn(params))
	.server((params: ListStoriesParams) =>
		listStoriesFn(params, getRequestHeaders()),
	);

// ---------------------------------------> Approve Story <----------------------------------------------------------//

export interface ApproveStoryParams {
	id: string;
}

export const approveStoryFn = async (
	params: ApproveStoryParams,
	headers?: Headers,
): Promise<Story> => {
	const { data, error } = await api.stories({ id: params.id }).approve.post(
		undefined,
		toFetchOptions(headers),
	);

	if (error) throw error;
	return data;
};

export const approveStoryServerFn = createIsomorphicFn()
	.client((params: ApproveStoryParams) => approveStoryFn(params))
	.server((params: ApproveStoryParams) =>
		approveStoryFn(params, getRequestHeaders()),
	);

// ---------------------------------------> Reject Story <----------------------------------------------------------//

export interface RejectStoryParams {
	id: string;
	reviewNotes: string;
}

export const rejectStoryFn = async (
	params: RejectStoryParams,
	headers?: Headers,
): Promise<Story> => {
	const { data, error } = await api.stories({ id: params.id }).reject.post(
		{ reviewNotes: params.reviewNotes },
		toFetchOptions(headers),
	);

	if (error) throw error;
	return data;
};

export const rejectStoryServerFn = createIsomorphicFn()
	.client((params: RejectStoryParams) => rejectStoryFn(params))
	.server((params: RejectStoryParams) =>
		rejectStoryFn(params, getRequestHeaders()),
	);

// ---------------------------------------> Get Story <----------------------------------------------------------//

export interface GetStoryParams {
	id: string;
}

export const getStoryFn = async (
	params: GetStoryParams,
	headers?: Headers,
): Promise<Story> => {
	const { data, error } = await api.stories({ id: params.id }).get(
		toFetchOptions(headers),
	);

	if (error) throw error;
	return data;
};

export const getStoryServerFn = createIsomorphicFn()
	.client((params: GetStoryParams) => getStoryFn(params))
	.server((params: GetStoryParams) =>
		getStoryFn(params, getRequestHeaders()),
	);

// ---------------------------------------> Create Story <----------------------------------------------------------//

export interface CreateStoryParams {
	title: string;
	description: string;
	content: string;
	category: StoryCategory;
	storyDate?: string;
}

export const createStoryFn = async (
	params: CreateStoryParams,
	headers?: Headers,
): Promise<Story> => {
	const { data, error } = await api.stories.post(params, toFetchOptions(headers));

	if (error) throw error;
	return data;
};

export const createStoryServerFn = createIsomorphicFn()
	.client((params: CreateStoryParams) => createStoryFn(params))
	.server((params: CreateStoryParams) =>
		createStoryFn(params, getRequestHeaders()),
	);

// ---------------------------------------> Update Story <----------------------------------------------------------//

export interface UpdateStoryParams {
	id: string;
	title: string;
	description: string;
	content: string;
	category: StoryCategory;
	storyDate?: string;
}

export const updateStoryFn = async (
	params: UpdateStoryParams,
	headers?: Headers,
): Promise<Story> => {
	const { id, ...body } = params;
	const { data, error } = await api.stories({ id }).put(
		body,
		toFetchOptions(headers),
	);

	if (error) throw error;
	return data;
};

export const updateStoryServerFn = createIsomorphicFn()
	.client((params: UpdateStoryParams) => updateStoryFn(params))
	.server((params: UpdateStoryParams) =>
		updateStoryFn(params, getRequestHeaders()),
	);

// ---------------------------------------> Delete Story <----------------------------------------------------------//

export interface DeleteStoryParams {
	id: string;
}

export const deleteStoryFn = async (
	params: DeleteStoryParams,
	headers?: Headers,
): Promise<void> => {
	const { error } = await api.stories({ id: params.id }).delete(
		undefined,
		toFetchOptions(headers),
	);

	if (error) throw error;
};

export const deleteStoryServerFn = createIsomorphicFn()
	.client((params: DeleteStoryParams) => deleteStoryFn(params))
	.server((params: DeleteStoryParams) =>
		deleteStoryFn(params, getRequestHeaders()),
	);
