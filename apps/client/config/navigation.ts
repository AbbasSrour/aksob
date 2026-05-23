import type { NavigationItem } from "@aksob/ui/context/navigation";
import type { PermissionKeys } from "@aksob/ui/types/permission-keys";
import {
	BookOpenIcon,
	BriefcaseBusinessIcon,
	CalendarIcon,
	GraduationCapIcon,
	HeartHandshakeIcon,
	LayoutDashboardIcon,
	MicroscopeIcon,
	NewspaperIcon,
	SparklesIcon,
	UploadIcon,
	UsersIcon,
} from "lucide-react";
import { m } from "@/paraglide/messages";

export const navigationConfig = {
	admin: [
		{
			title: m.nav_dashboard(),
			url: "/admin/dashboard",
			icon: LayoutDashboardIcon,
		},
		{
			title: "Import",
			url: "/admin/import",
			icon: UploadIcon,
		},
		{
			title: m.nav_coordinators(),
			url: "/admin/users",
			icon: UsersIcon,
			permission: "user.view",
		},
		{
			title: m.nav_members(),
			url: "/admin/members",
			icon: SparklesIcon,
			permission: "user.view",
		},
		{
			title: "News",
			url: "/admin/news",
			icon: NewspaperIcon,
			permission: "user.view",
		},
		{
			title: m.nav_stories(),
			url: "/admin/stories",
			icon: BookOpenIcon,
			permission: "user.view",
		},
		{
			title: m.nav_opportunities(),
			url: "/admin/opportunities",
			icon: BriefcaseBusinessIcon,
			permission: "user.view",
		},
		{
			title: m.nav_research(),
			url: "/admin/research",
			icon: MicroscopeIcon,
			permission: "user.view",
		},
		{
			title: m.nav_programs(),
			url: "/admin/programs",
			icon: GraduationCapIcon,
			permission: "user.view",
		},
		{
			title: "Events",
			url: "/admin/events",
			icon: CalendarIcon,
			permission: "user.view",
		},
		{
			title: "Donors",
			url: "/admin/donors",
			icon: HeartHandshakeIcon,
			permission: "user.view",
		},
	],
} satisfies Record<string, NavigationItem<PermissionKeys>[]>;
