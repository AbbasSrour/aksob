import { TypeCompiler } from "@sinclair/typebox/compiler";
import { t } from "elysia";

const EnvSchema = TypeCompiler.Compile(
	t.Object({
		DATABASE_URL: t.String({
			default: "file:local.db",
		}),
		TURSO_AUTH_TOKEN: t.Optional(t.String()),
		BETTER_AUTH_SECRET: t.String({
			default: "change-me-in-production-min-32-chars",
		}),
		BETTER_AUTH_URL: t.String({
			default: "http://localhost:3000",
		}),
		PORT: t.Number({
			default: 3000,
		}),
		LOG_LEVEL: t.Union(
			[t.Literal("debug"), t.Literal("info"), t.Literal("warn"), t.Literal("error")],
			{
				default: "info",
			},
		),
		NODE_ENV: t.Optional(
			t.Union([t.Literal("development"), t.Literal("production"), t.Literal("test")]),
		),
	}),
);

// Validate environment at startup
if (!EnvSchema.Check(Bun.env)) {
	const errors = [...EnvSchema.Errors(Bun.env)];
	console.error("❌ Invalid environment variables:", errors);
	process.exit(1);
}

export const env = EnvSchema.Encode(Bun.env);
