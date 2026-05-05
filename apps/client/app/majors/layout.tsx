import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/majors")({
	component: MajorsLayout,
});

function MajorsLayout() {
	return <Outlet />;
}
