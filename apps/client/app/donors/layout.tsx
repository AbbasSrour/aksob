import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/donors")({
	component: DonorsLayout,
});

function DonorsLayout() {
	return <Outlet />;
}
