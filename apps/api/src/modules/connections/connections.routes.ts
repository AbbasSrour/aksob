import { and, desc, eq, inArray, ne, or, sql } from "drizzle-orm";
import { Elysia } from "elysia";
import { db, schema } from "@/db";
import {
	CONNECTION_TYPE_ELIGIBILITY,
	isEligibleForType,
} from "@/modules/connections/constant/connection-eligibility.constant";
import { CONNECTION_STATUSES } from "@/modules/connections/constant/connection-statuses.constant";
import { CONNECTION_TYPES } from "@/modules/connections/constant/connection-types.constant";
import { CONNECTION_ERRORS } from "@/modules/connections/constant/connections-errors.constant";
import {
	createConnectionRequestBody,
	listConnectionsQuery,
	matchConnectionBody,
} from "@/modules/connections/schema/connections-request.schema";
import { authContext } from "@/plugins/auth";
import type { UserType } from "@/modules/users/constant/user-types";
import { findTopCandidates } from "@/modules/ai/ai-embedding";
import { llmSelectMatch } from "@/modules/ai/ai-match";

// ── Helpers ──────────────────────────────────────

type Candidate = {
	id: string;
	name: string;
	type: UserType;
	image: string | null;
};

async function countActiveConnections(userId: string): Promise<number> {
	const [result] = await db
		.select({ count: sql<number>`count(*)` })
		.from(schema.connection)
		.where(
			and(
				or(
					eq(schema.connection.requesterId, userId),
					eq(schema.connection.matchedUserId, userId),
				),
				or(
					eq(schema.connection.status, "pending"),
					eq(schema.connection.status, "active"),
				),
			),
		);

	return result?.count ?? 0;
}

function buildPrioritizedCandidates(
	candidates: Candidate[],
	matchedUserId: string | null,
): Candidate[] {
	if (!matchedUserId) return candidates;

	const selected = candidates.find((candidate) => candidate.id === matchedUserId);
	if (!selected) return candidates;

	return [
		selected,
		...candidates.filter((candidate) => candidate.id !== matchedUserId),
	];
}

