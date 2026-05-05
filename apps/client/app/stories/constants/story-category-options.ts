import { m } from "@/paraglide/messages";

export const storyCategoryOptions = [
	{
		label: m.stories_category_career_advancement(),
		value: "career_advancement",
	},
	{ label: m.stories_category_entrepreneurship(), value: "entrepreneurship" },
	{
		label: m.stories_category_industry_recognition(),
		value: "industry_recognition",
	},
	{ label: m.stories_category_social_impact(), value: "social_impact" },
	{
		label: m.stories_category_academic_achievement(),
		value: "academic_achievement",
	},
	{ label: m.stories_category_innovation(), value: "innovation" },
	{ label: m.stories_category_leadership(), value: "leadership" },
	{ label: m.stories_category_community_service(), value: "community_service" },
	{ label: m.stories_category_other(), value: "other" },
] as const;
