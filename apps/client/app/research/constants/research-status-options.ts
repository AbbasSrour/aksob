import type { ResearchStatus } from "@/app/research/hooks/api/research.functions";

export const researchStatusOptions: {
	value: ResearchStatus;
	label: string;
}[] = [
	{ value: "pending", label: "Pending" },
	{ value: "approved", label: "Approved" },
	{ value: "rejected", label: "Rejected" },
];
