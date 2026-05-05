import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { Button } from "@aksob/ui/core/button";
import { IconPlus } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MajorsDataTable } from "@/app/majors/components/list/majors-data-table";
import { MajorsListSkeleton } from "@/app/majors/components/loading/majors-list-skeleton";
import { majorQueries } from "@/app/majors/hooks/api/majors.queries";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/admin/majors/")({
	pendingComponent: MajorsListSkeleton,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(majorQueries.list());
	},
	head: () => ({
		meta: [
			{
				title: m.majors_page_title(),
			},
			{
				name: "description",
				content: m.majors_page_description(),
			},
			{
				property: "og:title",
				content: m.majors_page_title(),
			},
			{
				property: "og:description",
				content: m.majors_page_description(),
			},
		],
	}),
	component: MajorsListPage,
});

function MajorsListPage() {
	return (
		<Main>
			<PageHeader
				title={m.majors_list_title()}
				description={m.majors_list_description()}
			>
				<Link to="/admin/majors/create">
					<Button className="gap-1.5 bg-[#076951] hover:bg-[#16876b]">
						<IconPlus size={16} />
						<span>{m.majors_add_button()}</span>
					</Button>
				</Link>
			</PageHeader>
			<MajorsDataTable />
		</Main>
	);
}
