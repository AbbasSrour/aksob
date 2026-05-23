import { InsightCard } from "@aksob/ui/components/cards/insight-card";
import { useSearch } from "@aksob/ui/hooks/search";
import { IconUsers } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@/app/users/hooks/api/users.queries.ts";
import { m } from "@/paraglide/messages";

interface TotalUsersInsightProps {
	gradientClassName?: string;
	iconClassName?: string;
}

export const TotalUsersInsight = ({
	gradientClassName,
	iconClassName,
}: TotalUsersInsightProps) => {
	const { searchValue } = useSearch();

	const { data: totalData } = useQuery(
		userQueries.insights.total({
			search: searchValue,
		}),
	);

	const { data: activeData } = useQuery(
		userQueries.insights.active({
			search: searchValue,
		}),
	);

	const totalUsers = totalData?.meta.itemCount ?? 0;
	const activeUsers = activeData?.meta.itemCount ?? 0;
	const activeRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

	return (
		<InsightCard
			title={m.users_insights_total_title()}
			value={totalUsers.toLocaleString()}
			subtext={m.users_insights_total_active({ rate: activeRate.toFixed(1) })}
			icon={IconUsers}
			gradientClassName={
				gradientClassName ?? "from-blue-500/20 to-indigo-500/20"
			}
			iconClassName={iconClassName ?? "text-indigo-500"}
		/>
	);
};
