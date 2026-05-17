import { admin, phoneNumber } from "better-auth/plugins";
import { createAuthClient } from "better-auth/react";

const APP_BASE_URL =
	typeof window !== "undefined" ? window.location.origin : undefined;

export const authClient = createAuthClient({
	baseURL: APP_BASE_URL,
	basePath: "/api/auth",
	fetchOptions: {
		credentials: "include",
	},
	plugins: [admin(), phoneNumber()],
});

export const { useSession, signOut } = authClient;
