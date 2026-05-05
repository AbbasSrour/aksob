import { DataTableBadgeCell } from "@aksob/ui/components/data-table/cells/data-table-badge-cell";
import { DataTableIconLabelCell } from "@aksob/ui/components/data-table/cells/data-table-icon-label-cell";
import DataTableTextCell from "@aksob/ui/components/data-table/cells/data-table-text-cell";
import { DataTableColumnHeader } from "@aksob/ui/components/data-table/data-table-column-header";
import { DataTableRowActions } from "@aksob/ui/components/data-table/data-table-row-actions";
import { createRowNumberColumn } from "@aksob/ui/components/data-table/utils/row-number-column-helper";
import {
	IconBuilding,
	IconCheck,
	IconPencil,
	IconTrash,
} from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { opportunityStatusOptions } from "@/app/opportunities/constants/opportunity-status-options";
import { opportunityTypeOptions } from "@/app/opportunities/constants/opportunity-type-options";
import type { Opportunity } from "@/app/opportunities/hooks/api/opportunities.functions";
import {
	useApproveOpportunity,
	useDeleteOpportunity,
} from "@/app/opportunities/hooks/api/opportunities.queries";
import { opportunityStatusFilter } from "@/app/opportunities/utils/opportunity-status-filter";
import { opportunityTypeFilter } from "@/app/opportunities/utils/opportunity-type-filter";

const columnHelper = createColumnHelper<Opportunity>();

export const opportunitiesDataTableColumns = [
	// Row # Column
	createRowNumberColumn<Opportunity>(),

	// Company Column
	columnHelper.accessor("company", {
		id: "company",
		header: ({ column }) => (
			<DataTableColumnHeader title="Company" column={column} />
		),
		cell: ({ row }) => (
			<div className="flex min-w-[200px] max-w-[350px] flex-col gap-0.5">
				<DataTableTextCell className="whitespace-normal font-medium leading-snug text-foreground">
					{row.original.company}
				</DataTableTextCell>
			</div>
		),
		enableSorting: false,
	}),

	// Type Column
	columnHelper.accessor(opportunityTypeFilter.getValue, {
		id: opportunityTypeFilter.id,
		header: ({ column }) => (
			<DataTableColumnHeader title="Type" column={column} />
		),
		cell: ({ cell }) => (
			<DataTableBadgeCell
				value={cell.getValue()}
				options={opportunityTypeOptions}
				variant="outline"
			/>
		),
		enableColumnFilter: true,
		enableSorting: false,
	}),

	// Author Column
	columnHelper.accessor("author", {
		id: "author",
		header: ({ column }) => (
			<DataTableColumnHeader title="Submitted By" column={column} />
		),
		cell: ({ cell }) => (
			<DataTableIconLabelCell
				value={cell.getValue().name}
				defaultIcon={IconBuilding}
				capitalize={false}
			/>
		),
		enableSorting: false,
	}),

	// Status Column
	columnHelper.accessor(opportunityStatusFilter.getValue, {
		id: opportunityStatusFilter.id,
		header: ({ column }) => (
			<DataTableColumnHeader title="Status" column={column} />
		),
		cell: ({ cell }) => (
			<DataTableBadgeCell
				value={cell.getValue()}
				options={opportunityStatusOptions}
			/>
		),
		enableColumnFilter: true,
		enableSorting: false,
	}),

	// Date Column
	columnHelper.accessor("createdAt", {
		id: "createdAt",
		header: ({ column }) => (
			<DataTableColumnHeader title="Created" column={column} />
		),
		cell: ({ cell }) => {
			const value = cell.getValue();
			if (!value) return <DataTableTextCell>-</DataTableTextCell>;
			return (
				<DataTableTextCell>
					{new Date(value).toLocaleDateString()}
				</DataTableTextCell>
			);
		},
		enableSorting: false,
		enableHiding: true,
	}),

	// Actions Column
	columnHelper.display({
		id: "actions",
		cell: ({ row }) => {
			const { mutate: approveOpportunity } = useApproveOpportunity();
			const { mutate: deleteOpportunity } = useDeleteOpportunity();

			const isPending = row.original.status === "pending";
			const isRejected = row.original.status === "rejected";

			const navigate = useNavigate();

			return (
				<DataTableRowActions
					row={row}
					actions={[
						[
							{
								label: "Edit",
								icon: IconPencil,
								onClick: () =>
									void navigate({
										to: "/admin/opportunities/$opportunityId/edit",
										params: { opportunityId: row.original.id },
									}),
							},
							...(isPending || isRejected
								? [
										{
											label: "Approve",
											icon: IconCheck,
											onClick: () =>
												approveOpportunity({ id: row.original.id }),
										},
									]
								: []),
							{
								label: "Delete",
								icon: IconTrash,
								onClick: () => deleteOpportunity({ id: row.original.id }),
							},
						],
					]}
				/>
			);
		},
		enableSorting: false,
		enableHiding: false,
	}),
];
