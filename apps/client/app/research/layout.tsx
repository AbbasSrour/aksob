import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/research")({
	component: ResearchLayout,
});

function ResearchLayout() {
	return <Outlet />;
}
