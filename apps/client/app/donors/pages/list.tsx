import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { Button } from "@aksob/ui/core/button";
import { IconPlus } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { DonorsDataTable } from "@/app/donors/components/list/donors-data-table";
import { DonorsListSkeleton } from "@/app/donors/components/loading/donors-list-skeleton";
import { donorQueries } from "@/app/donors/hooks/api/donors.queries";

export const Route = createFileRoute("/admin/donors/")({
	pendingComponent: DonorsListSkeleton,
	validateSearch: z.object({
		page: fallback(z.coerce.number(), 1).default(1),
		pageSize: fallback(z.coerce.number(), 10).default(10),
	}),
	loaderDeps: ({ search }) => search,
	loader: async ({ context, deps }) => {
		await context.queryClient.ensureQueryData(
			donorQueries.list({ page: deps.page, pageSize: deps.pageSize }),
		);
	},
	head: () => ({
		meta: [
			{ title: "Donors" },
			{
				name: "description",
				content: "Manage the Wall of Giving on the public website.",
			},
		],
	}),
	component: DonorsListPage,
});

function DonorsListPage() {
	return (
		<Main>
			<PageHeader
				title="Donors"
				description="Manage the Wall of Giving on the public website."
			>
				<Link to="/admin/donors/create">
					<Button className="gap-1.5 bg-[#076951] hover:bg-[#16876b]">
						<IconPlus size={16} />
						<span>Add Donor</span>
					</Button>
				</Link>
			</PageHeader>
			<DonorsDataTable />
		</Main>
	);
}
