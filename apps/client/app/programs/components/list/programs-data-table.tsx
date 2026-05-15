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
import { programDataTableColumns } from "@/app/programs/components/list/programs-data-table-columns";
import type { Program } from "@/app/programs/hooks/api/programs.functions";
import { programQueries } from "@/app/programs/hooks/api/programs.queries";
import { programActiveFilter } from "@/app/programs/utils/program-active-filter";
import { Route } from "@/app/programs/pages/list";

export function ProgramsDataTable() {
	const navigate = Route.useNavigate();

	const [rowSelection, setRowSelection] = useState({});
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
		{},
	);

	const { sorting, setSorting } = useSort();
	const { searchValue } = useSearch();
	const { columnFilters, setColumnFilters } = useFilters([
		programActiveFilter,
	]);
	const { pagination, setPagination } = usePagination({}, [
		searchValue,
		columnFilters,
		sorting,
	]);

	const { data } = useSuspenseQuery({
		...programQueries.list(),
	});

	const filteredData = (data?.data || []).filter((program: Program) => {
		const activeFilter = columnFilters.find(
			(f) => f.id === programActiveFilter.id,
		);
		if (!activeFilter) return true;
		const filterValue = activeFilter.value as string[];
		if (!filterValue?.length) return true;

		const status = program.isActive ? "active" : "inactive";
		return filterValue.includes(status);
	});

	const table = useReactTable<Program>({
		data: filteredData,
		columns: programDataTableColumns,
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
				<DataTableToolbar placeholder="Search programs...">
					<DataTableToolbarFilters>
						<DataTableFacetedFilter
							title={programActiveFilter.title}
							columnId={programActiveFilter.id}
							options={programActiveFilter.options}
						/>
					</DataTableToolbarFilters>
					<DataTableToolbarActions>
						<DataTableViewOptions />
					</DataTableToolbarActions>
				</DataTableToolbar>
				<DataTable<Program>
					onRowClick={(row) =>
						navigate({
							to: "/admin/programs/$programId/edit",
							params: {
								programId: row.original.id,
							},
						})
					}
				/>
				<DataTablePagination />
			</DataTableProvider>
		</ListSection>
	);
}
