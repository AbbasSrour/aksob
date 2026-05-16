export const eventStatusOptions = [
	{
		label: "Draft",
		value: "draft",
		className:
			"bg-gray-100/50 text-gray-700 dark:text-gray-300 border-gray-200",
	},
	{
		label: "Pending",
		value: "pending_review",
		className:
			"bg-amber-100/50 text-amber-800 dark:text-amber-200 border-amber-200",
	},
	{
		label: "Approved",
		value: "approved",
		className:
			"bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200",
	},
	{
		label: "In Progress",
		value: "in_progress",
		className:
			"bg-blue-100/30 text-blue-900 dark:text-blue-200 border-blue-200",
	},
	{
		label: "Completed",
		value: "completed",
		className:
			"bg-emerald-100/30 text-emerald-900 dark:text-emerald-200 border-emerald-200",
	},
	{
		label: "Rejected",
		value: "rejected",
		className:
			"bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10",
	},
	{
		label: "Cancelled",
		value: "cancelled",
		className:
			"bg-gray-200/50 text-gray-600 dark:text-gray-400 border-gray-300",
	},
] as const;
