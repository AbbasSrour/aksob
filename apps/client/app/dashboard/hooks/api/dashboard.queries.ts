import { queryOptions } from "@tanstack/react-query";
import { getDashboardStatsServerFn } from "@/app/dashboard/hooks/api/dashboard.functions";

export const dashboardQueries = {
	entity: queryOptions({
		queryKey: ["dashboard"],
	}),

	stats: () =>
		queryOptions({
			queryKey: [...dashboardQueries.entity.queryKey, "stats"],
			queryFn: () => getDashboardStatsServerFn(),
		}),
};
