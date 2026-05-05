export const opportunityTypes = ["job", "internship"] as const;

export type OpportunityType = (typeof opportunityTypes)[number];
