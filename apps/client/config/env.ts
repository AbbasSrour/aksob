import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	clientPrefix: "VITE_",

	client: {
		VITE_API_URL: z.string().min(1).default("/api"),
		VITE_APP_URL: z
			.string()
			.min(1)
			.default(import.meta.env.VITE_APP_URL as string),
		VITE_MAINTENANCE: z.string().optional().default("false"),
		VITE_APP_TITLE: z
			.string()
			.min(1)
			.optional()
			.default(import.meta.env.VITE_APP_TITLE as string),
	},

	server: {
		API_URL: z.string().optional(), // For server-side proxying if needed
	},

	runtimeEnv: {
		...import.meta.env,
		...(typeof process !== "undefined" ? process.env : {}),
	},
	emptyStringAsUndefined: true,
});
