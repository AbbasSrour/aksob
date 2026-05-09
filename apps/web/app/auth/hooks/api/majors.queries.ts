import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "~/app/lib/api";

export interface MajorDto {
	id: string;
	name: string;
	description: string | null;
	credits: number | null;
	duration: number | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

interface MajorsResponse {
	status: string;
	data: MajorDto[];
}

export const majorsQueries = {
	active: queryOptions({
		queryKey: ["majors", "active"],
		queryFn: () => apiFetch<MajorsResponse>("/api/majors?isActive=true"),
		select: (response) => response.data,
		staleTime: 1000 * 60 * 5,
	}),
};
