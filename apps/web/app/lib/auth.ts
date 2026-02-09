import { admin, phoneNumber } from "better-auth/plugins";
import { createAuthClient } from "better-auth/react";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const authClient = createAuthClient({
	baseURL: API_BASE_URL,
	fetchOptions: {
		credentials: "include",
	},
	plugins: [admin(), phoneNumber()],
});

export const { useSession, signOut } = authClient;
