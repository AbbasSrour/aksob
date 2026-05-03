import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/stories")({
	component: StoriesLayout,
});

function StoriesLayout() {
	return <Outlet />;
}
