import { IconAward, IconBuilding, IconSchool } from "@tabler/icons-react";
import { m } from "@/paraglide/messages";

export const memberUserTypes = [
	{
		label: m.members_user_type_student(),
		value: "student",
		icon: IconSchool,
	},
	{
		label: m.members_user_type_alumni(),
		value: "alumni",
		icon: IconAward,
	},
	{
		label: m.members_user_type_faculty(),
		value: "faculty",
		icon: IconBuilding,
	},
] as const;
