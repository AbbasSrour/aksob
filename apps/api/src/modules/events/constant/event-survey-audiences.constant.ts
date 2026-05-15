export const eventSurveyAudiences = ["alumni", "student", "organizer"] as const;

export type EventSurveyAudience = (typeof eventSurveyAudiences)[number];

export const eventSurveyAudienceEnum = Object.fromEntries(
	eventSurveyAudiences.map((audience) => [audience, audience]),
) as Record<EventSurveyAudience, EventSurveyAudience>;
