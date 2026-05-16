import { t } from "elysia";
import { CONNECTION_TYPES } from "@/modules/connections/constant/connection-types.constant";
import { CONNECTION_STATUSES } from "@/modules/connections/constant/connection-statuses.constant";

export const matchConnectionBody = t.Object({
	type: t.String({ enum: CONNECTION_TYPES as unknown as string[] }),
	message: t.Optional(t.String()),
});

export const createConnectionRequestBody = t.Object({
	type: t.String({ enum: CONNECTION_TYPES as unknown as string[] }),
	matchedUserId: t.String(),
	message: t.Optional(t.String()),
});

export const listConnectionsQuery = t.Object({
	type: t.Optional(
		t.String({ enum: CONNECTION_TYPES as unknown as string[] }),
	),
	status: t.Optional(
		t.String({ enum: CONNECTION_STATUSES as unknown as string[] }),
	),
});
