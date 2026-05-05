import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { api } from "@/lib/api";

// ---------------------------------------> Types <----------------------------------------------------------//

export interface Major {
	id: string;
	name: string;
	description: string | null;
	credits: number | null;
	duration: number | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface ListMajorsResponse {
	status: "ok";
	data: Major[];
}

export interface SingleMajorResponse {
	status: "ok";
	data: Major;
}

// ---------------------------------------> Helpers <----------------------------------------------------------//

function toFetchOptions(headers?: Headers): {
	fetch?: { headers: Record<string, string> };
} {
	if (!headers) return {};
	return { fetch: { headers: Object.fromEntries(headers.entries()) } };
}

// ---------------------------------------> List Majors <----------------------------------------------------------//

export const listMajorsFn = async (
	headers?: Headers,
): Promise<ListMajorsResponse> => {
	const { data, error } = await api.majors.get(toFetchOptions(headers));

	if (error) throw error;
	return data as unknown as ListMajorsResponse;
};

export const listMajorsServerFn = createIsomorphicFn()
	.client(() => listMajorsFn())
	.server(() => listMajorsFn(getRequestHeaders()));

// ---------------------------------------> Get Major <----------------------------------------------------------//

export interface GetMajorParams {
	id: string;
}

export const getMajorFn = async (
	params: GetMajorParams,
	headers?: Headers,
): Promise<Major> => {
	const { data, error } = await api
		.majors({ id: params.id })
		.get(toFetchOptions(headers));

	if (error) throw error;
	return (data as SingleMajorResponse).data;
};

export const getMajorServerFn = createIsomorphicFn()
	.client((params: GetMajorParams) => getMajorFn(params))
	.server((params: GetMajorParams) => getMajorFn(params, getRequestHeaders()));

// ---------------------------------------> Create Major <----------------------------------------------------------//

export interface CreateMajorParams {
	name: string;
	description?: string;
	credits?: number;
	duration?: number;
}

export const createMajorFn = async (
	params: CreateMajorParams,
	headers?: Headers,
): Promise<Major> => {
	const { data, error } = await api.majors.post(
		params,
		toFetchOptions(headers),
	);

	if (error) throw error;
	return (data as SingleMajorResponse).data;
};

export const createMajorServerFn = createIsomorphicFn()
	.client((params: CreateMajorParams) => createMajorFn(params))
	.server((params: CreateMajorParams) =>
		createMajorFn(params, getRequestHeaders()),
	);

// ---------------------------------------> Update Major <----------------------------------------------------------//

export interface UpdateMajorParams {
	id: string;
	name?: string;
	description?: string | null;
	credits?: number | null;
	duration?: number | null;
	isActive?: boolean;
}

export const updateMajorFn = async (
	params: UpdateMajorParams,
	headers?: Headers,
): Promise<Major> => {
	const { id, ...body } = params;
	const { data, error } = await api
		.majors({ id })
		.put(body, toFetchOptions(headers));

	if (error) throw error;
	return (data as SingleMajorResponse).data;
};

export const updateMajorServerFn = createIsomorphicFn()
	.client((params: UpdateMajorParams) => updateMajorFn(params))
	.server((params: UpdateMajorParams) =>
		updateMajorFn(params, getRequestHeaders()),
	);
