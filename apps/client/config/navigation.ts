import type { NavigationItem } from "@aksob/ui/context/navigation";
import type { PermissionKeys } from "@aksob/ui/types/permission-keys";
import { LayoutIcon, UsersIcon } from "lucide-react";

export const navigationConfig = {
	admin: [
		{
			title: "Dashboard",
			url: "/admin/dashboard",
			icon: LayoutIcon,
		},
		{
			title: "User Management",
			url: "/admin/users",
			icon: UsersIcon,
			permission: "user.view",
		},
	],
} satisfies Record<string, NavigationItem<PermissionKeys>[]>;