export const connectionsModule = new Elysia({ prefix: "/connections" })
	.use(authContext)

	// ──────────────── List my connections ────────────────
	.get(
		"/",
		async ({ query, user }) => {
			const type = query.type as typeof CONNECTION_TYPES[number] | undefined;
			const status = query.status as typeof CONNECTION_STATUSES[number] | undefined;

			const conditions = [
				or(
					eq(schema.connection.requesterId, user!.id),
					eq(schema.connection.matchedUserId, user!.id),
				)!,
			];

			if (type) conditions.push(eq(schema.connection.type, type));
			if (status) conditions.push(eq(schema.connection.status, status));

			const connections = await db.query.connection.findMany({
				where: and(...conditions),
				orderBy: [desc(schema.connection.createdAt)],
			});

			return { status: "ok", data: connections };
		},
		{
			auth: true,
			query: listConnectionsQuery,
		},
	)

	// ──────────────── Get connection detail ────────────────
	.get(
		"/:id",
		async ({ params, user, set }) => {
			const connection = await db.query.connection.findFirst({
				where: and(
					eq(schema.connection.id, params.id),
					or(
						eq(schema.connection.requesterId, user!.id),
						eq(schema.connection.matchedUserId, user!.id),
					),
				),
			});

			if (!connection) {
				set.status = CONNECTION_ERRORS.CONNECTION_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: CONNECTION_ERRORS.CONNECTION_NOT_FOUND.code,
					error: CONNECTION_ERRORS.CONNECTION_NOT_FOUND.message,
				};
			}

			return { status: "ok", data: connection };
		},
		{
			auth: true,
		},
	)

	// ──────────────── Find match ────────────────
	.post(
		"/match",
		async ({ body, user, set }) => {
			const reqUserId = user!.id;
			const reqUserType = user!.type as UserType;
			const matchType = body.type as typeof CONNECTION_TYPES[number];

			// Validate type eligibility
			if (!isEligibleForType(reqUserType, matchType)) {
				set.status =
					CONNECTION_ERRORS.CONNECTION_TYPE_NOT_ELIGIBLE.httpStatus;
				return {
					status: "error",
					code: CONNECTION_ERRORS.CONNECTION_TYPE_NOT_ELIGIBLE.code,
					error: CONNECTION_ERRORS.CONNECTION_TYPE_NOT_ELIGIBLE
						.message,
				};
			}

			// Check limit
			const activeCount = await countActiveConnections(reqUserId);
			if (activeCount >= 3) {
				set.status =
					CONNECTION_ERRORS.CONNECTION_LIMIT_REACHED.httpStatus;
				return {
					status: "error",
					code: CONNECTION_ERRORS.CONNECTION_LIMIT_REACHED.code,
					error: CONNECTION_ERRORS.CONNECTION_LIMIT_REACHED.message,
				};
			}

			// Find eligible match: user who has this type in preferences,
			// is visible in galaxy, is not the requester, and is of the
			// appropriate user type for this connection.
			const eligibleUserTypes = Object.entries(
				CONNECTION_TYPE_ELIGIBILITY,
			)
				.filter(
					([, types]) =>
						types.includes(matchType),
				)
				.map(([ut]) => ut);

			// Exclude requester's own type from match targets
			const targetUserTypes = eligibleUserTypes.filter(
				(ut) => ut !== reqUserType,
			);

			// If no other user types are eligible, no match possible
			if (targetUserTypes.length === 0) {
				set.status =
					CONNECTION_ERRORS.NO_MATCH_FOUND.httpStatus;
				return {
					status: "error",
					code: CONNECTION_ERRORS.NO_MATCH_FOUND.code,
					error: CONNECTION_ERRORS.NO_MATCH_FOUND.message,
				};
			}

			// Subquery: users already matched with requester for this type
			const excludedAsRequester = db
				.select({
					userId: schema.connection.matchedUserId,
				})
				.from(schema.connection)
				.where(
					and(
						eq(schema.connection.requesterId, reqUserId),
						eq(schema.connection.type, matchType),
						or(
							eq(schema.connection.status, "pending"),
							eq(schema.connection.status, "active"),
						),
					),
				);

			const excludedAsMatched = db
				.select({
					userId: schema.connection.requesterId,
				})
				.from(schema.connection)
				.where(
					and(
						eq(schema.connection.matchedUserId, reqUserId),
						eq(schema.connection.type, matchType),
						or(
							eq(schema.connection.status, "pending"),
							eq(schema.connection.status, "active"),
						),
					),
				);

			// Find all eligible candidates (not just one)
			const candidates = await db
				.select({
					id: schema.user.id,
					name: schema.user.name,
					type: schema.user.type,
					image: schema.user.image,
				})
				.from(schema.user)
				.innerJoin(
					schema.userConnectionPreference,
					eq(
						schema.user.id,
						schema.userConnectionPreference.userId,
					),
				)
				.innerJoin(
					schema.userSettings,
					eq(schema.user.id, schema.userSettings.userId),
				)
				.where(
					and(
						ne(schema.user.id, reqUserId),
						eq(
							schema.userConnectionPreference.type,
							matchType,
						),
						eq(
							schema.userSettings.isVisibleInGalaxy,
							true,
						),
						inArray(schema.user.type, targetUserTypes),
						sql`${schema.user.id} NOT IN (${excludedAsRequester}) AND ${schema.user.id} NOT IN (${excludedAsMatched})`,
					),
				);

			if (candidates.length === 0) {
				set.status =
					CONNECTION_ERRORS.NO_MATCH_FOUND.httpStatus;
				return {
					status: "error",
					code: CONNECTION_ERRORS.NO_MATCH_FOUND.code,
					error: CONNECTION_ERRORS.NO_MATCH_FOUND.message,
				};
			}

			let matchedUserId: string | null = null;
			let matchExplanation: string | null = null;

			// Attempt AI matching pipeline
			if (candidates.length >= 2) {
				try {
					const candidateIds = candidates.map((c) => c.id);

					// Phase 1: embedding similarity filter → top 5
					const ranked = await findTopCandidates(
						reqUserId,
						candidateIds,
						5,
					);

					if (ranked.length > 0) {
						// Phase 2: LLM final selection
						const llmResult = await llmSelectMatch(
							reqUserId,
							matchType,
							ranked,
						);

						if (llmResult) {
							matchedUserId = llmResult.matchedUserId;
							matchExplanation = llmResult.explanation;
						} else {
							// LLM failed → pick highest embedding similarity
							matchedUserId = ranked[0]!.userId;
						}
					}
				} catch {
					// AI pipeline failed → fall through to random
				}
			}

			// Fallback to random if AI didn't produce a match
			if (!matchedUserId) {
				const randomIndex = Math.floor(
					Math.random() * candidates.length,
				);
				matchedUserId = candidates[randomIndex]!.id;
			}

			return {
				status: "ok",
				data: {
					candidates: buildPrioritizedCandidates(candidates, matchedUserId),
					recommendedUserId: matchedUserId,
					matchExplanation,
				},
			};
		},
		{
			auth: true,
			body: matchConnectionBody,
		},
	)

	// ──────────────── Send connection request ────────────────
	.post(
		"/request",
		async ({ body, user, set }) => {
			const reqUserId = user!.id;
			const reqUserType = user!.type as UserType;
			const matchType = body.type as typeof CONNECTION_TYPES[number];

			if (!isEligibleForType(reqUserType, matchType)) {
				set.status =
					CONNECTION_ERRORS.CONNECTION_TYPE_NOT_ELIGIBLE.httpStatus;
				return {
					status: "error",
					code: CONNECTION_ERRORS.CONNECTION_TYPE_NOT_ELIGIBLE.code,
					error: CONNECTION_ERRORS.CONNECTION_TYPE_NOT_ELIGIBLE.message,
				};
			}

			const activeCount = await countActiveConnections(reqUserId);
			if (activeCount >= 3) {
				set.status = CONNECTION_ERRORS.CONNECTION_LIMIT_REACHED.httpStatus;
				return {
					status: "error",
					code: CONNECTION_ERRORS.CONNECTION_LIMIT_REACHED.code,
					error: CONNECTION_ERRORS.CONNECTION_LIMIT_REACHED.message,
				};
			}

			const existing = await db.query.connection.findFirst({
				where: and(
					eq(schema.connection.type, matchType),
					or(
						and(
							eq(schema.connection.requesterId, reqUserId),
							eq(schema.connection.matchedUserId, body.matchedUserId),
						),
						and(
							eq(schema.connection.requesterId, body.matchedUserId),
							eq(schema.connection.matchedUserId, reqUserId),
						),
					),
					or(
						eq(schema.connection.status, "pending"),
						eq(schema.connection.status, "active"),
					),
				),
			});

			if (existing) {
				set.status = CONNECTION_ERRORS.ALREADY_MATCHED.httpStatus;
				return {
					status: "error",
					code: CONNECTION_ERRORS.ALREADY_MATCHED.code,
					error: CONNECTION_ERRORS.ALREADY_MATCHED.message,
				};
			}

			const matchedUser = await db.query.user.findFirst({
				where: eq(schema.user.id, body.matchedUserId),
			});

			if (!matchedUser) {
				set.status = CONNECTION_ERRORS.NO_MATCH_FOUND.httpStatus;
				return {
					status: "error",
					code: CONNECTION_ERRORS.NO_MATCH_FOUND.code,
					error: CONNECTION_ERRORS.NO_MATCH_FOUND.message,
				};
			}

			const id = crypto.randomUUID();
			await db.insert(schema.connection).values({
				id,
				type: matchType,
				requesterId: reqUserId,
				matchedUserId: body.matchedUserId,
				message: body.message ?? null,
			});

			const created = await db.query.connection.findFirst({
				where: eq(schema.connection.id, id),
			});

			return { status: "ok", data: created };
		},
		{
			auth: true,
			body: createConnectionRequestBody,
		},
	)

	// ──────────────── Accept connection ────────────────
	.post(
		"/:id/accept",
		async ({ params, user, set }) => {
			const connection = await db.query.connection.findFirst({
				where: eq(schema.connection.id, params.id),
			});

			if (!connection) {
				set.status =
					CONNECTION_ERRORS.CONNECTION_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: CONNECTION_ERRORS.CONNECTION_NOT_FOUND.code,
					error: CONNECTION_ERRORS.CONNECTION_NOT_FOUND.message,
				};
			}

			if (connection.status !== "pending") {
				set.status = CONNECTION_ERRORS.NOT_PENDING.httpStatus;
				return {
					status: "error",
					code: CONNECTION_ERRORS.NOT_PENDING.code,
					error: CONNECTION_ERRORS.NOT_PENDING.message,
				};
			}

			if (connection.matchedUserId !== user!.id) {
				set.status =
					CONNECTION_ERRORS.NOT_MATCHED_USER.httpStatus;
				return {
					status: "error",
					code: CONNECTION_ERRORS.NOT_MATCHED_USER.code,
					error: CONNECTION_ERRORS.NOT_MATCHED_USER.message,
				};
			}

			await db
				.update(schema.connection)
				.set({ status: "active" })
				.where(eq(schema.connection.id, params.id));

			const updated = await db.query.connection.findFirst({
				where: eq(schema.connection.id, params.id),
			});

			return { status: "ok", data: updated };
		},
		{
			auth: true,
		},
	)

	// ──────────────── Decline connection ────────────────
	.post(
		"/:id/decline",
		async ({ params, user, set }) => {
			const connection = await db.query.connection.findFirst({
				where: eq(schema.connection.id, params.id),
			});

			if (!connection) {
				set.status =
					CONNECTION_ERRORS.CONNECTION_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: CONNECTION_ERRORS.CONNECTION_NOT_FOUND.code,
					error: CONNECTION_ERRORS.CONNECTION_NOT_FOUND.message,
				};
			}

			if (connection.status !== "pending") {
				set.status = CONNECTION_ERRORS.NOT_PENDING.httpStatus;
				return {
					status: "error",
					code: CONNECTION_ERRORS.NOT_PENDING.code,
					error: CONNECTION_ERRORS.NOT_PENDING.message,
				};
			}

			if (connection.matchedUserId !== user!.id) {
				set.status =
					CONNECTION_ERRORS.NOT_MATCHED_USER.httpStatus;
				return {
					status: "error",
					code: CONNECTION_ERRORS.NOT_MATCHED_USER.code,
					error: CONNECTION_ERRORS.NOT_MATCHED_USER.message,
				};
			}

			await db
				.update(schema.connection)
				.set({ status: "declined" })
				.where(eq(schema.connection.id, params.id));

			const updated = await db.query.connection.findFirst({
				where: eq(schema.connection.id, params.id),
			});

			return { status: "ok", data: updated };
		},
		{
			auth: true,
		},
	)

	// ──────────────── Cancel connection ────────────────
	.post(
		"/:id/cancel",
		async ({ params, user, set }) => {
			const connection = await db.query.connection.findFirst({
				where: eq(schema.connection.id, params.id),
			});

			if (!connection) {
				set.status =
					CONNECTION_ERRORS.CONNECTION_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: CONNECTION_ERRORS.CONNECTION_NOT_FOUND.code,
					error: CONNECTION_ERRORS.CONNECTION_NOT_FOUND.message,
				};
			}

			if (connection.status !== "active") {
				set.status = CONNECTION_ERRORS.NOT_ACTIVE.httpStatus;
				return {
					status: "error",
					code: CONNECTION_ERRORS.NOT_ACTIVE.code,
					error: CONNECTION_ERRORS.NOT_ACTIVE.message,
				};
			}

			const isParticipant =
				connection.requesterId === user!.id ||
				connection.matchedUserId === user!.id;

			if (!isParticipant) {
				set.status =
					CONNECTION_ERRORS.NOT_PARTICIPANT.httpStatus;
				return {
					status: "error",
					code: CONNECTION_ERRORS.NOT_PARTICIPANT.code,
					error: CONNECTION_ERRORS.NOT_PARTICIPANT.message,
				};
			}

			await db
				.update(schema.connection)
				.set({ status: "cancelled" })
				.where(eq(schema.connection.id, params.id));

			const updated = await db.query.connection.findFirst({
				where: eq(schema.connection.id, params.id),
			});

			return { status: "ok", data: updated };
		},
		{
			auth: true,
		},
	)

	// ──────────────── Complete connection ────────────────
	.post(
		"/:id/complete",
		async ({ params, user, set }) => {
			const connection = await db.query.connection.findFirst({
				where: eq(schema.connection.id, params.id),
			});

			if (!connection) {
				set.status =
					CONNECTION_ERRORS.CONNECTION_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: CONNECTION_ERRORS.CONNECTION_NOT_FOUND.code,
					error: CONNECTION_ERRORS.CONNECTION_NOT_FOUND.message,
				};
			}

			if (connection.status !== "active") {
				set.status = CONNECTION_ERRORS.NOT_ACTIVE.httpStatus;
				return {
					status: "error",
					code: CONNECTION_ERRORS.NOT_ACTIVE.code,
					error: CONNECTION_ERRORS.NOT_ACTIVE.message,
				};
			}

			const isParticipant =
				connection.requesterId === user!.id ||
				connection.matchedUserId === user!.id;

			if (!isParticipant) {
				set.status =
					CONNECTION_ERRORS.NOT_PARTICIPANT.httpStatus;
				return {
					status: "error",
					code: CONNECTION_ERRORS.NOT_PARTICIPANT.code,
					error: CONNECTION_ERRORS.NOT_PARTICIPANT.message,
				};
			}

			await db
				.update(schema.connection)
				.set({ status: "completed" })
				.where(eq(schema.connection.id, params.id));

			const updated = await db.query.connection.findFirst({
				where: eq(schema.connection.id, params.id),
			});

			return { status: "ok", data: updated };
		},
		{
			auth: true,
		},
	);
