import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/opportunities")({
	component: OpportunitiesLayout,
});

function OpportunitiesLayout() {
	return <Outlet />;
}
