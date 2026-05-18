import {
	and,
	asc,
	count,
	desc,
	eq,
	gt,
	gte,
	inArray,
	isNull,
	like,
	lt,
	lte,
	or,
	sql,
} from "drizzle-orm";
import { Elysia } from "elysia";
import { db, schema } from "@/db";
import { EVENT_ERRORS } from "@/modules/events/constant/events-errors.constant";
import {
	sendEventCancelled,
	sendEventUpdated,
	sendRegistrationApproved,
	sendRegistrationConfirmation,
	sendRegistrationPending,
	sendRegistrationRejected,
	sendWaitlistPromotion,
} from "@/modules/events/event-email.service";
import {
	addOrganizerBody,
	rejectEventBody,
} from "@/modules/events/schema/events-actions.schema";
import {
	attendeeVisibilityBody,
	checkInBody,
	listAttendeesQuery,
	registerEventBody,
	updateAttendeeBody,
} from "@/modules/events/schema/events-attendees.schema";
import { createEventBody } from "@/modules/events/schema/events-create.schema";
import { listEventsQuery } from "@/modules/events/schema/events-params.schema";
import {
	adminEventResponseSchema,
	attendeeListResponse,
	attendeeResponseSchema,
	checkInResponseSchema,
	eventErrorResponseSchema,
	organizerMemberResponseSchema,
} from "@/modules/events/schema/events-response.schema";
import { updateEventBody } from "@/modules/events/schema/events-update.schema";
import {
	toAdminEventDto,
	toAttendeeDto,
	toPublicEventDto,
} from "@/modules/events/utils/events.mapper";
import { authContext } from "@/plugins/auth";
import { paginate } from "@/utils/paginate";

// ── Helpers ──────────────────────────────────────

type EventRow = typeof schema.event.$inferSelect;

function computeChanges(
	previous: EventRow,
	body: typeof updateEventBody.static,
	startDate: Date,
	endDate: Date,
): string[] {
	const changes: string[] = [];

	if (body.title !== undefined && body.title !== previous.title) {
		changes.push("Title updated");
	}
	if (
		body.description !== undefined &&
		body.description !== previous.description
	) {
		changes.push("Description updated");
	}
	if (body.eventType !== undefined && body.eventType !== previous.eventType) {
		changes.push("Event type changed");
	}
	if (body.location !== undefined && body.location !== previous.location) {
		changes.push(
			body.location === null ? "Location removed" : "Location updated",
		);
	}
	if (
		body.meetingUrl !== undefined &&
		body.meetingUrl !== previous.meetingUrl
	) {
		changes.push(
			body.meetingUrl === null
				? "Meeting link removed"
				: "Meeting link updated",
		);
	}
	if (
		body.startDate !== undefined &&
		startDate.getTime() !== previous.startDate.getTime()
	) {
		changes.push("Start date/time changed");
	}
	if (
		body.endDate !== undefined &&
		endDate.getTime() !== previous.endDate.getTime()
	) {
		changes.push("End date/time changed");
	}
	if (body.capacity !== undefined && body.capacity !== previous.capacity) {
		changes.push(
			body.capacity === null
				? "Capacity removed"
				: `Capacity updated to ${body.capacity}`,
		);
	}
	if (
		body.meetingPlatform !== undefined &&
		body.meetingPlatform !== previous.meetingPlatform
	) {
		changes.push(
			body.meetingPlatform === null
				? "Meeting platform removed"
				: "Meeting platform updated",
		);
	}
	if (
		body.coverImage !== undefined &&
		body.coverImage !== previous.coverImage
	) {
		changes.push(
			body.coverImage === null ? "Cover image removed" : "Cover image updated",
		);
	}
	if (body.registrationDeadline !== undefined) {
		const deadline = body.registrationDeadline
			? new Date(body.registrationDeadline)
			: null;
		const prev = previous.registrationDeadline;
		if (
			(deadline === null) !== (prev === null) ||
			(deadline !== null &&
				prev !== null &&
				deadline.getTime() !== prev.getTime())
		) {
			changes.push(
				deadline === null
					? "Registration deadline removed"
					: "Registration deadline changed",
			);
		}
	}
	if (
		body.requiresRegistration !== undefined &&
		body.requiresRegistration !== previous.requiresRegistration
	) {
		changes.push(
			body.requiresRegistration
				? "Registration now required"
				: "Registration no longer required",
		);
	}
	if (
		body.registrationMode !== undefined &&
		body.registrationMode !== previous.registrationMode
	) {
		changes.push("Registration mode changed");
	}
	if (
		body.checkInEnabled !== undefined &&
		body.checkInEnabled !== previous.checkInEnabled
	) {
		changes.push(
			body.checkInEnabled ? "Check-in enabled" : "Check-in disabled",
		);
	}
	if (
		body.remindersEnabled !== undefined &&
		body.remindersEnabled !== previous.remindersEnabled
	) {
		changes.push(
			body.remindersEnabled ? "Reminders enabled" : "Reminders disabled",
		);
	}
	if (
		body.attendeeListVisible !== undefined &&
		body.attendeeListVisible !== previous.attendeeListVisible
	) {
		changes.push(
			body.attendeeListVisible
				? "Attendee list now visible"
				: "Attendee list now hidden",
		);
	}
	if (body.surveys !== undefined) {
		changes.push("Surveys updated");
	}

	return changes;
}

async function generateReminders(
	eventId: string,
	startDate: Date,
	now: Date,
): Promise<void> {
	const oneHourMs = 60 * 60 * 1000;
	const twentyFourHoursMs = 24 * oneHourMs;

	const sendsAt = [
		new Date(startDate.getTime() - twentyFourHoursMs),
		new Date(startDate.getTime() - oneHourMs),
	].filter((d) => d.getTime() > now.getTime());

	if (sendsAt.length === 0) return;

	await db.insert(schema.eventReminder).values(
		sendsAt.map((sendAt) => ({
			id: crypto.randomUUID(),
			eventId,
			sendAt,
			createdAt: now,
		})),
	);
}

async function regenerateReminders(
	eventId: string,
	startDate: Date,
	now: Date,
): Promise<void> {
	await db
		.delete(schema.eventReminder)
		.where(
			and(
				eq(schema.eventReminder.eventId, eventId),
				isNull(schema.eventReminder.sentAt),
			),
		);

	await generateReminders(eventId, startDate, now);
}

