import { adminClient, phoneNumberClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { env } from "@/config/env.ts";

export const authClient = createAuthClient({
	baseURL: env.VITE_APP_URL,
	basePath: "/api/auth",
	fetchOptions: {
		credentials: "include",
		onResponse: async (context) => {
			if (context.response.status === 401) {
				if (typeof window === "undefined") {
					return;
				}

				if (window.location.pathname.includes("/auth")) {
					return;
				}

				window.location.replace("/auth/login");
			}
		},
	},
	plugins: [adminClient(), phoneNumberClient()],
});

export const { useSession } = authClient;

export type AuthClient = typeof authClient;
