import { DataTable } from "@aksob/ui/components/data-table/data-table";
import { DataTableFacetedFilter } from "@aksob/ui/components/data-table/data-table-faceted-filter";
import { DataTablePagination } from "@aksob/ui/components/data-table/data-table-pagination";
import { DataTableProvider } from "@aksob/ui/components/data-table/data-table-provider";
import {
	DataTableToolbar,
	DataTableToolbarActions,
	DataTableToolbarFilters,
} from "@aksob/ui/components/data-table/data-table-toolbar";
import { DataTableViewOptions } from "@aksob/ui/components/data-table/data-table-view-options";
import { ListSection } from "@aksob/ui/components/layout/list-section";
import { usePagination } from "@aksob/ui/hooks/pagination";
import { useSearch } from "@aksob/ui/hooks/search";
import { useSort } from "@aksob/ui/hooks/sort";
import { useFilters } from "@aksob/ui/hooks/use-filters";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { useState } from "react";
import { storiesDataTableColumns } from "@/app/stories/components/list/stories-data-table-columns";
import type { Story } from "@/app/stories/hooks/api/stories.functions";
import { storyQueries } from "@/app/stories/hooks/api/stories.queries";
import { useStoryFacetsValue } from "@/app/stories/hooks/story-facets-value";
import { storyCategoryFilter } from "@/app/stories/utils/story-category-filter";
import { storyStatusFilter } from "@/app/stories/utils/story-status-filter";

export function StoriesDataTable() {
	const [rowSelection, setRowSelection] = useState({});
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

	const { sorting, setSorting, sortValue } = useSort();
	const { searchValue } = useSearch();
	const { columnFilters, setColumnFilters } = useFilters([
		storyCategoryFilter,
		storyStatusFilter,
	]);
	const { pagination, setPagination } = usePagination({}, [
		searchValue,
		columnFilters,
		sorting,
	]);

	const statusConditions = storyStatusFilter.toConditions(columnFilters);
	const categoryConditions = storyCategoryFilter.toConditions(columnFilters);

	const { data } = useSuspenseQuery({
		...storyQueries.list({
			search: searchValue,
			...pagination,
			...sortValue,
			...statusConditions,
			...categoryConditions,
		}),
	});

	const getServerFacetedUniqueValues = useStoryFacetsValue({
		columnFilters,
	});

	const table = useReactTable<Story>({
		data: (data?.data || []) as Array<Story>,
		columns: storiesDataTableColumns,
		pageCount: data?.meta?.pageCount || 0,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
			pagination,
		},
		manualPagination: true,
		manualFiltering: true,
		enableRowSelection: false,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedUniqueValues: getServerFacetedUniqueValues(),
	});

	return (
		<ListSection>
			<DataTableProvider {...table}>
				<DataTableToolbar placeholder="Search stories...">
					<DataTableToolbarFilters>
						<DataTableFacetedFilter
							title={storyStatusFilter.title}
							columnId={storyStatusFilter.id}
							options={storyStatusFilter.options}
						/>
						<DataTableFacetedFilter
							title={storyCategoryFilter.title}
							columnId={storyCategoryFilter.id}
							options={storyCategoryFilter.options}
						/>
					</DataTableToolbarFilters>
					<DataTableToolbarActions>
						<DataTableViewOptions />
					</DataTableToolbarActions>
				</DataTableToolbar>
				<DataTable<Story> />
				<DataTablePagination />
			</DataTableProvider>
		</ListSection>
	);
}
