import { TypeCompiler } from "@sinclair/typebox/compiler";
import { t } from "elysia";

const EnvSchema = TypeCompiler.Compile(
	t.Object({
		// General
		NODE_ENV: t.Optional(
			t.Union([
				t.Literal("development"),
				t.Literal("production"),
				t.Literal("test"),
			]),
		),
		LOG_LEVEL: t.Union(
			[
				t.Literal("debug"),
				t.Literal("info"),
				t.Literal("warn"),
				t.Literal("error"),
			],
			{
				default: "info",
			},
		),

		// Server
		PORT: t.Numeric({
			default: 3000,
		}),
		TRUSTED_ORIGINS: t.String({
			default: "http://localhost:5173",
		}),

		// Database
		DATABASE_URL: t.String(),
		TURSO_AUTH_TOKEN: t.Optional(t.String()),

		// BetterAuth
		BETTER_AUTH_SECRET: t.String({
			default: "change-me-in-production-min-32-chars",
		}),
		BETTER_AUTH_URL: t.String({
			default: "http://localhost:3000",
		}),
		DEFAULT_ADMIN_PASSWORD: t.String({
			minLength: 8,
		}),

		// Email (Resend)
		RESEND_API_KEY: t.Optional(t.String()),
		EMAIL_FROM: t.String({
			default: "noreply@aksob.lau.edu.lb",
		}),

		// Frontend
		FRONTEND_URL: t.String({
			default: "http://localhost:5173",
		}),

		// Media uploads (UploadThing API token)
		UPLOADTHING_TOKEN: t.Optional(t.String()),

		// AI Providers (optional — AI matching is opt-in)
		AI_EMBEDDING_PROVIDER_URL: t.Optional(t.String()),
		AI_EMBEDDING_PROVIDER_KEY: t.Optional(t.String()),
		AI_EMBEDDING_MODEL: t.String({
			default: "gemini-embedding-001",
		}),

		AI_LLM_PROVIDER_URL: t.Optional(t.String()),
		AI_LLM_PROVIDER_KEY: t.Optional(t.String()),
		AI_LLM_MODEL: t.String({
			default: "minimax-m2.5-free",
		}),
	}),
);

// Validate environment at startup
if (!EnvSchema.Check(Bun.env)) {
	const errors = [...EnvSchema.Errors(Bun.env)];
	console.error("❌ Invalid environment variables:", errors);
	process.exit(1);
}

const parsedEnv = EnvSchema.Encode(Bun.env);

const validateDatabaseConfig = () => {
	const databaseUrl = parsedEnv.DATABASE_URL;
	const protocol = databaseUrl.includes(":")
		? databaseUrl.slice(0, databaseUrl.indexOf(":"))
		: "";

	if (!["file", "libsql", "http", "https"].includes(protocol)) {
		console.error(
			`Invalid DATABASE_URL protocol "${protocol}". Expected file:, libsql:, http:, or https:.`,
		);
		process.exit(1);
	}

	if (protocol === "libsql" || protocol === "http" || protocol === "https") {
		if (!parsedEnv.TURSO_AUTH_TOKEN) {
			console.error(
				"TURSO_AUTH_TOKEN is required when DATABASE_URL points to a remote libSQL/Turso database.",
			);
			process.exit(1);
		}

		const url = new URL(databaseUrl);
		if (url.hostname.endsWith("turso.tech")) {
			console.error(
				"DATABASE_URL must be the Turso database URL, not the Turso dashboard URL. Use a libsql://<database>-<org>.turso.io URL.",
			);
			process.exit(1);
		}
	}
};

validateDatabaseConfig();

export const env = {
	...parsedEnv,
	trustedOrigins: [
		parsedEnv.BETTER_AUTH_URL,
		...parsedEnv.TRUSTED_ORIGINS.split(","),
	]
		.map((origin) => origin.trim())
		.filter((origin): origin is string => Boolean(origin))
		.map((origin) => {
			const normalized = origin.startsWith("http://") || origin.startsWith("https://")
				? origin
				: `https://${origin}`;
			return new URL(normalized).origin;
		}),
};