export const eventsModule = new Elysia({ prefix: "/events" })
	.use(authContext)
	// ──────────────── List events ────────────────
	.get(
		"/",
		async ({ query, user }) => {
			const page = paginate(query);
			const { filter, userId, status, search } = query;
			const conditions = [];
			const now = new Date();

			if (filter === "upcoming") {
				conditions.push(gt(schema.event.startDate, now));
			} else if (filter === "current") {
				conditions.push(
					and(lte(schema.event.startDate, now), gte(schema.event.endDate, now)),
				);
			} else if (filter === "past") {
				conditions.push(lt(schema.event.endDate, now));
			}

			const isOwnEventList = Boolean(userId && user?.id === userId);

			if (user?.role === "admin") {
				if (status) {
					conditions.push(eq(schema.event.status, status));
				}
			} else if (isOwnEventList) {
				// Non-admin viewing their own events - show all statuses
				if (status) {
					conditions.push(eq(schema.event.status, status));
				}
			} else {
				// Public/non-authenticated - only visible statuses
				conditions.push(
					or(
						eq(schema.event.status, "approved"),
						eq(schema.event.status, "in_progress"),
						eq(schema.event.status, "completed"),
					)!,
				);
			}

			if (search) {
				conditions.push(like(schema.event.title, `%${search}%`));
			}

			if (userId) {
				const memberEventIds = db
					.select({ eventId: schema.eventMember.eventId })
					.from(schema.eventMember)
					.where(
						and(
							eq(schema.eventMember.userId, userId),
							inArray(schema.eventMember.role, ["owner", "organizer"]),
						),
					);
				conditions.push(inArray(schema.event.id, memberEventIds));
			}

			const where = conditions.length > 0 ? and(...conditions) : undefined;

			const [countResult] = await db
				.select({ count: count() })
				.from(schema.event)
				.where(where);

			const isAdmin = user?.role === "admin";

			const events = await db.query.event.findMany({
				where,
				orderBy: [desc(schema.event.createdAt)],
				limit: page.limit,
				offset: page.offset,
				with: {
					members: {
						where: eq(schema.eventMember.role, "owner"),
						with: {
							user: { columns: { id: true, name: true, image: true } as const },
						},
					},
					...(isAdmin ? { surveys: true as const } : {}),
				},
			});

			return {
				status: "ok" as const,
				data: events.map(isAdmin ? toAdminEventDto : toPublicEventDto),
				meta: page.meta(countResult?.count ?? 0),
			};
		},
		{
			auth: "optional",
			query: listEventsQuery,
			detail: {
				tags: ["Events"],
				summary: "List events",
				description:
					"Public sees approved / in-progress / completed events. " +
					"Admins see all and can filter by status. " +
					"Filter by upcoming, current, or past. Use userId to see events for a specific user.",
			},
		},
	)
	// ──────────────── Get event detail ────────────────
	.get(
		"/:id",
		async ({ params, user, set }) => {
			const event = await db.query.event.findFirst({
				where: eq(schema.event.id, params.id),
				with: {
					members: {
						with: {
							user: { columns: { id: true, name: true, image: true } as const },
							attendees: { columns: { status: true } },
						},
					},
					surveys: true,
				},
			});

			if (!event) {
				set.status = EVENT_ERRORS.EVENT_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: EVENT_ERRORS.EVENT_NOT_FOUND.code,
					error: EVENT_ERRORS.EVENT_NOT_FOUND.message,
				};
			}

			const isPrivileged =
				user?.role === "admin" ||
				event.members.some(
					(m) =>
						m.userId === user?.id &&
						(m.role === "owner" || m.role === "organizer"),
				);

			const isApprovedAttendee = event.members.some(
				(m) =>
					m.userId === user?.id &&
					m.role === "attendee" &&
					m.attendees?.[0]?.status === "approved",
			);

			const viewerMember = user
				? event.members.find((m) => m.userId === user.id)
				: null;
			const viewerRegistration = viewerMember
				? {
						role: viewerMember.role,
						attendeeStatus:
							viewerMember.role === "attendee"
								? (viewerMember.attendees?.[0]?.status ?? null)
								: null,
					}
				: null;

			const baseDto = isPrivileged || isApprovedAttendee
				? toAdminEventDto(event)
				: toPublicEventDto(event);

			if (isPrivileged || isApprovedAttendee) {
				return {
					status: "ok" as const,
					data: { ...baseDto, viewerRegistration },
				};
			}

			const visibleStatuses = ["approved", "in_progress", "completed"] as const;
			if (
				visibleStatuses.includes(
					event.status as (typeof visibleStatuses)[number],
				)
			) {
				return {
					status: "ok" as const,
					data: { ...baseDto, viewerRegistration },
				};
			}

			set.status = EVENT_ERRORS.EVENT_NOT_FOUND.httpStatus;
			return {
				status: "error",
				code: EVENT_ERRORS.EVENT_NOT_FOUND.code,
				error: EVENT_ERRORS.EVENT_NOT_FOUND.message,
			};
		},
		{
			auth: "optional",
			detail: {
				tags: ["Events"],
				summary: "Get event by id",
				description:
					"Public sees approved / in-progress / completed events. " +
					"Owners, organizers, and admins see all details for any status.",
			},
		},
	)
	// ──────────────── Create event ────────────────
	.post(
		"/",
		async ({ user, body, status }) => {
			const startDate = new Date(body.startDate);
			const endDate = new Date(body.endDate);

			if (startDate >= endDate) {
				return status(EVENT_ERRORS.INVALID_DATES.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.INVALID_DATES.code,
					error: EVENT_ERRORS.INVALID_DATES.message,
				});
			}

			if (body.registrationDeadline) {
				const deadline = new Date(body.registrationDeadline);
				if (deadline >= startDate) {
					return status(EVENT_ERRORS.INVALID_REGISTRATION_DEADLINE.httpStatus, {
						status: "error" as const,
						code: EVENT_ERRORS.INVALID_REGISTRATION_DEADLINE.code,
						error: EVENT_ERRORS.INVALID_REGISTRATION_DEADLINE.message,
					});
				}
			}

			if (
				(body.eventType === "in_person" || body.eventType === "hybrid") &&
				!body.location
			) {
				return status(EVENT_ERRORS.LOCATION_REQUIRED.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.LOCATION_REQUIRED.code,
					error: EVENT_ERRORS.LOCATION_REQUIRED.message,
				});
			}

			if (
				(body.eventType === "online" || body.eventType === "hybrid") &&
				!body.meetingUrl
			) {
				return status(EVENT_ERRORS.MEETING_URL_REQUIRED.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.MEETING_URL_REQUIRED.code,
					error: EVENT_ERRORS.MEETING_URL_REQUIRED.message,
				});
			}

			let ownerId = user.id;
			if (body.organizerId) {
				if (user.role !== "admin") {
					return status(EVENT_ERRORS.ADMIN_ONLY.httpStatus, {
						status: "error" as const,
						code: EVENT_ERRORS.ADMIN_ONLY.code,
						error: EVENT_ERRORS.ADMIN_ONLY.message,
					});
				}

				const assignedUser = await db.query.user.findFirst({
					where: eq(schema.user.id, body.organizerId),
				});
				if (!assignedUser) {
					return status(EVENT_ERRORS.USER_NOT_FOUND.httpStatus, {
						status: "error" as const,
						code: EVENT_ERRORS.USER_NOT_FOUND.code,
						error: EVENT_ERRORS.USER_NOT_FOUND.message,
					});
				}
				ownerId = assignedUser.id;
			}

			const now = new Date();
			const eventId = crypto.randomUUID();
			const initialStatus = user.role === "admin" ? "approved" : "draft";

			await db.insert(schema.event).values({
				id: eventId,
				title: body.title,
				description: body.description,
				coverImage: body.coverImage ?? null,
				eventType: body.eventType,
				location: body.location ?? null,
				meetingPlatform: body.meetingPlatform ?? null,
				meetingUrl: body.meetingUrl ?? null,
				startDate,
				endDate,
				registrationDeadline: body.registrationDeadline
					? new Date(body.registrationDeadline)
					: null,
				requiresRegistration: body.requiresRegistration ?? true,
				registrationMode: body.registrationMode ?? "open",
				capacity: body.capacity ?? null,
				status: initialStatus,
				checkInEnabled: body.checkInEnabled ?? false,
				remindersEnabled: body.remindersEnabled ?? true,
				attendeeListVisible: body.attendeeListVisible ?? false,
				createdAt: now,
				updatedAt: now,
			});

			const memberId = crypto.randomUUID();
			await db.insert(schema.eventMember).values({
				id: memberId,
				eventId,
				userId: ownerId,
				role: "owner",
				ticketToken: `ticket_${crypto.randomUUID()}`,
				createdAt: now,
			});

			await db.insert(schema.eventOrganizer).values({
				memberId,
				createdAt: now,
			});

			if (body.remindersEnabled ?? true) {
				await generateReminders(eventId, startDate, now);
			}

			if (body.surveys?.length) {
				await db.insert(schema.eventSurvey).values(
					body.surveys.map((s) => ({
						id: crypto.randomUUID(),
						eventId,
						audience: s.audience,
						url: s.url,
						sendAt: new Date(s.sendAt),
						createdAt: now,
					})),
				);
			}

			const created = await db.query.event.findFirst({
				where: eq(schema.event.id, eventId),
				with: {
					members: {
						with: {
							user: { columns: { id: true, name: true, image: true } as const },
						},
					},
					surveys: true,
				},
			});

			return status(201, {
				status: "ok" as const,
				data: toAdminEventDto(created!),
			});
		},
		{
			auth: true,
			body: createEventBody,
			response: {
				201: adminEventResponseSchema,
				400: eventErrorResponseSchema,
				403: eventErrorResponseSchema,
				404: eventErrorResponseSchema,
			},
			detail: {
				tags: ["Events"],
				summary: "Create an event",
				description:
					"User-created events start as draft. " +
					"Admin-created events start as approved. " +
					"Admins can assign a different owner via organizerId.",
			},
		},
	)
	// ──────────────── Update event ────────────────
	.put(
		"/:id",
		async ({ params, user, body, status }) => {
			const event = await db.query.event.findFirst({
				where: eq(schema.event.id, params.id),
				with: {
					members: {
						columns: { userId: true, role: true },
					},
				},
			});

			if (!event) {
				return status(EVENT_ERRORS.EVENT_NOT_FOUND.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.EVENT_NOT_FOUND.code,
					error: EVENT_ERRORS.EVENT_NOT_FOUND.message,
				});
			}

			const isOrganizer = event.members.some(
				(m) =>
					m.userId === user.id &&
					(m.role === "owner" || m.role === "organizer"),
			);
			if (!isOrganizer && user.role !== "admin") {
				return status(EVENT_ERRORS.NOT_ORGANIZER.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.NOT_ORGANIZER.code,
					error: EVENT_ERRORS.NOT_ORGANIZER.message,
				});
			}

			const startDate = body.startDate
				? new Date(body.startDate)
				: event.startDate;
			const endDate = body.endDate ? new Date(body.endDate) : event.endDate;

			if (startDate >= endDate) {
				return status(EVENT_ERRORS.INVALID_DATES.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.INVALID_DATES.code,
					error: EVENT_ERRORS.INVALID_DATES.message,
				});
			}

			if (body.registrationDeadline) {
				const deadline = new Date(body.registrationDeadline);
				if (deadline >= startDate) {
					return status(EVENT_ERRORS.INVALID_REGISTRATION_DEADLINE.httpStatus, {
						status: "error" as const,
						code: EVENT_ERRORS.INVALID_REGISTRATION_DEADLINE.code,
						error: EVENT_ERRORS.INVALID_REGISTRATION_DEADLINE.message,
					});
				}
			}

			const resolvedEventType = body.eventType ?? event.eventType;
			const resolvedLocation =
				body.location !== undefined ? body.location : event.location;
			const resolvedMeetingUrl =
				body.meetingUrl !== undefined ? body.meetingUrl : event.meetingUrl;

			if (
				(resolvedEventType === "in_person" || resolvedEventType === "hybrid") &&
				!resolvedLocation
			) {
				return status(EVENT_ERRORS.LOCATION_REQUIRED.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.LOCATION_REQUIRED.code,
					error: EVENT_ERRORS.LOCATION_REQUIRED.message,
				});
			}

			if (
				(resolvedEventType === "online" || resolvedEventType === "hybrid") &&
				!resolvedMeetingUrl
			) {
				return status(EVENT_ERRORS.MEETING_URL_REQUIRED.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.MEETING_URL_REQUIRED.code,
					error: EVENT_ERRORS.MEETING_URL_REQUIRED.message,
				});
			}

			const now = new Date();

			await db
				.update(schema.event)
				.set({
					status: event.status === "rejected" ? "draft" : event.status,
					rejectionReason:
						event.status === "rejected" ? null : event.rejectionReason,
					title: body.title ?? event.title,
					description: body.description ?? event.description,
					coverImage: body.coverImage ?? event.coverImage,
					eventType: body.eventType ?? event.eventType,
					location:
						body.location !== undefined ? body.location : event.location,
					meetingPlatform:
						body.meetingPlatform !== undefined
							? body.meetingPlatform
							: event.meetingPlatform,
					meetingUrl:
						body.meetingUrl !== undefined ? body.meetingUrl : event.meetingUrl,
					startDate,
					endDate,
					registrationDeadline:
						body.registrationDeadline !== undefined
							? body.registrationDeadline
								? new Date(body.registrationDeadline)
								: null
							: event.registrationDeadline,
					requiresRegistration:
						body.requiresRegistration ?? event.requiresRegistration,
					registrationMode: body.registrationMode ?? event.registrationMode,
					capacity:
						body.capacity !== undefined ? body.capacity : event.capacity,
					checkInEnabled: body.checkInEnabled ?? event.checkInEnabled,
					remindersEnabled: body.remindersEnabled ?? event.remindersEnabled,
					attendeeListVisible:
						body.attendeeListVisible ?? event.attendeeListVisible,
					updatedAt: now,
				})
				.where(eq(schema.event.id, params.id));

			// Backfill ticket tokens when check-in is newly enabled
			if (body.checkInEnabled && !event.checkInEnabled) {
				await db
					.update(schema.eventMember)
					.set({
						ticketToken: sql`'ticket_' || lower(hex(randomblob(16)))`,
					})
					.where(
						and(
							eq(schema.eventMember.eventId, params.id),
							isNull(schema.eventMember.ticketToken),
						),
					);
			}

			// Regenerate reminders when start date changed and reminders are enabled
			const remindersActive = body.remindersEnabled ?? event.remindersEnabled;
			if (
				remindersActive &&
				body.startDate !== undefined &&
				startDate.getTime() !== event.startDate.getTime()
			) {
				await regenerateReminders(params.id, startDate, now);
			}

			// Replace surveys when provided
			if (body.surveys !== undefined) {
				await db
					.delete(schema.eventSurvey)
					.where(eq(schema.eventSurvey.eventId, params.id));

				if (body.surveys.length > 0) {
					await db.insert(schema.eventSurvey).values(
						body.surveys.map((s) => ({
							id: crypto.randomUUID(),
							eventId: params.id,
							audience: s.audience,
							url: s.url,
							sendAt: new Date(s.sendAt),
							createdAt: now,
						})),
					);
				}
			}

			// Fire-and-forget update notification if organizer requested it
			if (
				body.notifyAttendees &&
				(event.status === "approved" || event.status === "in_progress")
			) {
				const changes = computeChanges(event, body, startDate, endDate);
				if (changes.length > 0) {
					sendEventUpdated(params.id, body.title ?? event.title, changes);
				}
			}

			const updated = await db.query.event.findFirst({
				where: eq(schema.event.id, params.id),
				with: {
					members: {
						with: {
							user: { columns: { id: true, name: true, image: true } as const },
						},
					},
					surveys: true,
				},
			});

			return { status: "ok" as const, data: toAdminEventDto(updated!) };
		},
		{
			auth: true,
			body: updateEventBody,
			response: {
				200: adminEventResponseSchema,
				400: eventErrorResponseSchema,
				403: eventErrorResponseSchema,
				404: eventErrorResponseSchema,
			},
			detail: {
				tags: ["Events"],
				summary: "Update an event",
				description:
					"Only the event owner or an admin can update. " +
					"Partial updates are supported — omit fields to keep current values.",
			},
		},
	)
	// ──────────────── Delete event ────────────────
	.delete(
		"/:id",
		async ({ params, user, set }) => {
			const event = await db.query.event.findFirst({
				where: eq(schema.event.id, params.id),
				with: {
					members: {
						columns: { userId: true, role: true },
					},
				},
			});

			if (!event) {
				set.status = EVENT_ERRORS.EVENT_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: EVENT_ERRORS.EVENT_NOT_FOUND.code,
					error: EVENT_ERRORS.EVENT_NOT_FOUND.message,
				};
			}

			const isOwner = event.members.some(
				(m) => m.userId === user.id && m.role === "owner",
			);

			if (user.role !== "admin" && !isOwner) {
				set.status = EVENT_ERRORS.NOT_OWNER.httpStatus;
				return {
					status: "error",
					code: EVENT_ERRORS.NOT_OWNER.code,
					error: EVENT_ERRORS.NOT_OWNER.message,
				};
			}

			if (user.role !== "admin" && event.status !== "draft") {
				set.status = EVENT_ERRORS.CANNOT_DELETE.httpStatus;
				return {
					status: "error",
					code: EVENT_ERRORS.CANNOT_DELETE.code,
					error: EVENT_ERRORS.CANNOT_DELETE.message,
				};
			}

			await db.delete(schema.event).where(eq(schema.event.id, params.id));

			set.status = 204;
		},
		{
			auth: true,
			detail: {
				tags: ["Events"],
				summary: "Delete an event",
				description:
					"Admins can delete any event. Owners can only delete their own draft events.",
			},
		},
	)
	// ──────────────── Submit for review ────────────────
	.post(
		"/:id/submit",
		async ({ params, user, status }) => {
			const event = await db.query.event.findFirst({
				where: eq(schema.event.id, params.id),
				with: {
					members: {
						columns: { userId: true, role: true },
					},
				},
			});

			if (!event) {
				return status(EVENT_ERRORS.EVENT_NOT_FOUND.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.EVENT_NOT_FOUND.code,
					error: EVENT_ERRORS.EVENT_NOT_FOUND.message,
				});
			}

			const isOrganizer = event.members.some(
				(m) =>
					m.userId === user.id &&
					(m.role === "owner" || m.role === "organizer"),
			);
			if (!isOrganizer && user.role !== "admin") {
				return status(EVENT_ERRORS.NOT_ORGANIZER.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.NOT_ORGANIZER.code,
					error: EVENT_ERRORS.NOT_ORGANIZER.message,
				});
			}

			if (event.status !== "draft" && event.status !== "rejected") {
				return status(EVENT_ERRORS.NOT_DRAFT.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.NOT_DRAFT.code,
					error: EVENT_ERRORS.NOT_DRAFT.message,
				});
			}

			await db
				.update(schema.event)
				.set({
					status: "pending_review",
					rejectionReason: null,
					updatedAt: new Date(),
				})
				.where(eq(schema.event.id, params.id));

			const updated = await db.query.event.findFirst({
				where: eq(schema.event.id, params.id),
				with: {
					members: {
						with: {
							user: { columns: { id: true, name: true, image: true } as const },
						},
					},
					surveys: true,
				},
			});

			return { status: "ok" as const, data: toAdminEventDto(updated!) };
		},
		{
			auth: true,
			response: {
				200: adminEventResponseSchema,
				400: eventErrorResponseSchema,
				403: eventErrorResponseSchema,
				404: eventErrorResponseSchema,
			},
			detail: {
				tags: ["Events"],
				summary: "Submit event for review",
				description:
					"Owner or admin submits a draft event for admin review. " +
					"Status changes to pending_review.",
			},
		},
	)
	// ──────────────── Approve event ────────────────
	.post(
		"/:id/approve",
		async ({ params, user, status }) => {
			const event = await db.query.event.findFirst({
				where: eq(schema.event.id, params.id),
			});

			if (!event) {
				return status(EVENT_ERRORS.EVENT_NOT_FOUND.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.EVENT_NOT_FOUND.code,
					error: EVENT_ERRORS.EVENT_NOT_FOUND.message,
				});
			}

			if (user.role !== "admin") {
				return status(EVENT_ERRORS.ADMIN_ONLY.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.ADMIN_ONLY.code,
					error: EVENT_ERRORS.ADMIN_ONLY.message,
				});
			}

			if (event.status !== "pending_review") {
				return status(EVENT_ERRORS.NOT_PENDING_REVIEW.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.NOT_PENDING_REVIEW.code,
					error: EVENT_ERRORS.NOT_PENDING_REVIEW.message,
				});
			}

			await db
				.update(schema.event)
				.set({ status: "approved", updatedAt: new Date() })
				.where(eq(schema.event.id, params.id));

			const updated = await db.query.event.findFirst({
				where: eq(schema.event.id, params.id),
				with: {
					members: {
						with: {
							user: { columns: { id: true, name: true, image: true } as const },
						},
					},
					surveys: true,
				},
			});

			return { status: "ok" as const, data: toAdminEventDto(updated!) };
		},
		{
			auth: true,
			response: {
				200: adminEventResponseSchema,
				400: eventErrorResponseSchema,
				403: eventErrorResponseSchema,
				404: eventErrorResponseSchema,
			},
			detail: {
				tags: ["Events"],
				summary: "Approve an event",
				description:
					"Admin only. Approves a pending_review event. " +
					"Status changes to approved.",
			},
		},
	)
	// ──────────────── Reject event ────────────────
	.post(
		"/:id/reject",
		async ({ params, user, body, status }) => {
			const event = await db.query.event.findFirst({
				where: eq(schema.event.id, params.id),
			});

			if (!event) {
				return status(EVENT_ERRORS.EVENT_NOT_FOUND.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.EVENT_NOT_FOUND.code,
					error: EVENT_ERRORS.EVENT_NOT_FOUND.message,
				});
			}

			if (user.role !== "admin") {
				return status(EVENT_ERRORS.ADMIN_ONLY.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.ADMIN_ONLY.code,
					error: EVENT_ERRORS.ADMIN_ONLY.message,
				});
			}

			if (event.status !== "pending_review") {
				return status(EVENT_ERRORS.NOT_PENDING_REVIEW.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.NOT_PENDING_REVIEW.code,
					error: EVENT_ERRORS.NOT_PENDING_REVIEW.message,
				});
			}

			await db
				.update(schema.event)
				.set({
					status: "rejected",
					rejectionReason: body.reason,
					updatedAt: new Date(),
				})
				.where(eq(schema.event.id, params.id));

			const updated = await db.query.event.findFirst({
				where: eq(schema.event.id, params.id),
				with: {
					members: {
						with: {
							user: { columns: { id: true, name: true, image: true } as const },
						},
					},
					surveys: true,
				},
			});

			return { status: "ok" as const, data: toAdminEventDto(updated!) };
		},
		{
			auth: true,
			body: rejectEventBody,
			response: {
				200: adminEventResponseSchema,
				400: eventErrorResponseSchema,
				403: eventErrorResponseSchema,
				404: eventErrorResponseSchema,
			},
			detail: {
				tags: ["Events"],
				summary: "Reject an event",
				description:
					"Admin only. Rejects a pending_review event with a reason. " +
					"Status changes to rejected.",
			},
		},
	)
	// ──────────────── Cancel event ────────────────
	.post(
		"/:id/cancel",
		async ({ params, user, status }) => {
			const event = await db.query.event.findFirst({
				where: eq(schema.event.id, params.id),
				with: {
					members: {
						columns: { userId: true, role: true },
					},
				},
			});

			if (!event) {
				return status(EVENT_ERRORS.EVENT_NOT_FOUND.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.EVENT_NOT_FOUND.code,
					error: EVENT_ERRORS.EVENT_NOT_FOUND.message,
				});
			}

			const isOrganizer = event.members.some(
				(m) =>
					m.userId === user.id &&
					(m.role === "owner" || m.role === "organizer"),
			);
			if (!isOrganizer && user.role !== "admin") {
				return status(EVENT_ERRORS.NOT_ORGANIZER.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.NOT_ORGANIZER.code,
					error: EVENT_ERRORS.NOT_ORGANIZER.message,
				});
			}

			if (event.status !== "approved" && event.status !== "in_progress") {
				return status(EVENT_ERRORS.CANNOT_CANCEL.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.CANNOT_CANCEL.code,
					error: EVENT_ERRORS.CANNOT_CANCEL.message,
				});
			}

			await db
				.update(schema.event)
				.set({ status: "cancelled", updatedAt: new Date() })
				.where(eq(schema.event.id, params.id));

			// Fire-and-forget cancellation email to all approved/pending attendees
			sendEventCancelled(params.id, event.title);

			const updated = await db.query.event.findFirst({
				where: eq(schema.event.id, params.id),
				with: {
					members: {
						with: {
							user: { columns: { id: true, name: true, image: true } as const },
						},
					},
					surveys: true,
				},
			});

			return { status: "ok" as const, data: toAdminEventDto(updated!) };
		},
		{
			auth: true,
			response: {
				200: adminEventResponseSchema,
				400: eventErrorResponseSchema,
				403: eventErrorResponseSchema,
				404: eventErrorResponseSchema,
			},
			detail: {
				tags: ["Events"],
				summary: "Cancel an event",
				description:
					"Owner or admin cancels an approved or in-progress event. " +
					"Status changes to cancelled.",
			},
		},
	)
	// ──────────────── Close registration ────────────────
	.post(
		"/:id/close-registration",
		async ({ params, user, status }) => {
			const event = await db.query.event.findFirst({
				where: eq(schema.event.id, params.id),
				with: {
					members: {
						columns: { userId: true, role: true },
					},
				},
			});

			if (!event) {
				return status(EVENT_ERRORS.EVENT_NOT_FOUND.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.EVENT_NOT_FOUND.code,
					error: EVENT_ERRORS.EVENT_NOT_FOUND.message,
				});
			}

			const isOrganizer = event.members.some(
				(m) =>
					m.userId === user.id &&
					(m.role === "owner" || m.role === "organizer"),
			);
			if (!isOrganizer && user.role !== "admin") {
				return status(EVENT_ERRORS.NOT_ORGANIZER.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.NOT_ORGANIZER.code,
					error: EVENT_ERRORS.NOT_ORGANIZER.message,
				});
			}

			if (event.registrationClosed) {
				return status(EVENT_ERRORS.REGISTRATION_ALREADY_CLOSED.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.REGISTRATION_ALREADY_CLOSED.code,
					error: EVENT_ERRORS.REGISTRATION_ALREADY_CLOSED.message,
				});
			}

			const now = new Date();

			await db
				.update(schema.event)
				.set({
					registrationClosed: true,
					registrationClosedAt: now,
					updatedAt: now,
				})
				.where(eq(schema.event.id, params.id));

			const updated = await db.query.event.findFirst({
				where: eq(schema.event.id, params.id),
				with: {
					members: {
						with: {
							user: { columns: { id: true, name: true, image: true } as const },
						},
					},
					surveys: true,
				},
			});

			return { status: "ok" as const, data: toAdminEventDto(updated!) };
		},
		{
			auth: true,
			response: {
				200: adminEventResponseSchema,
				400: eventErrorResponseSchema,
				403: eventErrorResponseSchema,
				404: eventErrorResponseSchema,
			},
			detail: {
				tags: ["Events"],
				summary: "Close event registration",
				description:
					"Owner or admin closes registration for an event. " +
					"Sets registrationClosed to true.",
			},
		},
 	)
 	// ──────────────── Reopen registration ────────────────
 	.post(
 		"/:id/reopen-registration",
 		async ({ params, user, status }) => {
 			const event = await db.query.event.findFirst({
 				where: eq(schema.event.id, params.id),
 				with: {
 					members: {
 						columns: { userId: true, role: true },
 					},
 				},
 			});

 			if (!event) {
 				return status(EVENT_ERRORS.EVENT_NOT_FOUND.httpStatus, {
 					status: "error" as const,
 					code: EVENT_ERRORS.EVENT_NOT_FOUND.code,
 					error: EVENT_ERRORS.EVENT_NOT_FOUND.message,
 				});
 			}

 			const isOrganizer = event.members.some(
 				(m) =>
 					m.userId === user.id &&
 					(m.role === "owner" || m.role === "organizer"),
 			);
 			if (!isOrganizer && user.role !== "admin") {
 				return status(EVENT_ERRORS.NOT_ORGANIZER.httpStatus, {
 					status: "error" as const,
 					code: EVENT_ERRORS.NOT_ORGANIZER.code,
 					error: EVENT_ERRORS.NOT_ORGANIZER.message,
 				});
 			}

 			if (!event.registrationClosed) {
 				return status(400, {
 					status: "error" as const,
 					code: "REGISTRATION_NOT_CLOSED",
 					error: "Registration is not closed.",
 				});
 			}

 			const now = new Date();

 			await db
 				.update(schema.event)
 				.set({
 					registrationClosed: false,
 					registrationClosedAt: null,
 					updatedAt: now,
 				})
 				.where(eq(schema.event.id, params.id));

 			const updated = await db.query.event.findFirst({
 				where: eq(schema.event.id, params.id),
 				with: {
 					members: {
 						with: {
 							user: { columns: { id: true, name: true, image: true } as const },
 						},
 					},
 					surveys: true,
 				},
 			});

 			return { status: "ok" as const, data: toAdminEventDto(updated!) };
 		},
 		{
 			auth: true,
 			response: {
 				200: adminEventResponseSchema,
 				400: eventErrorResponseSchema,
 				403: eventErrorResponseSchema,
 				404: eventErrorResponseSchema,
 			},
 			detail: {
 				tags: ["Events"],
 				summary: "Reopen event registration",
 				description:
 					"Owner or admin reopens registration for a closed event. " +
 					"Sets registrationClosed to false and clears registrationClosedAt.",
 			},
 		},
 	)
 	// ──────────────── Register as attendee ────────────────
	.post(
		"/:id/register",
		async ({ params, user, body, status }) => {
			const event = await db.query.event.findFirst({
				where: eq(schema.event.id, params.id),
			});

			if (!event) {
				return status(EVENT_ERRORS.EVENT_NOT_FOUND.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.EVENT_NOT_FOUND.code,
					error: EVENT_ERRORS.EVENT_NOT_FOUND.message,
				});
			}

			if (
				(event.status !== "approved" && event.status !== "in_progress") ||
				event.endDate < new Date()
			) {
				return status(EVENT_ERRORS.REGISTRATION_NOT_OPEN.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.REGISTRATION_NOT_OPEN.code,
					error: EVENT_ERRORS.REGISTRATION_NOT_OPEN.message,
				});
			}

			if (!event.requiresRegistration) {
				return status(EVENT_ERRORS.REGISTRATION_NOT_REQUIRED.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.REGISTRATION_NOT_REQUIRED.code,
					error: EVENT_ERRORS.REGISTRATION_NOT_REQUIRED.message,
				});
			}

			if (event.registrationClosed) {
				return status(EVENT_ERRORS.REGISTRATION_ALREADY_CLOSED.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.REGISTRATION_ALREADY_CLOSED.code,
					error: EVENT_ERRORS.REGISTRATION_ALREADY_CLOSED.message,
				});
			}

			if (
				event.registrationDeadline &&
				event.registrationDeadline < new Date()
			) {
				return status(EVENT_ERRORS.REGISTRATION_DEADLINE_PASSED.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.REGISTRATION_DEADLINE_PASSED.code,
					error: EVENT_ERRORS.REGISTRATION_DEADLINE_PASSED.message,
				});
			}

			const existingMember = await db.query.eventMember.findFirst({
				where: and(
					eq(schema.eventMember.eventId, params.id),
					eq(schema.eventMember.userId, user.id),
				),
			});

			if (existingMember) {
				if (
					existingMember.role === "owner" ||
					existingMember.role === "organizer"
				) {
					return status(EVENT_ERRORS.ALREADY_ORGANIZER.httpStatus, {
						status: "error" as const,
						code: EVENT_ERRORS.ALREADY_ORGANIZER.code,
						error: EVENT_ERRORS.ALREADY_ORGANIZER.message,
					});
				}

				return status(EVENT_ERRORS.ALREADY_REGISTERED.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.ALREADY_REGISTERED.code,
					error: EVENT_ERRORS.ALREADY_REGISTERED.message,
				});
			}

			let registrationStatus: "approved" | "pending" | "waitlisted" =
				event.registrationMode === "open" ? "approved" : "pending";

			if (event.capacity) {
				const [countResult] = await db
					.select({ count: count() })
					.from(schema.eventAttendee)
					.innerJoin(
						schema.eventMember,
						eq(schema.eventAttendee.memberId, schema.eventMember.id),
					)
					.where(
						and(
							eq(schema.eventMember.eventId, params.id),
							inArray(schema.eventAttendee.status, ["approved"]),
						),
					);

				if (countResult && countResult.count >= event.capacity) {
					registrationStatus = "waitlisted";
				}
			}

			const now = new Date();
			const memberId = crypto.randomUUID();
			const generatedToken = `ticket_${crypto.randomUUID()}`;

			await db.insert(schema.eventMember).values({
				id: memberId,
				eventId: params.id,
				userId: user.id,
				role: "attendee",
				ticketToken: generatedToken,
				createdAt: now,
			});

			await db.insert(schema.eventAttendee).values({
				memberId,
				status: registrationStatus,
				showInAttendeeList: body.showInAttendeeList ?? true,
				createdAt: now,
				updatedAt: now,
			});

			const member = await db.query.eventMember.findFirst({
				where: eq(schema.eventMember.id, memberId),
				with: {
					user: {
						columns: { id: true, name: true, image: true } as const,
					},
					attendees: true,
				},
			});

			// Fire-and-forget email notification
			if (registrationStatus === "approved") {
				sendRegistrationConfirmation(
					event,
					user.email,
					user.name,
					generatedToken,
				);
			} else if (registrationStatus === "pending") {
				sendRegistrationPending(event, user.email, user.name);
			}

			return {
				status: "ok" as const,
				data: toAttendeeDto(member!),
			};
		},
		{
			auth: true,
			body: registerEventBody,
			response: {
				200: attendeeResponseSchema,
				400: eventErrorResponseSchema,
				404: eventErrorResponseSchema,
				409: eventErrorResponseSchema,
			},
			detail: {
				tags: ["Events"],
				summary: "Register for an event",
				description:
					"Register as an attendee. Open-mode events are auto-approved; " +
					"approval-mode events require organizer approval. " +
					"If capacity is full, you will be waitlisted.",
			},
		},
	)
	// ──────────────── Unregister ────────────────
	.post(
		"/:id/unregister",
		async ({ params, user, status }) => {
			const member = await db.query.eventMember.findFirst({
				where: and(
					eq(schema.eventMember.eventId, params.id),
					eq(schema.eventMember.userId, user.id),
					eq(schema.eventMember.role, "attendee"),
				),
				with: {
					user: {
						columns: { id: true, name: true, image: true } as const,
					},
					attendees: true,
				},
			});

			if (!member) {
				return status(EVENT_ERRORS.NOT_REGISTERED.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.NOT_REGISTERED.code,
					error: EVENT_ERRORS.NOT_REGISTERED.message,
				});
			}

			const attendee = member.attendees[0];
			if (attendee.status === "cancelled") {
				return status(EVENT_ERRORS.NOT_REGISTERED.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.NOT_REGISTERED.code,
					error: EVENT_ERRORS.NOT_REGISTERED.message,
				});
			}

			const now = new Date();

			await db
				.update(schema.eventAttendee)
				.set({ status: "cancelled", updatedAt: now })
				.where(eq(schema.eventAttendee.memberId, member.id));

			// Promote next waitlisted if an approved attendee freed a slot
			if (attendee.status === "approved") {
				const event = await db.query.event.findFirst({
					where: eq(schema.event.id, params.id),
				});

				let promotedMemberId: string | undefined;

				if (event) {
					const waitlisted = await db
						.select({
							memberId: schema.eventAttendee.memberId,
						})
						.from(schema.eventAttendee)
						.innerJoin(
							schema.eventMember,
							eq(schema.eventAttendee.memberId, schema.eventMember.id),
						)
						.where(
							and(
								eq(schema.eventAttendee.status, "waitlisted"),
								eq(schema.eventMember.eventId, params.id),
							),
						)
						.orderBy(asc(schema.eventAttendee.createdAt))
						.limit(1);

					const nextMemberId = waitlisted[0]?.memberId;
					if (nextMemberId) {
						const newStatus =
							event.registrationMode === "open" ? "approved" : "pending";
						await db
							.update(schema.eventAttendee)
							.set({ status: newStatus, updatedAt: now })
							.where(eq(schema.eventAttendee.memberId, nextMemberId));
						promotedMemberId = nextMemberId;
						if (newStatus === "approved") {
							await db
								.update(schema.eventMember)
								.set({
									ticketToken: sql`'ticket_' || lower(hex(randomblob(16)))`,
								})
								.where(
									and(
										eq(schema.eventMember.id, nextMemberId),
										isNull(schema.eventMember.ticketToken),
									),
								);
						}
					}
				}

				// Fire-and-forget waitlist promotion email
				if (promotedMemberId) {
					sendWaitlistPromotion(event!, promotedMemberId);
				}
			}

			const updated = await db.query.eventMember.findFirst({
				where: eq(schema.eventMember.id, member.id),
				with: {
					user: {
						columns: { id: true, name: true, image: true } as const,
					},
					attendees: true,
				},
			});

			return {
				status: "ok" as const,
				data: toAttendeeDto(updated!),
			};
		},
		{
			auth: true,
			response: {
				200: attendeeResponseSchema,
				400: eventErrorResponseSchema,
				404: eventErrorResponseSchema,
			},
			detail: {
				tags: ["Events"],
				summary: "Unregister from an event",
				description:
					"Cancel your own registration. The first waitlisted attendee is promoted.",
			},
		},
	)
	// ──────────────── Toggle attendee visibility ────────────────
	.post(
		"/:id/attendee-visibility",
		async ({ params, user, body, status }) => {
			const event = await db.query.event.findFirst({
				where: eq(schema.event.id, params.id),
			});

			if (!event) {
				return status(EVENT_ERRORS.EVENT_NOT_FOUND.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.EVENT_NOT_FOUND.code,
					error: EVENT_ERRORS.EVENT_NOT_FOUND.message,
				});
			}

			if (!event.attendeeListVisible) {
				return status(EVENT_ERRORS.ATTENDEE_LIST_HIDDEN.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.ATTENDEE_LIST_HIDDEN.code,
					error: EVENT_ERRORS.ATTENDEE_LIST_HIDDEN.message,
				});
			}

			const member = await db.query.eventMember.findFirst({
				where: and(
					eq(schema.eventMember.eventId, params.id),
					eq(schema.eventMember.userId, user.id),
					eq(schema.eventMember.role, "attendee"),
				),
				with: { attendees: true },
			});

			if (!member) {
				return status(EVENT_ERRORS.NOT_REGISTERED.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.NOT_REGISTERED.code,
					error: EVENT_ERRORS.NOT_REGISTERED.message,
				});
			}

			const now = new Date();

			await db
				.update(schema.eventAttendee)
				.set({ showInAttendeeList: body.show, updatedAt: now })
				.where(eq(schema.eventAttendee.memberId, member.id));

			const updated = await db.query.eventMember.findFirst({
				where: eq(schema.eventMember.id, member.id),
				with: {
					user: {
						columns: { id: true, name: true, image: true } as const,
					},
					attendees: true,
				},
			});

			return {
				status: "ok" as const,
				data: toAttendeeDto(updated!),
			};
		},
		{
			auth: true,
			body: attendeeVisibilityBody,
			response: {
				200: attendeeResponseSchema,
				400: eventErrorResponseSchema,
				404: eventErrorResponseSchema,
			},
			detail: {
				tags: ["Events"],
				summary: "Toggle attendee list visibility",
				description:
					"Set whether you appear in the attendee list. " +
					"Requires the event to have attendee list visibility enabled.",
			},
		},
	)
	// ──────────────── List attendees ────────────────
	.get(
		"/:id/attendees",
		async ({ params, user, query, status }) => {
			const page = paginate(query);

			const event = await db.query.event.findFirst({
				where: eq(schema.event.id, params.id),
				with: {
					members: {
						columns: { userId: true, role: true },
					},
				},
			});

			if (!event) {
				return status(EVENT_ERRORS.EVENT_NOT_FOUND.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.EVENT_NOT_FOUND.code,
					error: EVENT_ERRORS.EVENT_NOT_FOUND.message,
				});
			}

			const isOrganizer = event.members.some(
				(m) =>
					m.userId === user.id &&
					(m.role === "owner" || m.role === "organizer"),
			);
			if (!isOrganizer && user.role !== "admin") {
				return status(EVENT_ERRORS.NOT_ORGANIZER.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.NOT_ORGANIZER.code,
					error: EVENT_ERRORS.NOT_ORGANIZER.message,
				});
			}

			const filters = [
				eq(schema.eventMember.eventId, params.id),
				eq(schema.eventMember.role, "attendee"),
			];

			const [countResult] = await db
				.select({ count: count() })
				.from(schema.eventMember)
				.innerJoin(
					schema.eventAttendee,
					eq(schema.eventMember.id, schema.eventAttendee.memberId),
				)
				.where(
					query.status
						? and(...filters, eq(schema.eventAttendee.status, query.status))
						: and(...filters),
				);

			const memberConditions = [...filters];
			if (query.status) {
				const matchedMemberIds = db
					.select({ memberId: schema.eventAttendee.memberId })
					.from(schema.eventAttendee)
					.where(eq(schema.eventAttendee.status, query.status));
				memberConditions.push(inArray(schema.eventMember.id, matchedMemberIds));
			}

			const members = await db.query.eventMember.findMany({
				where: and(...memberConditions),
				orderBy: [asc(schema.eventMember.createdAt)],
				limit: page.limit,
				offset: page.offset,
				with: {
					user: {
						columns: { id: true, name: true, image: true } as const,
					},
					attendees: true,
				},
			});

			return {
				status: "ok" as const,
				data: members.map(toAttendeeDto),
				meta: page.meta(countResult?.count ?? 0),
			};
		},
		{
			auth: true,
			query: listAttendeesQuery,
			response: {
				200: attendeeListResponse,
				403: eventErrorResponseSchema,
				404: eventErrorResponseSchema,
			},
			detail: {
				tags: ["Events"],
				summary: "List event attendees",
				description:
					"Organizer or admin only. Returns paginated list of attendees " +
					"with registration status. Filter by status.",
			},
		},
	)
	// ──────────────── Update attendee status ────────────────
	.put(
		"/:id/attendees/:memberId",
		async ({ params, user, body, status }) => {
			const event = await db.query.event.findFirst({
				where: eq(schema.event.id, params.id),
				with: {
					members: {
						columns: { userId: true, role: true },
					},
				},
			});

			if (!event) {
				return status(EVENT_ERRORS.EVENT_NOT_FOUND.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.EVENT_NOT_FOUND.code,
					error: EVENT_ERRORS.EVENT_NOT_FOUND.message,
				});
			}

			const isOrganizer = event.members.some(
				(m) =>
					m.userId === user.id &&
					(m.role === "owner" || m.role === "organizer"),
			);
			if (!isOrganizer && user.role !== "admin") {
				return status(EVENT_ERRORS.NOT_ORGANIZER.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.NOT_ORGANIZER.code,
					error: EVENT_ERRORS.NOT_ORGANIZER.message,
				});
			}

			const member = await db.query.eventMember.findFirst({
				where: and(
					eq(schema.eventMember.id, params.memberId),
					eq(schema.eventMember.eventId, params.id),
					eq(schema.eventMember.role, "attendee"),
				),
				with: { attendees: true },
			});

			if (!member) {
				return status(EVENT_ERRORS.ATTENDEE_NOT_FOUND.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.ATTENDEE_NOT_FOUND.code,
					error: EVENT_ERRORS.ATTENDEE_NOT_FOUND.message,
				});
			}

			const attendee = member.attendees[0];
			if (!attendee || attendee.status === "cancelled") {
				return status(EVENT_ERRORS.ATTENDEE_NOT_FOUND.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.ATTENDEE_NOT_FOUND.code,
					error: EVENT_ERRORS.ATTENDEE_NOT_FOUND.message,
				});
			}

			// Check capacity before approving
			if (
				body.status === "approved" &&
				attendee.status === "waitlisted" &&
				event.capacity
			) {
				const [capacityCount] = await db
					.select({ count: count() })
					.from(schema.eventAttendee)
					.innerJoin(
						schema.eventMember,
						eq(schema.eventAttendee.memberId, schema.eventMember.id),
					)
					.where(
						and(
							eq(schema.eventMember.eventId, params.id),
							inArray(schema.eventAttendee.status, ["approved"]),
						),
					);

				if (capacityCount && capacityCount.count >= event.capacity) {
					return status(EVENT_ERRORS.REGISTRATION_FULL.httpStatus, {
						status: "error" as const,
						code: EVENT_ERRORS.REGISTRATION_FULL.code,
						error: EVENT_ERRORS.REGISTRATION_FULL.message,
					});
				}
			}

			const now = new Date();

			await db
				.update(schema.eventAttendee)
				.set({ status: body.status, updatedAt: now })
				.where(eq(schema.eventAttendee.memberId, member.id));

			// Fire-and-forget email notification
			if (body.status === "approved") {
				sendRegistrationApproved(event, member.id);
				await db
					.update(schema.eventMember)
					.set({
						ticketToken: sql`'ticket_' || lower(hex(randomblob(16)))`,
					})
					.where(
						and(
							eq(schema.eventMember.id, member.id),
							isNull(schema.eventMember.ticketToken),
						),
					);
			} else if (body.status === "rejected") {
				sendRegistrationRejected(event, member.id);
			}

			// If rejected, promote next waitlisted if an approved attendee freed a slot
			let promotedMemberId: string | undefined;
			if (body.status === "rejected" && attendee.status === "approved") {
				const waitlisted = await db
					.select({
						memberId: schema.eventAttendee.memberId,
					})
					.from(schema.eventAttendee)
					.innerJoin(
						schema.eventMember,
						eq(schema.eventAttendee.memberId, schema.eventMember.id),
					)
					.where(
						and(
							eq(schema.eventAttendee.status, "waitlisted"),
							eq(schema.eventMember.eventId, params.id),
						),
					)
					.orderBy(asc(schema.eventAttendee.createdAt))
					.limit(1);

				const nextMemberId = waitlisted[0]?.memberId;
				if (nextMemberId) {
					const newStatus =
						event.registrationMode === "open" ? "approved" : "pending";
					await db
						.update(schema.eventAttendee)
						.set({ status: newStatus, updatedAt: now })
						.where(eq(schema.eventAttendee.memberId, nextMemberId));
					promotedMemberId = nextMemberId;
					if (newStatus === "approved") {
						await db
							.update(schema.eventMember)
							.set({
								ticketToken: sql`'ticket_' || lower(hex(randomblob(16)))`,
							})
							.where(
								and(
									eq(schema.eventMember.id, nextMemberId),
									isNull(schema.eventMember.ticketToken),
								),
							);
					}
				}
			}

			// Fire-and-forget waitlist promotion email
			if (promotedMemberId) {
				sendWaitlistPromotion(event, promotedMemberId);
			}

			const updated = await db.query.eventMember.findFirst({
				where: eq(schema.eventMember.id, member.id),
				with: {
					user: {
						columns: { id: true, name: true, image: true } as const,
					},
					attendees: true,
				},
			});

			return {
				status: "ok" as const,
				data: toAttendeeDto(updated!),
			};
		},
		{
			auth: true,
			body: updateAttendeeBody,
			response: {
				200: attendeeResponseSchema,
				400: eventErrorResponseSchema,
				403: eventErrorResponseSchema,
				404: eventErrorResponseSchema,
			},
			detail: {
				tags: ["Events"],
				summary: "Approve or reject an attendee",
				description:
					"Organizer or admin only. Approve or reject a specific attendee. " +
					"Rejecting promotes the first waitlisted attendee.",
			},
		},
	)
	// ──────────────── Add organizer ────────────────
	.post(
		"/:id/organizers",
		async ({ params, user, body, status }) => {
			const event = await db.query.event.findFirst({
				where: eq(schema.event.id, params.id),
				with: {
					members: {
						columns: { userId: true, role: true },
					},
				},
			});

			if (!event) {
				return status(EVENT_ERRORS.EVENT_NOT_FOUND.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.EVENT_NOT_FOUND.code,
					error: EVENT_ERRORS.EVENT_NOT_FOUND.message,
				});
			}

			const isOwner = event.members.some(
				(m) => m.userId === user.id && m.role === "owner",
			);
			if (!isOwner && user.role !== "admin") {
				return status(EVENT_ERRORS.NOT_OWNER.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.NOT_OWNER.code,
					error: EVENT_ERRORS.NOT_OWNER.message,
				});
			}

			const targetUser = await db.query.user.findFirst({
				where: eq(schema.user.id, body.userId),
			});
			if (!targetUser) {
				return status(EVENT_ERRORS.USER_NOT_FOUND.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.USER_NOT_FOUND.code,
					error: EVENT_ERRORS.USER_NOT_FOUND.message,
				});
			}

			const existingMember = event.members.find(
				(m) => m.userId === body.userId,
			);
			if (existingMember) {
				return status(EVENT_ERRORS.ALREADY_ORGANIZER_MEMBER.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.ALREADY_ORGANIZER_MEMBER.code,
					error: EVENT_ERRORS.ALREADY_ORGANIZER_MEMBER.message,
				});
			}

			const now = new Date();
			const memberId = crypto.randomUUID();

			await db.insert(schema.eventMember).values({
				id: memberId,
				eventId: params.id,
				userId: body.userId,
				role: "organizer",
				ticketToken: `ticket_${crypto.randomUUID()}`,
				createdAt: now,
			});

			await db.insert(schema.eventOrganizer).values({
				memberId,
				createdAt: now,
			});

			const member = await db.query.eventMember.findFirst({
				where: eq(schema.eventMember.id, memberId),
				with: {
					user: {
						columns: { id: true, name: true, image: true } as const,
					},
				},
			});

			return {
				status: "ok" as const,
				data: {
					memberId: member!.id,
					userId: member!.userId,
					user: {
						id: member!.user.id,
						name: member!.user.name,
						image: member!.user.image,
					},
					role: member!.role,
					createdAt: member!.createdAt.toISOString(),
				},
			};
		},
		{
			auth: true,
			body: addOrganizerBody,
			response: {
				200: organizerMemberResponseSchema,
				400: eventErrorResponseSchema,
				403: eventErrorResponseSchema,
				404: eventErrorResponseSchema,
				409: eventErrorResponseSchema,
			},
			detail: {
				tags: ["Events"],
				summary: "Add an organizer",
				description:
					"Owner or admin only. Add a user as an organizer for the event. " +
					"The user must not already be a member of the event.",
			},
		},
	)
	// ──────────────── Remove organizer ────────────────
	.delete(
		"/:id/organizers/:userId",
		async ({ params, user, set, status }) => {
			const event = await db.query.event.findFirst({
				where: eq(schema.event.id, params.id),
				with: {
					members: {
						columns: { userId: true, role: true, id: true },
					},
				},
			});

			if (!event) {
				return status(EVENT_ERRORS.EVENT_NOT_FOUND.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.EVENT_NOT_FOUND.code,
					error: EVENT_ERRORS.EVENT_NOT_FOUND.message,
				});
			}

			const isOwner = event.members.some(
				(m) => m.userId === user.id && m.role === "owner",
			);
			if (!isOwner && user.role !== "admin") {
				return status(EVENT_ERRORS.NOT_OWNER.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.NOT_OWNER.code,
					error: EVENT_ERRORS.NOT_OWNER.message,
				});
			}

			const targetMember = event.members.find(
				(m) => m.userId === params.userId,
			);

			if (!targetMember || targetMember.role === "attendee") {
				return status(EVENT_ERRORS.NOT_ORGANIZER_MEMBER.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.NOT_ORGANIZER_MEMBER.code,
					error: EVENT_ERRORS.NOT_ORGANIZER_MEMBER.message,
				});
			}

			if (targetMember.role === "owner") {
				return status(EVENT_ERRORS.CANNOT_REMOVE_OWNER.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.CANNOT_REMOVE_OWNER.code,
					error: EVENT_ERRORS.CANNOT_REMOVE_OWNER.message,
				});
			}

			await db
				.delete(schema.eventMember)
				.where(eq(schema.eventMember.id, targetMember.id));

			set.status = 204;
		},
		{
			auth: true,
			detail: {
				tags: ["Events"],
				summary: "Remove an organizer",
				description:
					"Owner or admin only. Remove an organizer from the event. " +
					"The event owner cannot be removed.",
			},
		},
	)
	// ──────────────── Check in ────────────────
	.post(
		"/:id/check-in",
		async ({ params, user, body, status }) => {
			const event = await db.query.event.findFirst({
				where: eq(schema.event.id, params.id),
				with: {
					members: {
						columns: { userId: true, role: true },
					},
				},
			});

			if (!event) {
				return status(EVENT_ERRORS.EVENT_NOT_FOUND.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.EVENT_NOT_FOUND.code,
					error: EVENT_ERRORS.EVENT_NOT_FOUND.message,
				});
			}

			const isOrganizer = event.members.some(
				(m) =>
					m.userId === user.id &&
					(m.role === "owner" || m.role === "organizer"),
			);
			if (!isOrganizer && user.role !== "admin") {
				return status(EVENT_ERRORS.NOT_ORGANIZER.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.NOT_ORGANIZER.code,
					error: EVENT_ERRORS.NOT_ORGANIZER.message,
				});
			}

			const member = await db.query.eventMember.findFirst({
				where: and(
					eq(schema.eventMember.ticketToken, body.ticketToken),
					eq(schema.eventMember.eventId, params.id),
				),
				with: {
					user: {
						columns: { id: true, name: true, image: true } as const,
					},
				},
			});

			if (!member) {
				return status(EVENT_ERRORS.INVALID_TICKET_TOKEN.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.INVALID_TICKET_TOKEN.code,
					error: EVENT_ERRORS.INVALID_TICKET_TOKEN.message,
				});
			}

			if (member.checkedIn) {
				return status(EVENT_ERRORS.ALREADY_CHECKED_IN.httpStatus, {
					status: "error" as const,
					code: EVENT_ERRORS.ALREADY_CHECKED_IN.code,
					error: EVENT_ERRORS.ALREADY_CHECKED_IN.message,
				});
			}

			const now = new Date();

			await db
				.update(schema.eventMember)
				.set({ checkedIn: true, checkedInAt: now })
				.where(eq(schema.eventMember.id, member.id));

			return {
				status: "ok" as const,
				data: {
					memberId: member.id,
					userId: member.userId,
					user: {
						id: member.user.id,
						name: member.user.name,
						image: member.user.image,
					},
					checkedIn: true,
					checkedInAt: now.toISOString(),
				},
			};
		},
		{
			auth: true,
			body: checkInBody,
			response: {
				200: checkInResponseSchema,
				400: eventErrorResponseSchema,
				403: eventErrorResponseSchema,
				404: eventErrorResponseSchema,
				409: eventErrorResponseSchema,
			},
			detail: {
				tags: ["Events"],
				summary: "Check in a member by ticket token",
				description:
					"Organizer or admin only. Check in an event member using their ticket token. " +
					"Stores the current timestamp. Only one check-in per member is allowed.",
			},
		},
	);

export default eventsModule;
