import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { Button } from "@aksob/ui/core/button";
import { parseSortParamSingle } from "@aksob/ui/hooks/sort";
import { IconPlus } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { StoriesDataTable } from "@/app/stories/components/list/stories-data-table";
import { StoriesListSkeleton } from "@/app/stories/components/list/stories-list-skeleton";
import { storyQueries } from "@/app/stories/hooks/api/stories.queries";
import { storyCategoryFilter } from "@/app/stories/utils/story-category-filter";
import { storyStatusFilter } from "@/app/stories/utils/story-status-filter";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/admin/stories/")({
	pendingComponent: StoriesListSkeleton,
	validateSearch: z.object({
		search: fallback(z.string(), "").default(""),
		page: fallback(z.coerce.number(), 1).default(1),
		pageSize: fallback(z.coerce.number(), 10).default(10),
		sort: z.string().optional(),
		category: z.string().optional(),
		status: z.string().optional(),
	}),
	loaderDeps: ({ search }) => search,
	loader: async ({ context, deps }) => {
		const sortValue = parseSortParamSingle(deps.sort);

		const categoryConditions = storyCategoryFilter.toConditions(
			deps.category
				? [storyCategoryFilter.toColumnFilter([deps.category])]
				: [],
		);
		const statusConditions = storyStatusFilter.toConditions(
			deps.status ? [storyStatusFilter.toColumnFilter([deps.status])] : [],
		);

		const baseListQuery = storyQueries.list({
			...deps,
			...sortValue,
			...categoryConditions,
			...statusConditions,
		});

		const facetQueries = [
			...storyStatusFilter
				.facetQueries({
					searchValue: deps.search,
					otherFilters: categoryConditions,
				})
				.map((query) => storyQueries.list(query)),
			...storyCategoryFilter
				.facetQueries({
					searchValue: deps.search,
					otherFilters: statusConditions,
				})
				.map((query) => storyQueries.list(query)),
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
			{ title: m.stories_page_title() },
			{ name: "description", content: m.stories_page_description() },
			{ property: "og:title", content: m.stories_page_title() },
			{ property: "og:description", content: m.stories_page_description() },
		],
	}),
	component: StoriesListPage,
});

function StoriesListPage() {
	return (
		<Main>
			<PageHeader
				title={m.stories_list_title()}
				description={m.stories_list_description()}
			>
				<Link to="/admin/stories/create">
					<Button className="gap-1.5 bg-[#076951] hover:bg-[#16876b]">
						<IconPlus size={16} />
						<span>{m.stories_form_create_button()}</span>
					</Button>
				</Link>
			</PageHeader>
			<StoriesDataTable />
		</Main>
	);
}
