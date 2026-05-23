import { apiFetch } from "~/app/lib/api";

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

interface DonorsListResponse {
	status: string;
	data: Donor[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export async function listPublicDonors(limit = 10) {
	return apiFetch<DonorsListResponse>(`/api/donors?limit=${limit}`);
}

export async function listDonors(params?: { page?: number; limit?: number }) {
	const searchParams = new URLSearchParams();
	if (params?.page) searchParams.set("page", String(params.page));
	if (params?.limit) searchParams.set("limit", String(params.limit));

	const qs = searchParams.toString();
	return apiFetch<DonorsListResponse>(`/api/donors${qs ? `?${qs}` : ""}`);
}

export async function getDonor(id: string) {
	return apiFetch<{ status: "ok"; data: Donor }>(`/api/donors/${id}`);
}

export interface CreateDonorParams {
	name: string;
	position: string;
	company: string;
	donationAmount?: number;
	message?: string;
	image?: string;
}

export async function createDonor(params: CreateDonorParams) {
	return apiFetch<{ status: "ok"; data: Donor }>("/api/donors", {
		method: "POST",
		body: JSON.stringify(params),
	});
}

export async function updateDonor(id: string, params: CreateDonorParams) {
	return apiFetch<{ status: "ok"; data: Donor }>(`/api/donors/${id}`, {
		method: "PUT",
		body: JSON.stringify(params),
	});
}

export async function deleteDonor(id: string) {
	return apiFetch<{ status: "ok" }>(`/api/donors/${id}`, {
		method: "DELETE",
	});
}
