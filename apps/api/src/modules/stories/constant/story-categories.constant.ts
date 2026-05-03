export const storyCategories = [
	"career_advancement",
	"entrepreneurship",
	"industry_recognition",
	"social_impact",
	"academic_achievement",
	"innovation",
	"leadership",
	"community_service",
	"other",
] as const;

export type StoryCategory = (typeof storyCategories)[number];

export const storyCategoryEnum = Object.fromEntries(
	storyCategories.map((c) => [c, c]),
) as Record<StoryCategory, StoryCategory>;
