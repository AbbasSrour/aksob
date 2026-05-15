import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/programs")({
	component: ProgramsLayout,
});

function ProgramsLayout() {
	return <Outlet />;
}
