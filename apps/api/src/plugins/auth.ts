import { Elysia } from "elysia";
import { auth } from "@/lib/auth";

export const authPlugin = new Elysia({ name: "auth" })
	.mount(auth.handler)
	.derive(async ({ request }) => {
		const session = await auth.api.getSession({
			headers: request.headers,
		});
		return {
			user: session?.user ?? null,
			session: session?.session ?? null,
		};
	});
