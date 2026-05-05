export const researchTypes = [
	"phd_position",
	"postdoc",
	"research_assistant",
	"visiting_researcher",
	"research_internship",
	"collaboration",
	"fellowship",
	"other",
] as const;

export type ResearchType = (typeof researchTypes)[number];

export const researchTypeEnum = Object.fromEntries(
	researchTypes.map((t) => [t, t]),
) as Record<ResearchType, ResearchType>;

export const fundingOptions = [
	"funded",
	"partial",
	"unfunded",
	"negotiable",
] as const;

export type FundingOption = (typeof fundingOptions)[number];

export const fundingEnum = Object.fromEntries(
	fundingOptions.map((f) => [f, f]),
) as Record<FundingOption, FundingOption>;

export const educationLevels = [
	"undergraduate",
	"masters",
	"phd",
	"postdoc",
] as const;

export type EducationLevel = (typeof educationLevels)[number];

export const educationLevelEnum = Object.fromEntries(
	educationLevels.map((e) => [e, e]),
) as Record<EducationLevel, EducationLevel>;

export const researchStatuses = ["pending", "approved", "rejected"] as const;

export type ResearchStatus = (typeof researchStatuses)[number];

export const researchStatusEnum = Object.fromEntries(
	researchStatuses.map((s) => [s, s]),
) as Record<ResearchStatus, ResearchStatus>;
