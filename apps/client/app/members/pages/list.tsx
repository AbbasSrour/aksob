import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { Button } from "@aksob/ui/core/button";
import { parseSortParamSingle } from "@aksob/ui/hooks/sort";
import { IconUserPlus } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { MemberDataTable } from "@/app/members/components/list/member-data-table";
import { MembersListSkeleton } from "@/app/members/components/loading/members-list-skeleton";
import { memberQueries } from "@/app/members/hooks/api/members.queries";
import { memberStatusFilter } from "@/app/members/utils/member-status-filter";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/admin/members/")({
	pendingComponent: MembersListSkeleton,
	validateSearch: z.object({
		search: fallback(z.string(), "").default(""),
		page: fallback(z.coerce.number(), 1).default(1),
		pageSize: fallback(z.coerce.number(), 10).default(10),
		sort: z.string().optional(),
		status: z.array(z.string()).optional(),
	}),
	loaderDeps: ({ search }) => search,
	loader: async ({ context, deps }) => {
		const sortValue = parseSortParamSingle(deps.sort);

		const roleConditions = { role: "user" as const };
		const statusConditions = memberStatusFilter.toConditions(
			deps.status?.length
				? [memberStatusFilter.toColumnFilter(deps.status)]
				: [],
		);

		const baseListQuery = memberQueries.list({
			...deps,
			...sortValue,
			...roleConditions,
			...statusConditions,
		});

		const facetQueries = [
			...memberStatusFilter
				.facetQueries({
					searchValue: deps.search,
					otherFilters: roleConditions,
				})
				.map((query) => memberQueries.list(query)),
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
			{
				title: m.members_page_title(),
			},
			{
				name: "description",
				content: m.members_page_description(),
			},
			{
				property: "og:title",
				content: m.members_page_title(),
			},
			{
				property: "og:description",
				content: m.members_page_description(),
			},
		],
	}),
	component: MemberListPage,
});

function MemberListPage() {
	return (
		<Main>
			<PageHeader
				title={m.members_list_title()}
				description={m.members_list_description()}
			>
				<Link to="/admin/members/create">
					<Button className="space-x-1">
						<span>{m.members_add_button()}</span>
						<IconUserPlus size={18} />
					</Button>
				</Link>
			</PageHeader>
			<MemberDataTable />
		</Main>
	);
}
