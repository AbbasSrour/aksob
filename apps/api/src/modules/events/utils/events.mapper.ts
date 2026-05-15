import type { schema } from "@/db";

const toIsoString = (date: Date | null) => date?.toISOString() ?? null;

type EventUserInfo = {
	id: string;
	name: string;
	image: string | null;
};

type EventMemberRow = {
	userId: string;
	role: string;
	user: EventUserInfo;
};

type EventWithMembers = typeof schema.event.$inferSelect & {
	members?: EventMemberRow[];
	surveys?: (typeof schema.eventSurvey.$inferSelect)[];
};

const findOwner = (members?: EventMemberRow[]) =>
	members?.find((m) => m.role === "owner")?.user ?? null;

export const toPublicEventDto = (event: EventWithMembers) => {
	const owner = findOwner(event.members);

	return {
		id: event.id,
		title: event.title,
		description: event.description,
		coverImage: event.coverImage,
		eventType: event.eventType,
		location: event.location,
		startDate: event.startDate.toISOString(),
		endDate: event.endDate.toISOString(),
		registrationDeadline: toIsoString(event.registrationDeadline),
		requiresRegistration: event.requiresRegistration,
		capacity: event.capacity,
		registrationClosed: event.registrationClosed,
		status: event.status,
		checkInEnabled: event.checkInEnabled,
		remindersEnabled: event.remindersEnabled,
		attendeeListVisible: event.attendeeListVisible,
		owner: owner
			? {
					id: owner.id,
					name: owner.name,
					image: owner.image,
				}
			: null,
		createdAt: event.createdAt.toISOString(),
		updatedAt: event.updatedAt.toISOString(),
	};
};

export const toAdminEventDto = (event: EventWithMembers) => ({
	...toPublicEventDto(event),
	meetingPlatform: event.meetingPlatform,
	meetingUrl: event.meetingUrl,
	registrationMode: event.registrationMode,
	registrationClosedAt: toIsoString(event.registrationClosedAt),
	rejectionReason: event.rejectionReason,
	surveys: (event.surveys ?? []).map((s) => ({
		id: s.id,
		eventId: s.eventId,
		audience: s.audience,
		url: s.url,
		sendAt: s.sendAt.toISOString(),
		sentAt: toIsoString(s.sentAt),
		createdAt: s.createdAt.toISOString(),
	})),
});

type AttendeeMemberRow = typeof schema.eventMember.$inferSelect & {
	user: { id: string; name: string; image: string | null };
	attendees: (typeof schema.eventAttendee.$inferSelect)[];
};

export const toAttendeeDto = (member: AttendeeMemberRow) => {
	const attendee = member.attendees[0];
	return {
		memberId: member.id,
		userId: member.userId,
		user: {
			id: member.user.id,
			name: member.user.name,
			image: member.user.image,
		},
		status: attendee?.status ?? "pending",
		showInAttendeeList: attendee?.showInAttendeeList ?? true,
		checkedIn: member.checkedIn,
		checkedInAt: toIsoString(member.checkedInAt),
		createdAt: member.createdAt.toISOString(),
	};
};
