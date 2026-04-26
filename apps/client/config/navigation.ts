import type { NavigationItem } from "@aksob/ui/context/navigation";
import type { PermissionKeys } from "@aksob/ui/types/permission-keys";
import { LayoutDashboardIcon, UsersIcon } from "lucide-react";
import { m } from "@/paraglide/messages";

export const navigationConfig = {
	admin: [
		{
			title: m.nav_dashboard(),
			url: "/admin/dashboard",
			icon: LayoutDashboardIcon,
		},
		{
			title: m.nav_coordinators(),
			url: "/admin/users",
			icon: UsersIcon,
			permission: "user.view",
		},
	],
} satisfies Record<string, NavigationItem<PermissionKeys>[]>;
