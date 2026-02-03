import { admin, phoneNumber } from "better-auth/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	plugins: [admin(), phoneNumber()],
});

export const { useSession, signOut } = authClient;
