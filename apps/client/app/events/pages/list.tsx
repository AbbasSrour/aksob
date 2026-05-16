import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { Button } from "@aksob/ui/core/button";
import { parseSortParamSingle } from "@aksob/ui/hooks/sort";
import { IconPlus } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { EventDataTable } from "@/app/events/components/list/events-data-table";
import { EventsListSkeleton } from "@/app/events/components/loading/events-list-skeleton";
import { eventQueries } from "@/app/events/hooks/api/events.queries";
import { eventStatusFilter } from "@/app/events/utils/event-status-filter";

export const Route = createFileRoute("/admin/events/")({
	pendingComponent: EventsListSkeleton,
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

		const statusConditions = eventStatusFilter.toConditions(
			deps.status ? [eventStatusFilter.toColumnFilter([deps.status])] : [],
		);

		const baseListQuery = eventQueries.list({
			...deps,
			...sortValue,
			...statusConditions,
		});

		const facetQueries = [
			...eventStatusFilter
				.facetQueries({
					searchValue: deps.search,
					otherFilters: { search: deps.search },
				})
				.map((query) => eventQueries.list(query)),
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
			{ title: "Events" },
			{ name: "description", content: "Manage events." },
		],
	}),
	component: EventListPage,
});

function EventListPage() {
	return (
		<Main>
			<PageHeader
				title="Events"
				description="Create and manage events for the AKSOB community."
			>
				<Link to="/admin/events/create">
					<Button className="gap-1.5 bg-[#076951] hover:bg-[#16876b]">
						<IconPlus size={16} />
						<span>Create Event</span>
					</Button>
				</Link>
			</PageHeader>
			<EventDataTable />
		</Main>
	);
}
