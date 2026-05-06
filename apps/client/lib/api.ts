import { createApiClient } from "@aksob/sdk";
import { env } from "@/config/env.ts";

export const apiBaseUrl = `${env.VITE_APP_URL}/api`;

export const api = createApiClient(apiBaseUrl, {
	onResponse: async (response) => {
		if (response.status === 401) {
			if (typeof window === "undefined") {
				return;
			}

			if (window.location.pathname.includes("/auth")) {
				return;
			}

			window.location.replace("/auth/login");
		}
	},
});
