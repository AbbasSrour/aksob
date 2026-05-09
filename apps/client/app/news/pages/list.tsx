import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { Button } from "@aksob/ui/core/button";
import { parseSortParamSingle } from "@aksob/ui/hooks/sort";
import { IconPlus } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { NewsDataTable } from "@/app/news/components/list/news-data-table";
import { NewsListSkeleton } from "@/app/news/components/list/news-list-skeleton";
import { newsQueries } from "@/app/news/hooks/api/news.queries";
import { newsStatusFilter } from "@/app/news/utils/news-status-filter";

export const Route = createFileRoute("/admin/news/")({
	pendingComponent: NewsListSkeleton,
	validateSearch: z.object({
		search: fallback(z.string(), "").default(""),
		page: fallback(z.coerce.number(), 1).default(1),
		pageSize: fallback(z.coerce.number(), 10).default(10),
		sort: z.string().optional(),
		status: z.string().optional(),
	}),
	loaderDeps: ({ search }) => search,
	loader: async ({ context, deps }) => {
		const sortValue = parseSortParamSingle(deps.sort);

		const statusConditions = newsStatusFilter.toConditions(
			deps.status ? [newsStatusFilter.toColumnFilter([deps.status])] : [],
		);

		const baseListQuery = newsQueries.list({
			...deps,
			...sortValue,
			...statusConditions,
		});

		const facetQueries = [
			...newsStatusFilter
				.facetQueries({
					searchValue: deps.search,
					otherFilters: statusConditions,
				})
				.map((query) => newsQueries.list(query)),
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
			{ title: "News Articles" },
			{ name: "description", content: "Manage news articles." },
		],
	}),
	component: NewsListPage,
});

function NewsListPage() {
	return (
		<Main>
			<PageHeader
				title="News Articles"
				description="Create and manage news articles for the public website."
			>
				<Link to="/admin/news/create">
					<Button className="gap-1.5 bg-[#076951] hover:bg-[#16876b]">
						<IconPlus size={16} />
						<span>Create Article</span>
					</Button>
				</Link>
			</PageHeader>
			<NewsDataTable />
		</Main>
	);
}
