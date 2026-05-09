import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/news")({
	component: NewsLayout,
});

function NewsLayout() {
	return <Outlet />;
}
