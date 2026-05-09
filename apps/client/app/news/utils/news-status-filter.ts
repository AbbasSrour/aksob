import {
	createFilterDefinition,
	type FacetContext,
} from "@aksob/ui/components/data-table/utils/facets";
import type { ColumnFiltersState } from "@tanstack/react-table";
import { newsStatusOptions } from "@/app/news/constants/news-status-options";
import type { NewsArticle } from "@/app/news/hooks/api/news.functions";
import type { ListNewsQueryParams } from "@/app/news/hooks/api/news.queries";

type StatusConditions = Pick<ListNewsQueryParams, "status">;

export const newsStatusFilter = createFilterDefinition({
	id: "status",
	title: "Status",
	options: newsStatusOptions,
	searchParam: "status",
	multi: false,
	getValue: (article: NewsArticle) => article.status,
	toConditions: (columnFilters: ColumnFiltersState): StatusConditions => {
		const statusFilter = columnFilters.find((f) => f.id === "status")
			?.value as string[];
		const status = Array.isArray(statusFilter) ? statusFilter[0] : statusFilter;
		return status ? { status } : {};
	},
	buildFacetQuery: (
		ctx: FacetContext<ListNewsQueryParams, StatusConditions>,
	) => ({
		search: ctx.searchValue,
		pageSize: 1,
		status: ctx.optionValue,
		...ctx.conditions,
	}),
});
