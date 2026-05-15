import { t } from "elysia";
import { eventSurveyAudienceEnum } from "@/modules/events/constant/event-survey-audiences.constant";

export const rejectEventBody = t.Object({
	reason: t.String({ minLength: 1 }),
});

export const addOrganizerBody = t.Object({
	userId: t.String({ minLength: 1 }),
});

export const surveyEntry = t.Object({
	audience: t.Enum(eventSurveyAudienceEnum),
	url: t.String({ format: "uri" }),
	sendAt: t.String({ minLength: 1 }),
});
