import type { NavigationItem } from "@aksob/ui/context/navigation";
import type { PermissionKeys } from "@aksob/ui/types/permission-keys";
import { LayoutIcon, UsersIcon } from "lucide-react";
import { m } from "@/paraglide/messages";

export const navigationConfig = {
	admin: [
		{
			title: m.nav_dashboard(),
			url: "/admin/dashboard",
			icon: LayoutIcon,
		},
		{
			title: m.nav_user_management(),
			url: "/admin/users",
			icon: UsersIcon,
			permission: "user.view",
		},
	],
} satisfies Record<string, NavigationItem<PermissionKeys>[]>;
