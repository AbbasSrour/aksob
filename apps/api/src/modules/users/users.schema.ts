import { t } from "elysia";

export const usersInputSchema = t.Object({
	id: t.String(),
	name: t.String(),
	email: t.String({ format: "email" }),
	type: t.Union([
		t.Literal("student"),
		t.Literal("alumni"),
		t.Literal("faculty"),
	]),
	program: t.Optional(t.Nullable(t.String())),
	bio: t.Optional(t.Nullable(t.String())),
	image: t.Optional(t.Nullable(t.String())),
	createdAt: t.Date(),
});

export const usersOutputSchema = t.Object({
	status: t.Literal("ok"),
	data: usersInputSchema,
});
