import { DataTableBadgeCell } from "@aksob/ui/components/data-table/cells/data-table-badge-cell";
import { DataTableColumnHeader } from "@aksob/ui/components/data-table/data-table-column-header";
import { DataTableRowActions } from "@aksob/ui/components/data-table/data-table-row-actions";
import {
	createRowNumberColumn,
} from "@aksob/ui/components/data-table/utils/row-number-column-helper";
import {
	IconPencil,
	IconToggleLeft,
	IconToggleRight,
} from "@tabler/icons-react";
import { createColumnHelper } from "@tanstack/react-table";
import { useNavigate } from "@tanstack/react-router";
import { m } from "@/paraglide/messages";
import { majorActiveTypes } from "@/app/majors/constants/major-active-types";
import type { Major } from "@/app/majors/hooks/api/majors.functions";
import { useUpdateMajor } from "@/app/majors/hooks/api/majors.queries";
import { majorActiveFilter } from "@/app/majors/utils/major-active-filter";

const columnHelper = createColumnHelper<Major>();

export const majorDataTableColumns = [
	createRowNumberColumn<Major>(),

	columnHelper.accessor("name", {
		id: "name",
		header: ({ column }) => (
			<DataTableColumnHeader
				title={m.majors_table_column_name()}
				column={column}
			/>
		),
		cell: ({ getValue }) => (
			<div className="font-medium">{getValue()}</div>
		),
		enableSorting: true,
	}),

	columnHelper.accessor("credits", {
		id: "credits",
		header: ({ column }) => (
			<DataTableColumnHeader
				title={m.majors_table_column_credits()}
				column={column}
			/>
		),
		cell: ({ getValue }) => {
			const val = getValue();
			return val !== null ? `${val}` : "—";
		},
		enableSorting: true,
	}),

	columnHelper.accessor("duration", {
		id: "duration",
		header: ({ column }) => (
			<DataTableColumnHeader
				title={m.majors_table_column_duration()}
				column={column}
			/>
		),
		cell: ({ getValue }) => {
			const val = getValue();
			return val !== null ? `${val} years` : "—";
		},
		enableSorting: true,
	}),

	columnHelper.accessor(majorActiveFilter.getValue, {
		id: majorActiveFilter.id,
		header: ({ column }) => (
			<DataTableColumnHeader
				title={m.majors_table_column_status()}
				column={column}
			/>
		),
		cell: ({ cell }) => (
			<DataTableBadgeCell
				value={cell.getValue()}
				options={majorActiveTypes}
			/>
		),
		enableSorting: false,
		enableColumnFilter: true,
	}),

	columnHelper.display({
		id: "actions",
		cell: ({ row }) => {
			const navigate = useNavigate();
			const { mutate: updateMajor } = useUpdateMajor();
			const major = row.original;

			return (
				<DataTableRowActions
					row={row}
					actions={[
						[
							{
								label: m.majors_table_action_edit(),
								icon: IconPencil,
								onClick: () => {
									void navigate({
										to: "/admin/majors/$majorId/edit",
										params: { majorId: major.id },
									});
								},
							},
						],
						[
							{
								label: major.isActive
									? m.majors_table_action_deactivate()
									: m.majors_table_action_activate(),
								icon: major.isActive
									? IconToggleRight
									: IconToggleLeft,
								onClick: () => {
									updateMajor({
										id: major.id,
										isActive: !major.isActive,
									});
								},
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
