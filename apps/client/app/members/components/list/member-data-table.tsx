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
import { memberDataTableColumns } from "@/app/members/components/list/member-data-table-columns";
import { memberQueries } from "@/app/members/hooks/api/members.queries";
import { useMemberFacetsValue } from "@/app/members/hooks/member-facets-value";
import { Route } from "@/app/members/pages/list";
import type { MemberUser } from "@/app/members/utils/member-form-transformer";
import { memberStatusFilter } from "@/app/members/utils/member-status-filter";

export function MemberDataTable() {
	const navigate = Route.useNavigate();

	const [rowSelection, setRowSelection] = useState({});
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

	const { sorting, setSorting, sortValue } = useSort();
	const { searchValue } = useSearch();
	const { columnFilters, setColumnFilters } = useFilters([memberStatusFilter]);
	const { pagination, setPagination } = usePagination({}, [
		searchValue,
		columnFilters,
		sorting,
	]);

	const statusConditions = memberStatusFilter.toConditions(columnFilters);

	const { data } = useSuspenseQuery({
		...memberQueries.list({
			search: searchValue,
			...pagination,
			...sortValue,
			role: "user",
			...statusConditions,
		}),
	});

	const getServerFacetedUniqueValues = useMemberFacetsValue({
		columnFilters,
	});
	const table = useReactTable<MemberUser>({
		data: (data?.data || []) as Array<MemberUser>,
		columns: memberDataTableColumns,
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
				<DataTableToolbar placeholder="Search members...">
					<DataTableToolbarFilters>
						<DataTableFacetedFilter
							title={memberStatusFilter.title}
							columnId={memberStatusFilter.id}
							options={memberStatusFilter.options}
						/>
					</DataTableToolbarFilters>
					<DataTableToolbarActions>
						<DataTableViewOptions />
					</DataTableToolbarActions>
				</DataTableToolbar>
				<DataTable<MemberUser>
					onRowClick={(row) =>
						navigate({
							to: "/admin/members/$memberId/edit",
							params: {
								memberId: row.original.id!,
							},
						})
					}
				/>
				<DataTablePagination />
			</DataTableProvider>
		</ListSection>
	);
}
