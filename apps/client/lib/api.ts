import { createApiClient } from "@aksob/sdk";
import axios from "axios";
import { env } from "@/config/env.ts";

export const apiBaseUrl = env.VITE_API_URL;

export const api = createApiClient(apiBaseUrl, {
	onResponse: async (response) => {
		if (response.status === 401) {
			if (typeof window !== "undefined") {
				window.location.href = "/auth/login";
			}
		}
	},
});

export const apiClient = axios.create({
	baseURL: apiBaseUrl,
	withCredentials: true,
});

apiClient.interceptors.response.use(
	(response) => response,
	async (error) => {
		if (error.response?.status === 401) {
			if (typeof window !== "undefined") {
				window.location.href = "/auth/login";
			}
		}
		return Promise.reject(error);
	},
);
