import { DataTable } from "@aksob/ui/components/data-table/data-table";
import { DataTablePagination } from "@aksob/ui/components/data-table/data-table-pagination";
import { DataTableProvider } from "@aksob/ui/components/data-table/data-table-provider";
import { DataTableViewOptions } from "@aksob/ui/components/data-table/data-table-view-options";
import { ListSection } from "@aksob/ui/components/layout/list-section";
import { usePagination } from "@aksob/ui/hooks/pagination";
import { useSort } from "@aksob/ui/hooks/sort";
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
import { donorsDataTableColumns } from "@/app/donors/components/list/donors-data-table-columns";
import type { Donor } from "@/app/donors/hooks/api/donors.functions";
import { donorQueries } from "@/app/donors/hooks/api/donors.queries";
import { Route } from "@/app/donors/pages/list";

export function DonorsDataTable() {
	const navigate = Route.useNavigate();

	const [rowSelection, setRowSelection] = useState({});
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

	const { sorting, setSorting } = useSort();
	const { pagination, setPagination } = usePagination({}, [sorting]);

	const { data } = useSuspenseQuery({
		...donorQueries.list({
			page: pagination.pageIndex + 1,
			pageSize: pagination.pageSize,
		}),
	});

	const table = useReactTable<Donor>({
		data: data?.data ?? [],
		columns: donorsDataTableColumns,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			pagination,
		},
		pageCount: data?.meta.pageCount ?? 0,
		manualPagination: true,
		enableRowSelection: false,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
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
				<div className="flex items-center justify-end gap-2">
					<DataTableViewOptions />
				</div>
				<DataTable<Donor>
					onRowClick={(row) =>
						navigate({
							to: "/admin/donors/$donorId/edit",
							params: { donorId: row.original.id },
						})
					}
				/>
				<DataTablePagination />
			</DataTableProvider>
		</ListSection>
	);
}
