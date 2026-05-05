import { t } from "elysia";
import {
	educationLevelEnum,
	fundingEnum,
	researchTypeEnum,
} from "@/modules/research/constant/research-types.constant";
import { paginatedListResponse } from "@/utils/paginate";

export const researchStatusEnum = t.Enum({
	pending: "pending",
	approved: "approved",
	rejected: "rejected",
} as const);

const researchAuthorSchema = t.Object({
	id: t.String(),
	name: t.String(),
	image: t.Union([t.String(), t.Null()]),
	major: t.Optional(t.Nullable(t.String())),
});

const researchReviewerSchema = t.Object({
	id: t.String(),
	name: t.String(),
});

export const researchResponseSchema = t.Object({
	id: t.String(),
	title: t.String(),
	content: t.String(),
	researchType: t.Enum(researchTypeEnum),
	institution: t.String(),
	department: t.Union([t.String(), t.Null()]),
	duration: t.Union([t.String(), t.Null()]),
	funding: t.Union([t.Enum(fundingEnum), t.Null()]),
	location: t.Union([t.String(), t.Null()]),
	startDate: t.Union([t.String(), t.Null()]),
	deadline: t.Union([t.String(), t.Null()]),
	educationLevel: t.Union([t.Enum(educationLevelEnum), t.Null()]),
	fieldOfStudy: t.Union([t.String(), t.Null()]),
	experienceRequired: t.Union([t.String(), t.Null()]),
	skillsRequired: t.Union([t.String(), t.Null()]),
	additionalRequirements: t.Union([t.String(), t.Null()]),
	status: researchStatusEnum,
	author: researchAuthorSchema,
	reviewedBy: t.Union([researchReviewerSchema, t.Null()]),
	rejectionReason: t.Union([t.String(), t.Null()]),
	reviewedAt: t.Union([t.String(), t.Null()]),
	createdAt: t.String(),
	updatedAt: t.String(),
});

export const researchListResponse = paginatedListResponse(
	researchResponseSchema,
);
