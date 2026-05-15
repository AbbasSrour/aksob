export const eventMemberRoles = ["owner", "organizer", "attendee"] as const;

export type EventMemberRole = (typeof eventMemberRoles)[number];

export const eventMemberRoleEnum = Object.fromEntries(
	eventMemberRoles.map((role) => [role, role]),
) as Record<EventMemberRole, EventMemberRole>;
