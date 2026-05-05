import { m } from "@/paraglide/messages";

export const researchTypeOptions = [
	{ value: "phd_position", label: m.research_type_phd_position() },
	{ value: "postdoc", label: m.research_type_postdoc() },
	{ value: "research_assistant", label: m.research_type_research_assistant() },
	{ value: "visiting_researcher", label: m.research_type_visiting_researcher() },
	{ value: "research_internship", label: m.research_type_research_internship() },
	{ value: "collaboration", label: m.research_type_collaboration() },
	{ value: "fellowship", label: m.research_type_fellowship() },
	{ value: "other", label: m.research_type_other() },
] as const;

export const fundingOptions = [
	{ value: "funded", label: m.research_funding_funded() },
	{ value: "partial", label: m.research_funding_partial() },
	{ value: "unfunded", label: m.research_funding_unfunded() },
	{ value: "negotiable", label: m.research_funding_negotiable() },
] as const;

export const educationLevelOptions = [
	{ value: "undergraduate", label: m.research_education_undergraduate() },
	{ value: "masters", label: m.research_education_masters() },
	{ value: "phd", label: m.research_education_phd() },
	{ value: "postdoc", label: m.research_education_postdoc() },
] as const;
