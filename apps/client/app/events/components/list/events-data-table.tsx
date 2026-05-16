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
import { eventDataTableColumns } from "@/app/events/components/list/events-data-table-columns";
import type { EventItem } from "@/app/events/hooks/api/events.functions";
import { eventQueries } from "@/app/events/hooks/api/events.queries";
import { Route } from "@/app/events/pages/list";
import { eventStatusFilter } from "@/app/events/utils/event-status-filter";

export function EventDataTable() {
	const navigate = Route.useNavigate();

	const [rowSelection, setRowSelection] = useState({});
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

	const { sorting, setSorting, sortValue } = useSort();
	const { searchValue } = useSearch();
	const { columnFilters, setColumnFilters } = useFilters([eventStatusFilter]);
	const { pagination, setPagination } = usePagination({}, [
		searchValue,
		columnFilters,
		sorting,
	]);

	const statusConditions = eventStatusFilter.toConditions(columnFilters);

	const { data } = useSuspenseQuery({
		...eventQueries.list({
			search: searchValue,
			...pagination,
			...sortValue,
			...statusConditions,
		}),
	});

	const table = useReactTable<EventItem>({
		data: (data?.data || []) as EventItem[],
		columns: eventDataTableColumns,
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
	});

	return (
		<ListSection>
			<DataTableProvider {...table}>
				<DataTableToolbar placeholder="Search events...">
					<DataTableToolbarFilters>
						<DataTableFacetedFilter
							title={eventStatusFilter.title}
							columnId={eventStatusFilter.id}
							options={eventStatusFilter.options}
						/>
					</DataTableToolbarFilters>
					<DataTableToolbarActions>
						<DataTableViewOptions />
					</DataTableToolbarActions>
				</DataTableToolbar>
				<DataTable<EventItem>
					onRowClick={(row) =>
						navigate({
							to: "/admin/events/$eventId/edit",
							params: { eventId: row.original.id },
						})
					}
				/>
				<DataTablePagination />
			</DataTableProvider>
		</ListSection>
	);
}
