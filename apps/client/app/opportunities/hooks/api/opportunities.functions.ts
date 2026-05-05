import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { api } from "@/lib/api";

// ---------------------------------------> Types <----------------------------------------------------------//

export interface OpportunityAuthor {
	id: string;
	name: string;
	image: string | null;
	major: string | null;
}

export interface OpportunityReviewer {
	id: string;
	name: string;
}

export type OpportunityStatus = "pending" | "approved" | "rejected";

export type OpportunityType = "job" | "internship";

export interface Opportunity {
	id: string;
	type: OpportunityType;
	company: string;
	contactEmail: string | null;
	applyUrl: string | null;
	status: OpportunityStatus;
	author: OpportunityAuthor;
	reviewedBy: OpportunityReviewer | null;
	reviewNotes: string | null;
	reviewedAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface ListOpportunitiesResponse {
	status: "ok";
	data: Opportunity[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export interface ListOpportunitiesParams {
	page?: number;
	limit?: number;
	authorId?: string;
	status?: string;
	search?: string;
	type?: string;
}

// ---------------------------------------> Helpers <----------------------------------------------------------//

function toFetchOptions(headers?: Headers): {
	fetch?: { headers: Record<string, string> };
} {
	if (!headers) return {};
	return { fetch: { headers: Object.fromEntries(headers.entries()) } };
}

// ---------------------------------------> List Opportunities <----------------------------------------------------------//

export const listOpportunitiesFn = async (
	params: ListOpportunitiesParams,
	headers?: Headers,
): Promise<ListOpportunitiesResponse> => {
	const { data, error } = await api.opportunities.get(
		{ query: params as Record<string, string | number | undefined> },
		toFetchOptions(headers),
	);

	if (error) throw error;
	return data as unknown as ListOpportunitiesResponse;
};

export const listOpportunitiesServerFn = createIsomorphicFn()
	.client((params: ListOpportunitiesParams) => listOpportunitiesFn(params))
	.server((params: ListOpportunitiesParams) =>
		listOpportunitiesFn(params, getRequestHeaders()),
	);

// ---------------------------------------> Approve Opportunity <----------------------------------------------------------//

export interface ApproveOpportunityParams {
	id: string;
}

export const approveOpportunityFn = async (
	params: ApproveOpportunityParams,
	headers?: Headers,
): Promise<Opportunity> => {
	const { data, error } = await api
		.opportunities({ id: params.id })
		.approve.post(undefined, toFetchOptions(headers));

	if (error) throw error;
	return data;
};

export const approveOpportunityServerFn = createIsomorphicFn()
	.client((params: ApproveOpportunityParams) => approveOpportunityFn(params))
	.server((params: ApproveOpportunityParams) =>
		approveOpportunityFn(params, getRequestHeaders()),
	);

// ---------------------------------------> Reject Opportunity <----------------------------------------------------------//

export interface RejectOpportunityParams {
	id: string;
	reviewNotes: string;
}

export const rejectOpportunityFn = async (
	params: RejectOpportunityParams,
	headers?: Headers,
): Promise<Opportunity> => {
	const { data, error } = await api
		.opportunities({ id: params.id })
		.reject.post({ reviewNotes: params.reviewNotes }, toFetchOptions(headers));

	if (error) throw error;
	return data;
};

export const rejectOpportunityServerFn = createIsomorphicFn()
	.client((params: RejectOpportunityParams) => rejectOpportunityFn(params))
	.server((params: RejectOpportunityParams) =>
		rejectOpportunityFn(params, getRequestHeaders()),
	);

// ---------------------------------------> Get Opportunity <----------------------------------------------------------//

export interface GetOpportunityParams {
	id: string;
}

export const getOpportunityFn = async (
	params: GetOpportunityParams,
	headers?: Headers,
): Promise<Opportunity> => {
	const { data, error } = await api
		.opportunities({ id: params.id })
		.get(toFetchOptions(headers));

	if (error) throw error;
	return data;
};

export const getOpportunityServerFn = createIsomorphicFn()
	.client((params: GetOpportunityParams) => getOpportunityFn(params))
	.server((params: GetOpportunityParams) =>
		getOpportunityFn(params, getRequestHeaders()),
	);

// ---------------------------------------> Create Opportunity <----------------------------------------------------------//

export interface CreateOpportunityParams {
	type: OpportunityType;
	company: string;
	contactEmail?: string;
	applyUrl?: string;
}

export const createOpportunityFn = async (
	params: CreateOpportunityParams,
	headers?: Headers,
): Promise<Opportunity> => {
	const { data, error } = await api.opportunities.post(
		params,
		toFetchOptions(headers),
	);

	if (error) throw error;
	return data;
};

export const createOpportunityServerFn = createIsomorphicFn()
	.client((params: CreateOpportunityParams) => createOpportunityFn(params))
	.server((params: CreateOpportunityParams) =>
		createOpportunityFn(params, getRequestHeaders()),
	);

// ---------------------------------------> Update Opportunity <----------------------------------------------------------//

export interface UpdateOpportunityParams {
	id: string;
	type: OpportunityType;
	company: string;
	contactEmail?: string;
	applyUrl?: string;
}

export const updateOpportunityFn = async (
	params: UpdateOpportunityParams,
	headers?: Headers,
): Promise<Opportunity> => {
	const { id, ...body } = params;
	const { data, error } = await api
		.opportunities({ id })
		.put(body, toFetchOptions(headers));

	if (error) throw error;
	return data;
};

export const updateOpportunityServerFn = createIsomorphicFn()
	.client((params: UpdateOpportunityParams) => updateOpportunityFn(params))
	.server((params: UpdateOpportunityParams) =>
		updateOpportunityFn(params, getRequestHeaders()),
	);

// ---------------------------------------> Delete Opportunity <----------------------------------------------------------//

export interface DeleteOpportunityParams {
	id: string;
}

export const deleteOpportunityFn = async (
	params: DeleteOpportunityParams,
	headers?: Headers,
): Promise<void> => {
	const { error } = await api
		.opportunities({ id: params.id })
		.delete(undefined, toFetchOptions(headers));

	if (error) throw error;
};

export const deleteOpportunityServerFn = createIsomorphicFn()
	.client((params: DeleteOpportunityParams) => deleteOpportunityFn(params))
	.server((params: DeleteOpportunityParams) =>
		deleteOpportunityFn(params, getRequestHeaders()),
	);
