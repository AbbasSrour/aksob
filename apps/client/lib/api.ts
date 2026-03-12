import { createApiClient } from "@aksob/sdk";
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
