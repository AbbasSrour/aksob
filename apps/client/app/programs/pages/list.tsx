import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { Button } from "@aksob/ui/core/button";
import { IconPlus } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ProgramsDataTable } from "@/app/programs/components/list/programs-data-table";
import { ProgramsListSkeleton } from "@/app/programs/components/loading/programs-list-skeleton";
import { programQueries } from "@/app/programs/hooks/api/programs.queries";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/admin/programs/")({
	pendingComponent: ProgramsListSkeleton,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(programQueries.list());
	},
	head: () => ({
		meta: [
			{
				title: m.programs_page_title(),
			},
			{
				name: "description",
				content: m.programs_page_description(),
			},
			{
				property: "og:title",
				content: m.programs_page_title(),
			},
			{
				property: "og:description",
				content: m.programs_page_description(),
			},
		],
	}),
	component: ProgramsListPage,
});

function ProgramsListPage() {
	return (
		<Main>
			<PageHeader
				title={m.programs_list_title()}
				description={m.programs_list_description()}
			>
				<Link to="/admin/programs/create">
					<Button className="gap-1.5 bg-[#076951] hover:bg-[#16876b]">
						<IconPlus size={16} />
						<span>{m.programs_add_button()}</span>
					</Button>
				</Link>
			</PageHeader>
			<ProgramsDataTable />
		</Main>
	);
}
