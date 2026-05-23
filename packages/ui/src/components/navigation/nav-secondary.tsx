import { useNavigation } from "@aksob/ui/context/navigation";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@aksob/ui/core/sidebar";
import type * as React from "react";

export function NavSecondary({
	...props
}: React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
	const { secondary } = useNavigation();

	if (!secondary || secondary.length === 0) {
		return null;
	}

	return (
		<SidebarGroup {...props}>
			<SidebarGroupContent>
				<SidebarMenu>
					{secondary.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton asChild size="sm">
								<a href={item.url}>
									<item.icon />
									<span>{item.title}</span>
								</a>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
