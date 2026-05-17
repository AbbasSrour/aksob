import { m } from "@/paraglide/messages";

export const userStatusType = [
	{
		label: m.users_status_active(),
		value: "active",
		className:
			"bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200",
	},
	{
		label: m.users_status_invited(),
		value: "invited",
		className: "bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300",
	},
	{
		label: m.users_status_suspended(),
		value: "suspended",
		className:
			"bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10",
	},
] as const;
