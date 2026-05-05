import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { Button } from "@aksob/ui/core/button";
import { parseSortParamSingle } from "@aksob/ui/hooks/sort";
import { IconPlus } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { OpportunitiesDataTable } from "@/app/opportunities/components/list/opportunities-data-table";
import { OpportunitiesListSkeleton } from "@/app/opportunities/components/list/opportunities-list-skeleton";
import { opportunityQueries } from "@/app/opportunities/hooks/api/opportunities.queries";
import { opportunityStatusFilter } from "@/app/opportunities/utils/opportunity-status-filter";
import { opportunityTypeFilter } from "@/app/opportunities/utils/opportunity-type-filter";

export const Route = createFileRoute("/admin/opportunities/")({
	pendingComponent: OpportunitiesListSkeleton,
	validateSearch: z.object({
		search: fallback(z.string(), "").default(""),
		page: fallback(z.coerce.number(), 1).default(1),
		pageSize: fallback(z.coerce.number(), 10).default(10),
		sort: z.string().optional(),
		type: z.string().optional(),
		status: z.string().optional(),
	}),
	loaderDeps: ({ search }) => search,
	loader: async ({ context, deps }) => {
		const sortValue = parseSortParamSingle(deps.sort);

		const typeConditions = opportunityTypeFilter.toConditions(
			deps.type ? [opportunityTypeFilter.toColumnFilter([deps.type])] : [],
		);
		const statusConditions = opportunityStatusFilter.toConditions(
			deps.status
				? [opportunityStatusFilter.toColumnFilter([deps.status])]
				: [],
		);

		const baseListQuery = opportunityQueries.list({
			...deps,
			...sortValue,
			...typeConditions,
			...statusConditions,
		});

		const facetQueries = [
			...opportunityStatusFilter
				.facetQueries({
					searchValue: deps.search,
					otherFilters: typeConditions,
				})
				.map((query) => opportunityQueries.list(query)),
			...opportunityTypeFilter
				.facetQueries({
					searchValue: deps.search,
					otherFilters: statusConditions,
				})
				.map((query) => opportunityQueries.list(query)),
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
			{ title: "Opportunities" },
			{
				name: "description",
				content: "Manage job and internship opportunities",
			},
		],
	}),
	component: OpportunitiesListPage,
});

function OpportunitiesListPage() {
	return (
		<Main>
			<PageHeader
				title="Opportunities"
				description="Manage job and internship opportunities submitted by alumni and faculty."
			>
				<Link to="/admin/opportunities/create">
					<Button className="gap-1.5 bg-[#076951] hover:bg-[#16876b]">
						<IconPlus size={16} />
						<span>Create Opportunity</span>
					</Button>
				</Link>
			</PageHeader>
			<OpportunitiesDataTable />
		</Main>
	);
}
