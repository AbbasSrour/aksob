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
import { majorDataTableColumns } from "@/app/majors/components/list/majors-data-table-columns";
import type { Major } from "@/app/majors/hooks/api/majors.functions";
import { majorQueries } from "@/app/majors/hooks/api/majors.queries";
import { majorActiveFilter } from "@/app/majors/utils/major-active-filter";
import { Route } from "@/app/majors/pages/list";

export function MajorsDataTable() {
	const navigate = Route.useNavigate();

	const [rowSelection, setRowSelection] = useState({});
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
		{},
	);

	const { sorting, setSorting } = useSort();
	const { searchValue } = useSearch();
	const { columnFilters, setColumnFilters } = useFilters([
		majorActiveFilter,
	]);
	const { pagination, setPagination } = usePagination({}, [
		searchValue,
		columnFilters,
		sorting,
	]);

	const { data } = useSuspenseQuery({
		...majorQueries.list(),
	});

	const filteredData = (data?.data || []).filter((major: Major) => {
		const activeFilter = columnFilters.find(
			(f) => f.id === majorActiveFilter.id,
		);
		if (!activeFilter) return true;
		const filterValue = activeFilter.value as string[];
		if (!filterValue?.length) return true;

		const status = major.isActive ? "active" : "inactive";
		return filterValue.includes(status);
	});

	const table = useReactTable<Major>({
		data: filteredData,
		columns: majorDataTableColumns,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
			pagination,
		},
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
	});

	return (
		<ListSection>
			<DataTableProvider {...table}>
				<DataTableToolbar placeholder="Search majors...">
					<DataTableToolbarFilters>
						<DataTableFacetedFilter
							title={majorActiveFilter.title}
							columnId={majorActiveFilter.id}
							options={majorActiveFilter.options}
						/>
					</DataTableToolbarFilters>
					<DataTableToolbarActions>
						<DataTableViewOptions />
					</DataTableToolbarActions>
				</DataTableToolbar>
				<DataTable<Major>
					onRowClick={(row) =>
						navigate({
							to: "/admin/majors/$majorId/edit",
							params: {
								majorId: row.original.id,
							},
						})
					}
				/>
				<DataTablePagination />
			</DataTableProvider>
		</ListSection>
	);
}
