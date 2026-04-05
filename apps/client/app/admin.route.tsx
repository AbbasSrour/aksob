import { PageBreadcrumbs } from "@aksob/ui/components/navigation/page-breadcrumbs";
import { ThemeSwitch } from "@aksob/ui/components/utils/theme-switcher";
import { NavigationProvider } from "@aksob/ui/context/navigation";
import { PermissionProvider } from "@aksob/ui/context/permission";
import { Separator } from "@aksob/ui/core/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@aksob/ui/core/sidebar";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { LogOutIcon, UserRoundIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import { useSignOut } from "@/app/auth/hooks/api/auth.queries";
import { AppSidebar } from "@/components/app-sidebar";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { navigationConfig } from "@/config/navigation";
import { useSession } from "@/lib/auth.ts";
import { authenticated } from "@/middleware/authenticated.ts";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/admin")({
	server: {
		middleware: [authenticated],
	},
	component: AdminRoute,
});

function AdminRoute() {
	const navigate = useNavigate();
	const signOutMutation = useSignOut();
	const { data: sessionData } = useSession();

	const user = sessionData?.user;

	const handleSignOut = async () => {
		try {
			await signOutMutation.mutateAsync();
			toast.success(m.profile_sign_out_success());

			await navigate({
				to: "/auth/login",
				reloadDocument: true,
			});
		} catch (error) {
			toast.error(
				error instanceof Error && error.message
					? error.message
					: m.profile_sign_out_error(),
			);
		}
	};

	return (
		<PermissionProvider permissions={[]} hasPermission={() => true}>
			<NavigationProvider
				projectName={m.app_project_name()}
				main={navigationConfig.admin}
				user={
					user && {
						name: user.name,
						identifier: user.email,
						avatar: user.image,
					}
				}
				userActions={[
					{
						key: "account",
						actions: [
							{
								label: m.profile_title(),
								icon: <UserRoundIcon className="size-4" />,
								onClick: () => {
									void navigate({ to: "/admin/profile" });
								},
							},
						],
					},
					{
						key: "session",
						actions: [
							{
								label: m.profile_sign_out_button(),
								icon: <LogOutIcon className="size-4" />,
								onClick: () => {
									void handleSignOut();
								},
							},
						],
					},
				]}
			>
				<SidebarProvider>
					<AppSidebar />
					<SidebarInset>
						<header className="flex h-16 w-full shrink-0 items-center justify-between px-4">
							<div className="flex items-center gap-2 px-4">
								<SidebarTrigger className="-ml-1" />
								<Separator orientation="vertical" className="mr-2 h-4! w-1" />
								<PageBreadcrumbs />
							</div>
							<div className="flex items-center gap-3">
								<LocaleSwitcher />
								<ThemeSwitch />
							</div>
						</header>
						<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
							<Outlet />
						</div>
					</SidebarInset>
				</SidebarProvider>
			</NavigationProvider>
		</PermissionProvider>
	);
}
