import { t } from "elysia";

const programResponse = t.Object({
	id: t.String(),
	name: t.String(),
	level: t.String(),
	description: t.Union([t.String(), t.Null()]),
	credits: t.Union([t.Number(), t.Null()]),
	duration: t.Union([t.Number(), t.Null()]),
	isActive: t.Boolean(),
	createdAt: t.String(),
	updatedAt: t.String(),
});

export const createProgramBody = t.Object({
	name: t.String({ minLength: 1 }),
	level: t.String({ minLength: 1 }),
	description: t.Optional(t.String()),
	credits: t.Optional(t.Number({ minimum: 0 })),
	duration: t.Optional(t.Number({ minimum: 0 })),
});

export const updateProgramBody = t.Object({
	name: t.Optional(t.String({ minLength: 1 })),
	level: t.Optional(t.String({ minLength: 1 })),
	description: t.Optional(t.Nullable(t.String())),
	credits: t.Optional(t.Nullable(t.Number({ minimum: 0 }))),
	duration: t.Optional(t.Nullable(t.Number({ minimum: 0 }))),
	isActive: t.Optional(t.Boolean()),
});

export const programResponseSchema = t.Object({
	status: t.String(),
	data: programResponse,
});

export const listProgramsQuery = t.Object({
	level: t.Optional(t.String()),
});

export const programsListResponse = t.Object({
	status: t.String(),
	data: t.Array(programResponse),
});
