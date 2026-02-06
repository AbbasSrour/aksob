import { t } from "elysia";
export const usersInputSchema = t.Object({
	id: t.String(),
	name: t.String(),
	email: t.String({ format: "email" }),
	userType: t.Union([
		t.Literal("student"),
		t.Literal("alumni"),
		t.Literal("faculty"),
	]),
	major: t.String(),
	company: t.Optional(t.Nullable(t.String())),
	title: t.Optional(t.Nullable(t.String())),
	image: t.Optional(t.Nullable(t.String())),
	createdAt: t.Date(),
});

export const usersOutputSchema = t.Object({
	status: t.Literal("ok"),
	data: usersInputSchema,
});
