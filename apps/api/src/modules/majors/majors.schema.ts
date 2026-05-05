import { t } from "elysia";

const majorResponse = t.Object({
	id: t.String(),
	name: t.String(),
	description: t.Union([t.String(), t.Null()]),
	credits: t.Union([t.Number(), t.Null()]),
	duration: t.Union([t.Number(), t.Null()]),
	isActive: t.Boolean(),
	createdAt: t.String(),
	updatedAt: t.String(),
});

export const createMajorBody = t.Object({
	name: t.String({ minLength: 1 }),
	description: t.Optional(t.String()),
	credits: t.Optional(t.Number({ minimum: 0 })),
	duration: t.Optional(t.Number({ minimum: 0 })),
});

export const updateMajorBody = t.Object({
	name: t.Optional(t.String({ minLength: 1 })),
	description: t.Optional(t.Nullable(t.String())),
	credits: t.Optional(t.Nullable(t.Number({ minimum: 0 }))),
	duration: t.Optional(t.Nullable(t.Number({ minimum: 0 }))),
	isActive: t.Optional(t.Boolean()),
});

export const majorResponseSchema = t.Object({
	status: t.String(),
	data: majorResponse,
});

export const listMajorsQuery = t.Object({
	isActive: t.Optional(t.Boolean()),
});

export const majorsListResponse = t.Object({
	status: t.String(),
	data: t.Array(majorResponse),
});
