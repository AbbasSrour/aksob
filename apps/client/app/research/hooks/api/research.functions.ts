import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { api } from "@/lib/api";

// ---------------------------------------> Types <----------------------------------------------------------//

export interface ResearchAuthor {
	id: string;
	name: string;
	image: string | null;
	major: string | null;
}

export interface ResearchReviewer {
	id: string;
	name: string;
}

export type ResearchStatus = "pending" | "approved" | "rejected";

export type ResearchType =
	| "phd_position"
	| "postdoc"
	| "research_assistant"
	| "visiting_researcher"
	| "research_internship"
	| "collaboration"
	| "fellowship"
	| "other";

export type FundingOption = "funded" | "partial" | "unfunded" | "negotiable";

export type EducationLevel =
	| "undergraduate"
	| "masters"
	| "phd"
	| "postdoc";

export interface Research {
	id: string;
	title: string;
	content: string;
	researchType: ResearchType;
	institution: string;
	department: string | null;
	duration: string | null;
	funding: FundingOption | null;
	location: string | null;
	startDate: string | null;
	deadline: string | null;
	educationLevel: EducationLevel | null;
	fieldOfStudy: string | null;
	experienceRequired: string | null;
	skillsRequired: string | null;
	additionalRequirements: string | null;
	status: ResearchStatus;
	author: ResearchAuthor;
	reviewedBy: ResearchReviewer | null;
	rejectionReason: string | null;
	reviewedAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface ListResearchResponse {
	status: "ok";
	data: Research[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export interface ResearchResponse {
	status: "ok";
	data: Research;
}

export interface ListResearchParams {
	page?: number;
	limit?: number;
	researchType?: string;
	authorId?: string;
	status?: string;
	search?: string;
}

// ---------------------------------------> Helpers <----------------------------------------------------------//

function toFetchOptions(headers?: Headers): {
	fetch?: { headers: Record<string, string> };
} {
	if (!headers) return {};
	return { fetch: { headers: Object.fromEntries(headers.entries()) } };
}

// ---------------------------------------> List Research <----------------------------------------------------------//

export const listResearchFn = async (
	params: ListResearchParams,
	headers?: Headers,
): Promise<ListResearchResponse> => {
	const { data, error } = await api.research.get(
		{ query: params as Record<string, string | number | undefined> },
		toFetchOptions(headers),
	);

	if (error) throw error;
	return data as unknown as ListResearchResponse;
};

export const listResearchServerFn = createIsomorphicFn()
	.client((params: ListResearchParams) => listResearchFn(params))
	.server((params: ListResearchParams) =>
		listResearchFn(params, getRequestHeaders()),
	);

// ---------------------------------------> Approve Research <----------------------------------------------------------//

export interface ApproveResearchParams {
	id: string;
}

export const approveResearchFn = async (
	params: ApproveResearchParams,
	headers?: Headers,
): Promise<Research> => {
	const { data, error } = await api
		.research({ id: params.id })
		.approve.post(undefined, toFetchOptions(headers));

	if (error) throw error;
	return (data as unknown as ResearchResponse).data;
};

export const approveResearchServerFn = createIsomorphicFn()
	.client((params: ApproveResearchParams) => approveResearchFn(params))
	.server((params: ApproveResearchParams) =>
		approveResearchFn(params, getRequestHeaders()),
	);

// ---------------------------------------> Reject Research <----------------------------------------------------------//

export interface RejectResearchParams {
	id: string;
	reason: string;
}

export const rejectResearchFn = async (
	params: RejectResearchParams,
	headers?: Headers,
): Promise<Research> => {
	const { data, error } = await api
		.research({ id: params.id })
		.reject.post({ reason: params.reason }, toFetchOptions(headers));

	if (error) throw error;
	return (data as unknown as ResearchResponse).data;
};

export const rejectResearchServerFn = createIsomorphicFn()
	.client((params: RejectResearchParams) => rejectResearchFn(params))
	.server((params: RejectResearchParams) =>
		rejectResearchFn(params, getRequestHeaders()),
	);

// ---------------------------------------> Get Research <----------------------------------------------------------//

export interface GetResearchParams {
	id: string;
}

export const getResearchFn = async (
	params: GetResearchParams,
	headers?: Headers,
): Promise<Research> => {
	const { data, error } = await api
		.research({ id: params.id })
		.get(toFetchOptions(headers));

	if (error) throw error;
	return (data as unknown as ResearchResponse).data;
};

export const getResearchServerFn = createIsomorphicFn()
	.client((params: GetResearchParams) => getResearchFn(params))
	.server((params: GetResearchParams) =>
		getResearchFn(params, getRequestHeaders()),
	);

// ---------------------------------------> Create Research <----------------------------------------------------------//

export interface CreateResearchParams {
	title: string;
	content: string;
	researchType: ResearchType;
	institution: string;
	department?: string;
	duration?: string;
	funding?: FundingOption;
	location?: string;
	startDate?: string;
	deadline?: string;
	educationLevel?: EducationLevel;
	fieldOfStudy?: string;
	experienceRequired?: string;
	skillsRequired?: string;
	additionalRequirements?: string;
}

export const createResearchFn = async (
	params: CreateResearchParams,
	headers?: Headers,
): Promise<Research> => {
	const { data, error } = await api.research.post(
		params,
		toFetchOptions(headers),
	);

	if (error) throw error;
	return (data as unknown as ResearchResponse).data;
};

export const createResearchServerFn = createIsomorphicFn()
	.client((params: CreateResearchParams) => createResearchFn(params))
	.server((params: CreateResearchParams) =>
		createResearchFn(params, getRequestHeaders()),
	);

// ---------------------------------------> Update Research <----------------------------------------------------------//

export interface UpdateResearchParams {
	id: string;
	title: string;
	content: string;
	researchType: ResearchType;
	institution: string;
	department?: string;
	duration?: string;
	funding?: FundingOption;
	location?: string;
	startDate?: string;
	deadline?: string;
	educationLevel?: EducationLevel;
	fieldOfStudy?: string;
	experienceRequired?: string;
	skillsRequired?: string;
	additionalRequirements?: string;
}

export const updateResearchFn = async (
	params: UpdateResearchParams,
	headers?: Headers,
): Promise<Research> => {
	const { id, ...body } = params;
	const { data, error } = await api
		.research({ id })
		.put(body, toFetchOptions(headers));

	if (error) throw error;
	return (data as unknown as ResearchResponse).data;
};

export const updateResearchServerFn = createIsomorphicFn()
	.client((params: UpdateResearchParams) => updateResearchFn(params))
	.server((params: UpdateResearchParams) =>
		updateResearchFn(params, getRequestHeaders()),
	);

// ---------------------------------------> Delete Research <----------------------------------------------------------//

export interface DeleteResearchParams {
	id: string;
}

export const deleteResearchFn = async (
	params: DeleteResearchParams,
	headers?: Headers,
): Promise<void> => {
	const { error } = await api
		.research({ id: params.id })
		.delete(undefined, toFetchOptions(headers));

	if (error) throw error;
};

export const deleteResearchServerFn = createIsomorphicFn()
	.client((params: DeleteResearchParams) => deleteResearchFn(params))
	.server((params: DeleteResearchParams) =>
		deleteResearchFn(params, getRequestHeaders()),
	);
