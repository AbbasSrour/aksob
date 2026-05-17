import {
	generateEventCancelledEmail,
	generateEventReminderEmail,
	generateEventUpdatedEmail,
	generateRegistrationApprovedEmail,
	generateRegistrationConfirmationEmail,
	generateRegistrationPendingEmail,
	generateRegistrationRejectedEmail,
	generateSurveyLinkEmail,
	generateWaitlistPromotionEmail,
} from "@aksob/templates";
import { and, eq, inArray } from "drizzle-orm";
import { Resend } from "resend";
import { env } from "@/config/env";
import { db, schema } from "@/db";

const resendClient = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

// ── Helpers ──────────────────────────────────────

function fireAndForget(promise: Promise<void>): void {
	promise.catch((err) =>
		console.error(
			"Event email send failed:",
			err instanceof Error ? err.message : err,
		),
	);
}

function eventUrl(eventId: string): string {
	return `${env.FRONTEND_URL}/events/${eventId}`;
}

function formatDate(date: Date): string {
	return date.toLocaleDateString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}

// ── Single-recipient queries ─────────────────────

async function getUserByMemberId(memberId: string): Promise<{
	email: string;
	name: string | null;
	ticketToken: string | null;
} | null> {
	const member = await db.query.eventMember.findFirst({
		where: eq(schema.eventMember.id, memberId),
		with: {
			user: { columns: { email: true, name: true } },
		},
		columns: { ticketToken: true },
	});
	if (!member?.user) return null;
	return {
		email: member.user.email,
		name: member.user.name,
		ticketToken: member.ticketToken,
	};
}

async function getApprovedAttendeeEmails(
	eventId: string,
): Promise<Array<{ email: string; name: string | null }>> {
	const members = await db.query.eventMember.findMany({
		where: and(
			eq(schema.eventMember.eventId, eventId),
			eq(schema.eventMember.role, "attendee"),
		),
		with: {
			user: { columns: { email: true, name: true } },
			attendees: { columns: { status: true } },
		},
	});

	return members
		.filter(
			(m) =>
				m.attendees[0] &&
				(m.attendees[0].status === "approved" ||
					m.attendees[0].status === "pending"),
		)
		.map((m) => ({ email: m.user.email, name: m.user.name }));
}

// ── Single-recipient sends ───────────────────────

interface EventInfo {
	id: string;
	title: string;
	startDate: Date;
	location: string | null;
	meetingUrl: string | null;
	meetingPlatform: string | null;
}

export function sendRegistrationConfirmation(
	event: EventInfo,
	userEmail: string,
	userName: string | null,
	ticketToken?: string | null,
): void {
	fireAndForget(
		(async () => {
			const message = await generateRegistrationConfirmationEmail({
				name: userName,
				eventTitle: event.title,
				eventDate: formatDate(event.startDate),
				eventLocation: event.location,
				eventUrl: eventUrl(event.id),
				ticketToken,
			});
			await sendSingle({ to: userEmail, ...message });
		})(),
	);
}

export function sendRegistrationPending(
	event: EventInfo,
	userEmail: string,
	userName: string | null,
): void {
	fireAndForget(
		(async () => {
			const message = await generateRegistrationPendingEmail({
				name: userName,
				eventTitle: event.title,
				eventDate: formatDate(event.startDate),
				eventUrl: eventUrl(event.id),
			});
			await sendSingle({ to: userEmail, ...message });
		})(),
	);
}

export function sendRegistrationApproved(
	event: EventInfo,
	memberId: string,
): void {
	fireAndForget(
		(async () => {
			const recipient = await getUserByMemberId(memberId);
			if (!recipient) return;

			const message = await generateRegistrationApprovedEmail({
				name: recipient.name,
				eventTitle: event.title,
				eventDate: formatDate(event.startDate),
				eventUrl: eventUrl(event.id),
				meetingUrl: event.meetingUrl,
				meetingPlatform: event.meetingPlatform,
				ticketToken: recipient.ticketToken,
			});
			await sendSingle({ to: recipient.email, ...message });
		})(),
	);
}

export function sendRegistrationRejected(
	event: { id: string; title: string },
	memberId: string,
	reason?: string | null,
): void {
	fireAndForget(
		(async () => {
			const recipient = await getUserByMemberId(memberId);
			if (!recipient) return;

			const message = await generateRegistrationRejectedEmail({
				name: recipient.name,
				eventTitle: event.title,
				reason,
			});
			await sendSingle({ to: recipient.email, ...message });
		})(),
	);
}

export function sendWaitlistPromotion(
	event: Pick<EventInfo, "id" | "title" | "startDate">,
	memberId: string,
): void {
	fireAndForget(
		(async () => {
			const recipient = await getUserByMemberId(memberId);
			if (!recipient) return;

			const message = await generateWaitlistPromotionEmail({
				name: recipient.name,
				eventTitle: event.title,
				eventDate: formatDate(event.startDate),
				eventUrl: eventUrl(event.id),
			});
			await sendSingle({ to: recipient.email, ...message });
		})(),
	);
}

