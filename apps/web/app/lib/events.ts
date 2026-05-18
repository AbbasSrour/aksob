import { apiFetch } from "~/app/lib/api";

export interface EventItem {
	id: string;
	title: string;
	description: string;
	coverImage: string | null;
	eventType: string;
	location: string | null;
	startDate: string;
	endDate: string;
	status: string;
	owner: { id: string; name: string; image: string | null } | null;
	createdAt: string;
	updatedAt: string;
}

interface EventListResponse {
	status: string;
	data: EventItem[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

interface EventDetailResponse {
	status: string;
	data: EventItem;
}

export interface ListEventsParams {
	page?: number;
	limit?: number;
	filter?: "upcoming" | "current" | "past";
	search?: string;
	status?: string;
	userId?: string;
}

export async function listEvents(params?: ListEventsParams) {
	const searchParams = new URLSearchParams();
	if (params?.page) searchParams.set("page", String(params.page));
	if (params?.limit) searchParams.set("limit", String(params.limit));
	if (params?.filter) searchParams.set("filter", params.filter);
	if (params?.search) searchParams.set("search", params.search);
	if (params?.status) searchParams.set("status", params.status);
	if (params?.userId) searchParams.set("userId", params.userId);

	const qs = searchParams.toString();
	return apiFetch<EventListResponse>(`/api/events${qs ? `?${qs}` : ""}`);
}

export async function getEvent(id: string) {
	return apiFetch<EventDetailResponse>(`/api/events/${id}`);
}
