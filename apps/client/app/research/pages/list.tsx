import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { Button } from "@aksob/ui/core/button";
import { parseSortParamSingle } from "@aksob/ui/hooks/sort";
import { IconPlus } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { ResearchDataTable } from "@/app/research/components/list/research-data-table";
import { ResearchListSkeleton } from "@/app/research/components/loading/research-list-skeleton";
import { researchQueries } from "@/app/research/hooks/api/research.queries";
import { researchStatusFilter } from "@/app/research/utils/research-status-filter";
import { researchTypeFilter } from "@/app/research/utils/research-type-filter";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/admin/research/")({
	pendingComponent: ResearchListSkeleton,
	validateSearch: z.object({
		search: fallback(z.string(), "").default(""),
		page: fallback(z.coerce.number(), 1).default(1),
		pageSize: fallback(z.coerce.number(), 10).default(10),
		sort: z.string().optional(),
		researchType: z.string().optional(),
		status: z.string().optional(),
	}),
	loaderDeps: ({ search }) => search,
	loader: async ({ context, deps }) => {
		const sortValue = parseSortParamSingle(deps.sort);

		const typeConditions = researchTypeFilter.toConditions(
			deps.researchType
				? [researchTypeFilter.toColumnFilter([deps.researchType])]
				: [],
		);
		const statusConditions = researchStatusFilter.toConditions(
			deps.status ? [researchStatusFilter.toColumnFilter([deps.status])] : [],
		);

		const baseListQuery = researchQueries.list({
			...deps,
			...sortValue,
			...typeConditions,
			...statusConditions,
		});

		const facetQueries = [
			...researchStatusFilter
				.facetQueries({
					searchValue: deps.search,
					otherFilters: typeConditions,
				})
				.map((query) => researchQueries.list(query)),
			...researchTypeFilter
				.facetQueries({
					searchValue: deps.search,
					otherFilters: statusConditions,
				})
				.map((query) => researchQueries.list(query)),
		];

		await Promise.all([
			context.queryClient.ensureQueryData(baseListQuery),
			...facetQueries.map((query) =>
				context.queryClient.ensureQueryData(query),
			),
		]);
	},
	head: () => ({
		meta: [
			{ title: m.research_page_title() },
			{ name: "description", content: m.research_page_description() },
			{ property: "og:title", content: m.research_page_title() },
			{
				property: "og:description",
				content: m.research_page_description(),
			},
		],
	}),
	component: ResearchListPage,
});

function ResearchListPage() {
	return (
		<Main>
			<PageHeader
				title={m.research_list_title()}
				description={m.research_list_description()}
			>
				<Link to="/admin/research/create">
					<Button className="gap-1.5 bg-[#076951] hover:bg-[#16876b]">
						<IconPlus size={16} />
						<span>{m.research_form_create_button()}</span>
					</Button>
				</Link>
			</PageHeader>
			<ResearchDataTable />
		</Main>
	);
}
