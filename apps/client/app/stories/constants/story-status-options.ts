import { m } from "@/paraglide/messages";

export const storyStatusOptions = [
	{
		label: m.stories_status_pending(),
		value: "pending",
		variant: "secondary" as const,
	},
	{
		label: m.stories_status_approved(),
		value: "approved",
		variant: "default" as const,
	},
	{
		label: m.stories_status_rejected(),
		value: "rejected",
		variant: "destructive" as const,
	},
] as const;