// ── Batch sends ──────────────────────────────────

export function sendEventCancelled(
	eventId: string,
	eventTitle: string,
	reason?: string | null,
): void {
	fireAndForget(
		(async () => {
			const recipients = await getApprovedAttendeeEmails(eventId);
			if (recipients.length === 0) return;

			const messages: EmailMessage[] = [];
			for (const r of recipients) {
				const msg = await generateEventCancelledEmail({
					name: r.name,
					eventTitle,
					reason,
				});
				messages.push({ to: r.email, ...msg });
			}

			await sendBatch(messages);
		})(),
	);
}

export function sendEventUpdated(
	eventId: string,
	eventTitle: string,
	changes: string[],
): void {
	fireAndForget(
		(async () => {
			const recipients = await getApprovedAttendeeEmails(eventId);
			if (recipients.length === 0) return;

			const messages: EmailMessage[] = [];
			for (const r of recipients) {
				const msg = await generateEventUpdatedEmail({
					name: r.name,
					eventTitle,
					eventUrl: eventUrl(eventId),
					changes,
				});
				messages.push({ to: r.email, ...msg });
			}

			await sendBatch(messages);
		})(),
	);
}

export function sendEventReminder(
	eventId: string,
	eventTitle: string,
	eventDate: Date,
	eventLocation: string | null,
	reminderLabel: string,
): void {
	fireAndForget(
		(async () => {
			const recipients = await getApprovedAttendeeEmails(eventId);
			if (recipients.length === 0) return;

			const formattedDate = formatDate(eventDate);
			const messages: EmailMessage[] = [];
			for (const r of recipients) {
				const msg = await generateEventReminderEmail({
					name: r.name,
					eventTitle,
					eventDate: formattedDate,
					eventLocation,
					eventUrl: eventUrl(eventId),
					reminderLabel,
				});
				messages.push({ to: r.email, ...msg });
			}

			await sendBatch(messages);
		})(),
	);
}

export async function getSurveyRecipients(
	eventId: string,
	audience: string,
): Promise<Array<{ email: string; name: string | null }>> {
	if (audience === "organizer") {
		const members = await db.query.eventMember.findMany({
			where: and(
				eq(schema.eventMember.eventId, eventId),
				inArray(schema.eventMember.role, ["owner", "organizer"]),
			),
			with: { user: { columns: { email: true, name: true } } },
		});

		return members.map((m) => ({ email: m.user.email, name: m.user.name }));
	}

	// alumni or student — filter attendees by type
	const members = await db.query.eventMember.findMany({
		where: and(
			eq(schema.eventMember.eventId, eventId),
			eq(schema.eventMember.role, "attendee"),
		),
		with: {
			user: { columns: { email: true, name: true, type: true } },
			attendees: { columns: { status: true } },
		},
	});

	return members
		.filter(
			(m) => m.attendees[0]?.status === "approved" && m.user.type === audience,
		)
		.map((m) => ({ email: m.user.email, name: m.user.name }));
}

export function sendSurveyLink(
	eventId: string,
	eventTitle: string,
	surveyUrl: string,
	audience: string,
): void {
	fireAndForget(
		(async () => {
			const recipients = await getSurveyRecipients(eventId, audience);
			if (recipients.length === 0) return;

			const messages: EmailMessage[] = [];
			for (const r of recipients) {
				const msg = await generateSurveyLinkEmail({
					name: r.name,
					eventTitle,
					surveyUrl,
				});
				messages.push({ to: r.email, ...msg });
			}

			await sendBatch(messages);
		})(),
	);
}

// ── Low-level senders ────────────────────────────

interface EmailMessage {
	to: string;
	subject: string;
	html: string;
	text: string;
}

async function sendSingle(msg: EmailMessage): Promise<void> {
	if (!resendClient) {
		console.warn("RESEND_API_KEY not configured. Email would have been sent:", {
			to: msg.to,
			subject: msg.subject,
		});
		return;
	}

	const { error } = await resendClient.emails.send({
		from: env.EMAIL_FROM,
		to: msg.to,
		subject: msg.subject,
		html: msg.html,
		text: msg.text,
	});

	if (error) {
		console.error("Failed to send email:", error.message);
	}
}

async function sendBatch(messages: EmailMessage[]): Promise<void> {
	if (!resendClient) {
		console.warn(
			"RESEND_API_KEY not configured. Batch email would have been sent:",
			{ count: messages.length },
		);
		return;
	}

	// Resend batch supports max 100 per call; chunk if needed
	const chunks = chunkArray(messages, 100);
	for (const chunk of chunks) {
		const { error } = await resendClient.batch.send(
			chunk.map((msg) => ({
				from: env.EMAIL_FROM,
				to: [msg.to],
				subject: msg.subject,
				html: msg.html,
				text: msg.text,
			})),
		);

		if (error) {
			console.error("Failed to send batch email:", error.message);
		}
	}
}

function chunkArray<T>(arr: T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < arr.length; i += size) {
		chunks.push(arr.slice(i, i + size));
	}
	return chunks;
}
