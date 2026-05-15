import { m } from "@/paraglide/messages";

export const programActiveTypes = [
	{
		label: m.programs_status_active(),
		value: "active",
		className:
			"bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200",
	},
	{
		label: m.programs_status_inactive(),
		value: "inactive",
		className:
			"bg-gray-200/40 text-gray-600 dark:text-gray-400 border-gray-300",
	},
] as const;
