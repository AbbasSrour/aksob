import { t } from "elysia";
import {
	educationLevelEnum,
	fundingEnum,
	researchTypeEnum,
} from "@/modules/research/constant/research-types.constant";

export const createResearchBody = t.Object({
	title: t.String({ minLength: 1 }),
	content: t.String({ minLength: 1 }),
	researchType: t.Enum(researchTypeEnum),
	institution: t.String({ minLength: 1 }),
	department: t.Optional(t.String()),
	duration: t.Optional(t.String()),
	funding: t.Optional(t.Enum(fundingEnum)),
	location: t.Optional(t.String()),
	startDate: t.Optional(t.String()),
	deadline: t.Optional(t.String()),
	educationLevel: t.Optional(t.Enum(educationLevelEnum)),
	fieldOfStudy: t.Optional(t.String()),
	experienceRequired: t.Optional(t.String()),
	skillsRequired: t.Optional(t.String()),
	additionalRequirements: t.Optional(t.String()),
});
