import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { api } from "@/lib/api";

export interface DashboardStats {
	users: {
		total: number;
		byType: Record<string, number>;
		byMajor: Record<string, number>;
	};
	opportunities: {
		total: number;
		byStatus: Record<string, number>;
		byType: Record<string, number>;
	};
	stories: {
		total: number;
		byStatus: Record<string, number>;
		byCategory: Record<string, number>;
	};
	research: {
		total: number;
		byStatus: Record<string, number>;
		byType: Record<string, number>;
	};
	recent: {
		users: Array<{
			id: string;
			name: string;
			email: string;
			userType: string;
			major: string | null;
			image: string | null;
			createdAt: string | null;
		}>;
		opportunities: Array<{
			id: string;
			type: string;
			company: string;
			status: string;
			author: { id: string; name: string; image: string | null } | null;
			createdAt: string | null;
		}>;
		stories: Array<{
			id: string;
			title: string;
			category: string;
			status: string;
			author: { id: string; name: string; image: string | null } | null;
			createdAt: string | null;
		}>;
	};
}

function toFetchOptions(headers?: Headers): {
	fetch?: { headers: Record<string, string> };
} {
	if (!headers) return {};
	return { fetch: { headers: Object.fromEntries(headers.entries()) } };
}

export const getDashboardStatsFn = async (
	headers?: Headers,
): Promise<DashboardStats> => {
	const { data, error } = await api.stats.get(toFetchOptions(headers));

	if (error) throw error;
	return (data as unknown as { status: "ok"; data: DashboardStats }).data;
};

export const getDashboardStatsServerFn = createIsomorphicFn()
	.client(() => getDashboardStatsFn())
	.server(() => getDashboardStatsFn(getRequestHeaders()));
