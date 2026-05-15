import type { schema } from "@/db";

type ResearchAuthor = Pick<
	typeof schema.user.$inferSelect,
	"id" | "name" | "image"
>;

type ResearchReviewer = Pick<typeof schema.user.$inferSelect, "id" | "name">;

type ResearchDtoInput = typeof schema.research.$inferSelect & {
	author: ResearchAuthor | null;
	reviewer?: ResearchReviewer | null;
};

const toIsoString = (date: Date | null) => date?.toISOString() ?? null;

export const toResearchDto = (item: ResearchDtoInput) => {
	if (!item.author) {
		throw new Error(`Research ${item.id} is missing an author`);
	}

	return {
		id: item.id,
		title: item.title,
		content: item.content,
		researchType: item.researchType,
		institution: item.institution,
		department: item.department,
		duration: item.duration,
		funding: item.funding,
		location: item.location,
		startDate: toIsoString(item.startDate),
		deadline: toIsoString(item.deadline),
		educationLevel: item.educationLevel,
		fieldOfStudy: item.fieldOfStudy,
		experienceRequired: item.experienceRequired,
		skillsRequired: item.skillsRequired,
		additionalRequirements: item.additionalRequirements,
		status: item.status,
		author: {
			id: item.author.id,
			name: item.author.name,
			image: item.author.image,
			major: null,
		},
		reviewedBy: item.reviewer
			? {
					id: item.reviewer.id,
					name: item.reviewer.name,
				}
			: null,
		rejectionReason: item.rejectionReason,
		reviewedAt: toIsoString(item.reviewedAt),
		createdAt: item.createdAt.toISOString(),
		updatedAt: item.updatedAt.toISOString(),
	};
};
