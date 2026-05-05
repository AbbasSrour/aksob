import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { Button } from "@aksob/ui/core/button";
import { parseSortParamSingle } from "@aksob/ui/hooks/sort";
import { IconUserPlus } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
// import { UserInsights } from "@/app/users/components/insights/user-insights";
import { UserDataTable } from "@/app/users/components/list/user-data-table";
import { UsersListSkeleton } from "@/app/users/components/loading/users-list-skeleton";
import { userQueries } from "@/app/users/hooks/api/users.queries.ts";
import { m } from "@/paraglide/messages";
// import { userRoleFilter } from "@/app/users/utils/user-role-filter";
import { userStatusFilter } from "@/app/users/utils/user-status-filter";

export const Route = createFileRoute("/admin/users/")({
	pendingComponent: UsersListSkeleton,
	validateSearch: z.object({
		search: fallback(z.string(), "").default(""),
		page: fallback(z.coerce.number(), 1).default(1),
		pageSize: fallback(z.coerce.number(), 10).default(10),
		sort: z.string().optional(),
		// role: z.string().optional(),
		status: z.array(z.string()).optional(),
	}),
	loaderDeps: ({ search }) => search,
	loader: async ({ context, deps }) => {
		const sortValue = parseSortParamSingle(deps.sort);

		// const roleConditions = userRoleFilter.toConditions(
		// 	deps.role ? [userRoleFilter.toColumnFilter([deps.role])] : [],
		// );
		const roleConditions = { role: "admin" as const };
		const statusConditions = userStatusFilter.toConditions(
			deps.status?.length ? [userStatusFilter.toColumnFilter(deps.status)] : [],
		);

		const baseListQuery = userQueries.list({
			...deps,
			...sortValue,
			...roleConditions,
			...statusConditions,
		});

		const insightQueries = userQueries.insights.all({
			search: deps.search,
		});

		const facetQueries = [
			...userStatusFilter
				.facetQueries({
					searchValue: deps.search,
					otherFilters: roleConditions,
				})
				.map((query) => userQueries.list(query)),
			// ...userRoleFilter
			// 	.facetQueries({
			// 		searchValue: deps.search,
			// 		otherFilters: statusConditions,
			// 	})
			// 	.map((query) => userQueries.list(query)),
		];

		await Promise.all([
			context.queryClient.ensureQueryData(baseListQuery),
			...insightQueries.map((query) =>
				context.queryClient.ensureQueryData(query),
			),
			...facetQueries.map((query) =>
				context.queryClient.ensureQueryData(query),
			),
		]);
	},
	head: () => ({
		meta: [
			{
				title: m.users_page_title(),
			},
			{
				name: "description",
				content: m.users_page_description(),
			},
			{
				property: "og:title",
				content: m.users_page_title(),
			},
			{
				property: "og:description",
				content: m.users_page_description(),
			},
		],
	}),
	component: UserListPage,
});

function UserListPage() {
	return (
		<Main>
			<PageHeader
				title={m.users_list_title()}
				description={m.users_list_description()}
			>
				<Link to="/admin/users/create">
					<Button className="space-x-1">
						<span>{m.users_add_button()}</span>
						<IconUserPlus size={18} />
					</Button>
				</Link>
			</PageHeader>
			{/* <UserInsights /> */}
			<UserDataTable />
		</Main>
	);
}