import type { schema } from "@/db";

type OpportunityAuthor = Pick<
	typeof schema.user.$inferSelect,
	"id" | "name" | "image" | "major"
>;

type OpportunityReviewer = Pick<typeof schema.user.$inferSelect, "id" | "name">;

type OpportunityDtoInput = typeof schema.opportunity.$inferSelect & {
	author: OpportunityAuthor | null;
	reviewer?: OpportunityReviewer | null;
};

const toIsoString = (date: Date | null) => date?.toISOString() ?? null;

export const toOpportunityDto = (opportunity: OpportunityDtoInput) => {
	if (!opportunity.author) {
		throw new Error(`Opportunity ${opportunity.id} is missing an author`);
	}

	return {
		id: opportunity.id,
		type: opportunity.type,
		company: opportunity.company,
		contactEmail: opportunity.contactEmail,
		applyUrl: opportunity.applyUrl,
		status: opportunity.status,
		author: {
			id: opportunity.author.id,
			name: opportunity.author.name,
			image: opportunity.author.image,
			major: opportunity.author.major,
		},
		reviewedBy: opportunity.reviewer
			? {
					id: opportunity.reviewer.id,
					name: opportunity.reviewer.name,
				}
			: null,
		reviewNotes: opportunity.reviewNotes,
		reviewedAt: toIsoString(opportunity.reviewedAt),
		createdAt: opportunity.createdAt.toISOString(),
		updatedAt: opportunity.updatedAt.toISOString(),
	};
};
