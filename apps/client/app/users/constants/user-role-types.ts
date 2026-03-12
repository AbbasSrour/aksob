import { IconShield, IconUserShield } from "@tabler/icons-react";
import { m } from "@/paraglide/messages";

export const userRoleTypes = [
	{
		label: m.users_role_admin(),
		value: "admin",
		icon: IconShield,
	},
	{
		label: m.users_role_user(),
		value: "user",
		icon: IconUserShield,
	},
] as const;
