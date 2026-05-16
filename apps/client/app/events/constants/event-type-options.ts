import { Globe, MapPin, Monitor } from "lucide-react";

export const eventTypeOptions = [
	{
		label: "In Person",
		value: "in_person",
		icon: MapPin,
		className:
			"bg-purple-100/30 text-purple-900 dark:text-purple-200 border-purple-200",
	},
	{
		label: "Online",
		value: "online",
		icon: Monitor,
		className:
			"bg-indigo-100/30 text-indigo-900 dark:text-indigo-200 border-indigo-200",
	},
	{
		label: "Hybrid",
		value: "hybrid",
		icon: Globe,
		className:
			"bg-cyan-100/30 text-cyan-900 dark:text-cyan-200 border-cyan-200",
	},
] as const;
