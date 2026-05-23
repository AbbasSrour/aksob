import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { api } from "@/lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Donor {
	id: string;
	name: string;
	position: string;
	company: string;
	donationAmount: number | null;
	message: string | null;
	image: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface ListDonorsResponse {
	status: "ok";
	data: Donor[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export interface DonorResponse {
	status: "ok";
	data: Donor;
}

export interface ListDonorsParams {
	page?: number;
	limit?: number;
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

export const listDonorsFn = async (
	params: ListDonorsParams,
	headers?: Headers,
): Promise<ListDonorsResponse> => {
	const { data, error } = await api.donors.get(
		{ query: params as Record<string, string | number | undefined> },
		toFetchOptions(headers),
	);

	if (error) throw error;
	return data as unknown as ListDonorsResponse;
};

export const listDonorsServerFn = createIsomorphicFn()
	.client((params: ListDonorsParams) => listDonorsFn(params))
	.server((params: ListDonorsParams) =>
		listDonorsFn(params, getRequestHeaders()),
	);

// ---------------------------------------------------------------------------
// Get Single
// ---------------------------------------------------------------------------

export interface GetDonorParams {
	id: string;
}

export const getDonorFn = async (
	params: GetDonorParams,
	headers?: Headers,
): Promise<Donor> => {
	const { data, error } = await api
		.donors({ id: params.id })
		.get(toFetchOptions(headers));

	if (error) throw error;
	return (data as unknown as DonorResponse).data;
};

export const getDonorServerFn = createIsomorphicFn()
	.client((params: GetDonorParams) => getDonorFn(params))
	.server((params: GetDonorParams) => getDonorFn(params, getRequestHeaders()));

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export interface CreateDonorParams {
	name: string;
	position: string;
	company: string;
	donationAmount?: number;
	message?: string;
	image?: string;
}

export const createDonorFn = async (
	params: CreateDonorParams,
	headers?: Headers,
): Promise<Donor> => {
	const { data, error } = await api.donors.post(
		params,
		toFetchOptions(headers),
	);

	if (error) throw error;
	return (data as unknown as DonorResponse).data;
};

export const createDonorServerFn = createIsomorphicFn()
	.client((params: CreateDonorParams) => createDonorFn(params))
	.server((params: CreateDonorParams) =>
		createDonorFn(params, getRequestHeaders()),
	);

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export interface UpdateDonorParams extends CreateDonorParams {
	id: string;
}

export const updateDonorFn = async (
	params: UpdateDonorParams,
	headers?: Headers,
): Promise<Donor> => {
	const { id, ...body } = params;
	const { data, error } = await api
		.donors({ id })
		.put(body, toFetchOptions(headers));

	if (error) throw error;
	return (data as unknown as DonorResponse).data;
};

export const updateDonorServerFn = createIsomorphicFn()
	.client((params: UpdateDonorParams) => updateDonorFn(params))
	.server((params: UpdateDonorParams) =>
		updateDonorFn(params, getRequestHeaders()),
	);

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export interface DeleteDonorParams {
	id: string;
}

export const deleteDonorFn = async (
	params: DeleteDonorParams,
	headers?: Headers,
): Promise<void> => {
	const { error } = await api
		.donors({ id: params.id })
		.delete(undefined, toFetchOptions(headers));

	if (error) throw error;
};

export const deleteDonorServerFn = createIsomorphicFn()
	.client((params: DeleteDonorParams) => deleteDonorFn(params))
	.server((params: DeleteDonorParams) =>
		deleteDonorFn(params, getRequestHeaders()),
	);
