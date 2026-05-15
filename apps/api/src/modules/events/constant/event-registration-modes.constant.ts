export const eventRegistrationModes = ["open", "approval"] as const;

export type EventRegistrationMode = (typeof eventRegistrationModes)[number];

export const eventRegistrationModeEnum = Object.fromEntries(
	eventRegistrationModes.map((mode) => [mode, mode]),
) as Record<EventRegistrationMode, EventRegistrationMode>;
