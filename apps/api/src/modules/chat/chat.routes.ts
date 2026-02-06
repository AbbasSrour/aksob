import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db, schema } from "@/db";
import { auth } from "@/lib/auth";

const createDmSchema = t.Object({
	userId: t.String(),
});

const sendMessageSchema = t.Object({
	content: t.String({ minLength: 1, maxLength: 4000 }),
});

const messagesQuerySchema = t.Object({
	limit: t.Optional(t.Numeric({ minimum: 1, maximum: 200 })),
});

const normalizeDmKey = (firstUserId: string, secondUserId: string) => {
	return [firstUserId, secondUserId].sort().join(":");
};

const isSqliteConstraintError = (error: unknown) => {
	if (!(error instanceof Error)) {
		return false;
	}

	return error.message.includes("UNIQUE constraint failed");
};

const withAuth = async (
	headers: Headers,
	set: { status?: number | string },
) => {
	const session = await auth.api.getSession({ headers });
	if (!session?.user) {
		set.status = 401;
		return null;
	}
	return session.user;
};

export const chatModule = new Elysia({ prefix: "/chat" })
	.get("/conversations", async ({ request, set }) => {
		const currentUser = await withAuth(request.headers, set);
		if (!currentUser) return { status: "error", error: "Not authenticated" };

		const myParticipants = await db.query.conversationParticipant.findMany({
			where: eq(schema.conversationParticipant.userId, currentUser.id),
		});

		if (myParticipants.length === 0) {
			return { status: "ok", data: [] };
		}

		const conversationIds = [
			...new Set(
				myParticipants.map((participant) => participant.conversationId),
			),
		];

		const allParticipants = await db.query.conversationParticipant.findMany({
			where: inArray(
				schema.conversationParticipant.conversationId,
				conversationIds,
			),
			with: {
				user: true,
			},
		});

		const messages = await db.query.message.findMany({
			where: inArray(schema.message.conversationId, conversationIds),
			orderBy: [desc(schema.message.createdAt)],
		});

		const latestMessageByConversation = new Map<
			string,
			(typeof messages)[number]
		>();
		for (const message of messages) {
			if (!latestMessageByConversation.has(message.conversationId)) {
				latestMessageByConversation.set(message.conversationId, message);
			}
		}

		const participantsByConversation = allParticipants.reduce<
			Record<string, typeof allParticipants>
		>((accumulator, participant) => {
			if (!accumulator[participant.conversationId]) {
				accumulator[participant.conversationId] = [];
			}
			accumulator[participant.conversationId].push(participant);
			return accumulator;
		}, {});

		const data = conversationIds
			.map((conversationId) => {
				const participants = participantsByConversation[conversationId] ?? [];
				if (participants.length !== 2) {
					return null;
				}
				const otherParticipant = participants.find(
					(participant) => participant.userId !== currentUser.id,
				);
				if (!otherParticipant?.user) return null;

				const latestMessage = latestMessageByConversation.get(conversationId);
				return {
					id: conversationId,
					otherUser: {
						id: otherParticipant.user.id,
						name: otherParticipant.user.name,
						email: otherParticipant.user.email,
						major: otherParticipant.user.major,
						image: otherParticipant.user.image,
					},
					lastMessage: latestMessage
						? {
								id: latestMessage.id,
								content: latestMessage.content,
								senderId: latestMessage.senderId,
								createdAt: latestMessage.createdAt,
							}
						: null,
				};
			})
			.filter(
				(conversation): conversation is NonNullable<typeof conversation> =>
					Boolean(conversation),
			)
			.sort((firstConversation, secondConversation) => {
				const firstTimestamp =
					firstConversation.lastMessage?.createdAt?.getTime() ?? 0;
				const secondTimestamp =
					secondConversation.lastMessage?.createdAt?.getTime() ?? 0;
				return secondTimestamp - firstTimestamp;
			});

		return { status: "ok", data };
	})
	.post(
		"/dm",
		async ({ request, body, set }) => {
			const currentUser = await withAuth(request.headers, set);
			if (!currentUser) return { status: "error", error: "Not authenticated" };

			const targetUser = await db.query.user.findFirst({
				where: eq(schema.user.id, body.userId),
			});
			if (!targetUser) {
				set.status = 404;
				return { status: "error", error: "Target user not found" };
			}

			if (targetUser.id === currentUser.id) {
				set.status = 400;
				return {
					status: "error",
					error: "Cannot create conversation with yourself",
				};
			}

			const dmKey = normalizeDmKey(currentUser.id, targetUser.id);

			let existingConversation = await db.query.conversation.findFirst({
				where: eq(schema.conversation.dmKey, dmKey),
			});

			if (!existingConversation) {
				const conversationId = crypto.randomUUID();

				try {
					await db.transaction(async (tx) => {
						await tx.insert(schema.conversation).values({
							id: conversationId,
							dmKey,
						});

						await tx.insert(schema.conversationParticipant).values([
							{
								id: crypto.randomUUID(),
								conversationId,
								userId: currentUser.id,
							},
							{
								id: crypto.randomUUID(),
								conversationId,
								userId: targetUser.id,
							},
						]);
					});
				} catch (error) {
					if (!isSqliteConstraintError(error)) {
						throw error;
					}
				}

				existingConversation = await db.query.conversation.findFirst({
					where: eq(schema.conversation.dmKey, dmKey),
				});
			}

			if (!existingConversation) {
				set.status = 500;
				return { status: "error", error: "Failed to create conversation" };
			}

			return {
				status: "ok",
				data: {
					conversationId: existingConversation.id,
				},
			};
		},
		{ body: createDmSchema },
	)
	.get(
		"/:conversationId/messages",
		async ({ request, params, query, set }) => {
			const currentUser = await withAuth(request.headers, set);
			if (!currentUser) return { status: "error", error: "Not authenticated" };

			const participantCountResult = await db
				.select({ count: sql<number>`count(*)` })
				.from(schema.conversationParticipant)
				.where(
					eq(
						schema.conversationParticipant.conversationId,
						params.conversationId,
					),
				);

			if ((participantCountResult[0]?.count ?? 0) !== 2) {
				set.status = 404;
				return { status: "error", error: "Conversation not found" };
			}

			const participant = await db.query.conversationParticipant.findFirst({
				where: and(
					eq(
						schema.conversationParticipant.conversationId,
						params.conversationId,
					),
					eq(schema.conversationParticipant.userId, currentUser.id),
				),
			});

			if (!participant) {
				set.status = 403;
				return { status: "error", error: "Access denied" };
			}

			const messageLimit = query.limit ?? 100;
			const messages = await db.query.message.findMany({
				where: eq(schema.message.conversationId, params.conversationId),
				orderBy: [desc(schema.message.createdAt)],
				limit: messageLimit,
				with: {
					sender: true,
				},
			});

			return {
				status: "ok",
				data: messages.reverse().map((message) => ({
					id: message.id,
					conversationId: message.conversationId,
					senderId: message.senderId,
					senderName: message.sender.name,
					content: message.content,
					createdAt: message.createdAt,
				})),
			};
		},
		{ query: messagesQuerySchema },
	)
	.post(
		"/:conversationId/messages",
		async ({ request, params, body, set }) => {
			const currentUser = await withAuth(request.headers, set);
			if (!currentUser) return { status: "error", error: "Not authenticated" };

			const content = body.content.trim();
			if (!content) {
				set.status = 400;
				return { status: "error", error: "Message content cannot be empty" };
			}

			const participantCountResult = await db
				.select({ count: sql<number>`count(*)` })
				.from(schema.conversationParticipant)
				.where(
					eq(
						schema.conversationParticipant.conversationId,
						params.conversationId,
					),
				);

			if ((participantCountResult[0]?.count ?? 0) !== 2) {
				set.status = 400;
				return {
					status: "error",
					error: "Only 1:1 conversations are supported",
				};
			}

			const participant = await db.query.conversationParticipant.findFirst({
				where: and(
					eq(
						schema.conversationParticipant.conversationId,
						params.conversationId,
					),
					eq(schema.conversationParticipant.userId, currentUser.id),
				),
			});

			if (!participant) {
				set.status = 403;
				return { status: "error", error: "Access denied" };
			}

			const messageId = crypto.randomUUID();
			await db.insert(schema.message).values({
				id: messageId,
				conversationId: params.conversationId,
				senderId: currentUser.id,
				content,
			});

			await db
				.update(schema.conversation)
				.set({ updatedAt: new Date() })
				.where(eq(schema.conversation.id, params.conversationId));

			const message = await db.query.message.findFirst({
				where: eq(schema.message.id, messageId),
				with: {
					sender: true,
				},
			});

			if (!message) {
				set.status = 500;
				return { status: "error", error: "Failed to load sent message" };
			}

			return {
				status: "ok",
				data: {
					id: message.id,
					conversationId: message.conversationId,
					senderId: message.senderId,
					senderName: message.sender.name,
					content: message.content,
					createdAt: message.createdAt,
				},
			};
		},
		{
			body: sendMessageSchema,
		},
	);
