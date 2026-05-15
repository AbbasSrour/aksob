import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "~/app/lib/api";

export interface ProgramDto {
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

interface ProgramsResponse {
	status: string;
	data: ProgramDto[];
}

export const programsQueries = {
	active: queryOptions({
		queryKey: ["programs", "active"],
		queryFn: () => apiFetch<ProgramsResponse>("/api/programs"),
		select: (response) => response.data,
		staleTime: 1000 * 60 * 5,
	}),
};
