import { and, desc, eq, inArray, ne, or, sql } from "drizzle-orm";
import { Elysia } from "elysia";
import { db, schema } from "@/db";
import { findTopCandidates } from "@/lib/ai/embedding";
import { llmSelectMatch } from "@/lib/ai/match";
import {
	CONNECTION_TYPE_ELIGIBILITY,
	isEligibleForType,
} from "@/modules/connections/constant/connection-eligibility.constant";
import type { CONNECTION_STATUSES } from "@/modules/connections/constant/connection-statuses.constant";
import type { CONNECTION_TYPES } from "@/modules/connections/constant/connection-types.constant";
import { CONNECTION_ERRORS } from "@/modules/connections/constant/connections-errors.constant";
import {
	createConnectionRequestBody,
	listConnectionsQuery,
	matchConnectionBody,
} from "@/modules/connections/schema/connections-request.schema";
import type { UserType } from "@/modules/users/constant/user-types";
import { authContext } from "@/plugins/auth";

// ── Helpers ──────────────────────────────────────

type Candidate = {
	id: string;
	name: string;
	type: UserType;
	image: string | null;
};

function buildPrioritizedCandidates(
	candidates: Candidate[],
	matchedUserId: string | null,
): Candidate[] {
	if (!matchedUserId) return candidates;

	const selected = candidates.find(
		(candidate) => candidate.id === matchedUserId,
	);
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
			const type = query.type as (typeof CONNECTION_TYPES)[number] | undefined;
			const status = query.status as
				| (typeof CONNECTION_STATUSES)[number]
				| undefined;

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

			const connectionUserIds = [
				...new Set(
					connections.flatMap((connection) => [
						connection.requesterId,
						connection.matchedUserId,
					]),
				),
			];

			const users = connectionUserIds.length
				? await db.query.user.findMany({
						columns: {
							id: true,
							name: true,
							image: true,
							type: true,
						},
						where: inArray(schema.user.id, connectionUserIds),
					})
				: [];

			const usersById = new Map(users.map((user) => [user.id, user]));

			return {
				status: "ok",
				data: connections.map((connection) => ({
					...connection,
					requester: usersById.get(connection.requesterId) ?? null,
					matchedUser: usersById.get(connection.matchedUserId) ?? null,
				})),
			};
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
			const matchType = body.type as (typeof CONNECTION_TYPES)[number];

			// Validate type eligibility
			if (!isEligibleForType(reqUserType, matchType)) {
				set.status = CONNECTION_ERRORS.CONNECTION_TYPE_NOT_ELIGIBLE.httpStatus;
				return {
					status: "error",
					code: CONNECTION_ERRORS.CONNECTION_TYPE_NOT_ELIGIBLE.code,
					error: CONNECTION_ERRORS.CONNECTION_TYPE_NOT_ELIGIBLE.message,
				};
			}

			// Find eligible match: user who has this type in preferences,
			// is visible in galaxy, is not the requester, and is of the
			// appropriate user type for this connection.
			const eligibleUserTypes = Object.entries(CONNECTION_TYPE_ELIGIBILITY)
				.filter(([, types]) => types.includes(matchType))
				.map(([ut]) => ut);

			const targetUserTypes = eligibleUserTypes;

			// If no other user types are eligible, no match possible
			if (targetUserTypes.length === 0) {
				set.status = CONNECTION_ERRORS.NO_MATCH_FOUND.httpStatus;
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
					eq(schema.user.id, schema.userConnectionPreference.userId),
				)
				.innerJoin(
					schema.userSettings,
					eq(schema.user.id, schema.userSettings.userId),
				)
				.where(
					and(
						ne(schema.user.id, reqUserId),
						eq(schema.userConnectionPreference.type, matchType),
						eq(schema.userSettings.isVisibleInGalaxy, true),
						inArray(schema.user.type, targetUserTypes),
						sql`${schema.user.id} NOT IN (${excludedAsRequester}) AND ${schema.user.id} NOT IN (${excludedAsMatched})`,
					),
				);

			if (candidates.length === 0) {
				set.status = CONNECTION_ERRORS.NO_MATCH_FOUND.httpStatus;
				return {
					status: "error",
					code: CONNECTION_ERRORS.NO_MATCH_FOUND.code,
					error: CONNECTION_ERRORS.NO_MATCH_FOUND.message,
				};
			}

			let matchedUserId: string | null = null;
			let matchExplanation: string | null = null;
			let matchedCandidates = candidates.slice(0, 5);

			// Attempt AI matching pipeline
			if (candidates.length > 0) {
				try {
					const candidateIds = candidates.map((c) => c.id);

					// Phase 1: embedding similarity filter → top 5
					const ranked = await findTopCandidates(reqUserId, candidateIds, 5);
					const aiCandidates = ranked.length
						? ranked
						: candidates.slice(0, 5).map((candidate) => ({
								userId: candidate.id,
								similarity: 0,
							}));

					if (aiCandidates.length > 0) {
						const rankedIds = aiCandidates.map((candidate) => candidate.userId);
						matchedCandidates = rankedIds
							.map((id) => candidates.find((candidate) => candidate.id === id))
							.filter(
								(candidate): candidate is Candidate => candidate !== undefined,
							);

						// Phase 2: LLM final selection
						const llmResult = await llmSelectMatch(
							reqUserId,
							matchType,
							aiCandidates,
						);

						if (llmResult) {
							matchedUserId = llmResult.matchedUserId;
							matchExplanation = llmResult.explanation;
						} else if (ranked.length > 0) {
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
					Math.random() * matchedCandidates.length,
				);
				matchedUserId = matchedCandidates[randomIndex]!.id;
			}

			return {
				status: "ok",
				data: {
					candidates: buildPrioritizedCandidates(
						matchedCandidates,
						matchedUserId,
					),
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
			const matchType = body.type as (typeof CONNECTION_TYPES)[number];

			if (!isEligibleForType(reqUserType, matchType)) {
				set.status = CONNECTION_ERRORS.CONNECTION_TYPE_NOT_ELIGIBLE.httpStatus;
				return {
					status: "error",
					code: CONNECTION_ERRORS.CONNECTION_TYPE_NOT_ELIGIBLE.code,
					error: CONNECTION_ERRORS.CONNECTION_TYPE_NOT_ELIGIBLE.message,
				};
			}

			const today = new Date().toISOString().split("T")[0]!;

			const [rateLog] = await db
				.select({ count: schema.connectionRequestLog.count })
				.from(schema.connectionRequestLog)
				.where(
					and(
						eq(schema.connectionRequestLog.userId, reqUserId),
						eq(schema.connectionRequestLog.requestDate, today),
					),
				);

			if ((rateLog?.count ?? 0) >= 50) {
				set.status = CONNECTION_ERRORS.RATE_LIMIT_REACHED.httpStatus;
				return {
					status: "error",
					code: CONNECTION_ERRORS.RATE_LIMIT_REACHED.code,
					error: CONNECTION_ERRORS.RATE_LIMIT_REACHED.message,
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

			await db
				.insert(schema.connectionRequestLog)
				.values({ userId: reqUserId, requestDate: today, count: 1 })
				.onConflictDoUpdate({
					target: [
						schema.connectionRequestLog.userId,
						schema.connectionRequestLog.requestDate,
					],
					set: {
						count: sql`${schema.connectionRequestLog.count} + 1`,
					},
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
				set.status = CONNECTION_ERRORS.CONNECTION_NOT_FOUND.httpStatus;
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
				set.status = CONNECTION_ERRORS.NOT_MATCHED_USER.httpStatus;
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
				set.status = CONNECTION_ERRORS.CONNECTION_NOT_FOUND.httpStatus;
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
				set.status = CONNECTION_ERRORS.NOT_MATCHED_USER.httpStatus;
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
				set.status = CONNECTION_ERRORS.CONNECTION_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: CONNECTION_ERRORS.CONNECTION_NOT_FOUND.code,
					error: CONNECTION_ERRORS.CONNECTION_NOT_FOUND.message,
				};
			}

			if (connection.status !== "pending" && connection.status !== "active") {
				set.status = CONNECTION_ERRORS.NOT_ACTIVE.httpStatus;
				return {
					status: "error",
					code: CONNECTION_ERRORS.NOT_ACTIVE.code,
					error: CONNECTION_ERRORS.NOT_ACTIVE.message,
				};
			}

			// Only the requester can cancel a pending connection
			// (matched user should use /decline)
			if (
				connection.status === "pending" &&
				connection.requesterId !== user!.id
			) {
				set.status = CONNECTION_ERRORS.CANNOT_CANCEL_PENDING.httpStatus;
				return {
					status: "error",
					code: CONNECTION_ERRORS.CANNOT_CANCEL_PENDING.code,
					error: CONNECTION_ERRORS.CANNOT_CANCEL_PENDING.message,
				};
			}

			const isParticipant =
				connection.requesterId === user!.id ||
				connection.matchedUserId === user!.id;

			if (!isParticipant) {
				set.status = CONNECTION_ERRORS.NOT_PARTICIPANT.httpStatus;
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
				set.status = CONNECTION_ERRORS.CONNECTION_NOT_FOUND.httpStatus;
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
				set.status = CONNECTION_ERRORS.NOT_PARTICIPANT.httpStatus;
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
