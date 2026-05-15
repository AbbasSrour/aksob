import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { api } from "@/lib/api";

// ---------------------------------------> Types <----------------------------------------------------------//

export interface Program {
	id: string;
	name: string;
	description: string | null;
	credits: number | null;
	duration: number | null;
	level: string | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface ListProgramsResponse {
	status: "ok";
	data: Program[];
}

export interface SingleProgramResponse {
	status: "ok";
	data: Program;
}

// ---------------------------------------> Helpers <----------------------------------------------------------//

function toFetchOptions(headers?: Headers): {
	fetch?: { headers: Record<string, string> };
} {
	if (!headers) return {};
	return { fetch: { headers: Object.fromEntries(headers.entries()) } };
}

// ---------------------------------------> List Programs <----------------------------------------------------------//

export const listProgramsFn = async (
	headers?: Headers,
): Promise<ListProgramsResponse> => {
	const { data, error } = await api.programs.get(toFetchOptions(headers));

	if (error) throw error;
	return data as unknown as ListProgramsResponse;
};

export const listProgramsServerFn = createIsomorphicFn()
	.client(() => listProgramsFn())
	.server(() => listProgramsFn(getRequestHeaders()));

// ---------------------------------------> Get Program <----------------------------------------------------------//

export interface GetProgramParams {
	id: string;
}

export const getProgramFn = async (
	params: GetProgramParams,
	headers?: Headers,
): Promise<Program> => {
	const { data, error } = await api
		.programs({ id: params.id })
		.get(toFetchOptions(headers));

	if (error) throw error;
	return (data as SingleProgramResponse).data;
};

export const getProgramServerFn = createIsomorphicFn()
	.client((params: GetProgramParams) => getProgramFn(params))
	.server((params: GetProgramParams) => getProgramFn(params, getRequestHeaders()));

// ---------------------------------------> Create Program <----------------------------------------------------------//

export interface CreateProgramParams {
	name: string;
	description?: string;
	credits?: number;
	duration?: number;
	level?: string;
}

export const createProgramFn = async (
	params: CreateProgramParams,
	headers?: Headers,
): Promise<Program> => {
	const { data, error } = await api.programs.post(
		params,
		toFetchOptions(headers),
	);

	if (error) throw error;
	return (data as SingleProgramResponse).data;
};

export const createProgramServerFn = createIsomorphicFn()
	.client((params: CreateProgramParams) => createProgramFn(params))
	.server((params: CreateProgramParams) =>
		createProgramFn(params, getRequestHeaders()),
	);

// ---------------------------------------> Update Program <----------------------------------------------------------//

export interface UpdateProgramParams {
	id: string;
	name?: string;
	description?: string | null;
	credits?: number | null;
	duration?: number | null;
	level?: string | null;
	isActive?: boolean;
}

export const updateProgramFn = async (
	params: UpdateProgramParams,
	headers?: Headers,
): Promise<Program> => {
	const { id, ...body } = params;
	const { data, error } = await api
		.programs({ id })
		.put(body, toFetchOptions(headers));

	if (error) throw error;
	return (data as SingleProgramResponse).data;
};

export const updateProgramServerFn = createIsomorphicFn()
	.client((params: UpdateProgramParams) => updateProgramFn(params))
	.server((params: UpdateProgramParams) =>
		updateProgramFn(params, getRequestHeaders()),
	);
