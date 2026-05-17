import { DataTableBadgeCell } from "@aksob/ui/components/data-table/cells/data-table-badge-cell";
import { DataTableColumnHeader } from "@aksob/ui/components/data-table/data-table-column-header";
import { DataTableRowActions } from "@aksob/ui/components/data-table/data-table-row-actions";
import { createRowNumberColumn } from "@aksob/ui/components/data-table/utils/row-number-column-helper";
import {
	IconPencil,
	IconToggleLeft,
	IconToggleRight,
} from "@tabler/icons-react";
import { createColumnHelper } from "@tanstack/react-table";
import { useNavigate } from "@tanstack/react-router";
import { m } from "@/paraglide/messages";
import { programActiveTypes } from "@/app/programs/constants/program-active-types";
import type { Program } from "@/app/programs/hooks/api/programs.functions";
import { useUpdateProgram } from "@/app/programs/hooks/api/programs.queries";
import { programActiveFilter } from "@/app/programs/utils/program-active-filter";

const columnHelper = createColumnHelper<Program>();

const levelLabels: Record<string, string> = {
	undergraduate: "Undergraduate",
	graduate: "Graduate",
	doctorate: "Doctorate",
	minor: "Minor",
	certificate: "Certificate",
};

export const programDataTableColumns = [
	createRowNumberColumn<Program>(),

	columnHelper.accessor("name", {
		id: "name",
		header: ({ column }) => (
			<DataTableColumnHeader
				title={m.programs_table_column_name()}
				column={column}
			/>
		),
		cell: ({ getValue }) => <div className="font-medium">{getValue()}</div>,
		enableSorting: true,
	}),

	columnHelper.accessor("level", {
		id: "level",
		header: ({ column }) => (
			<DataTableColumnHeader
				title={m.programs_table_column_level()}
				column={column}
			/>
		),
		cell: ({ getValue }) => {
			const val = getValue();
			return val ? (levelLabels[val] ?? val) : "—";
		},
		enableSorting: true,
	}),

	columnHelper.accessor("credits", {
		id: "credits",
		header: ({ column }) => (
			<DataTableColumnHeader
				title={m.programs_table_column_credits()}
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
				title={m.programs_table_column_duration()}
				column={column}
			/>
		),
		cell: ({ getValue }) => {
			const val = getValue();
			return val !== null ? `${val} years` : "—";
		},
		enableSorting: true,
	}),

	columnHelper.accessor(programActiveFilter.getValue, {
		id: programActiveFilter.id,
		header: ({ column }) => (
			<DataTableColumnHeader
				title={m.programs_table_column_status()}
				column={column}
			/>
		),
		cell: ({ cell }) => (
			<DataTableBadgeCell
				value={cell.getValue()}
				options={programActiveTypes}
			/>
		),
		enableSorting: false,
		enableColumnFilter: true,
	}),

	columnHelper.display({
		id: "actions",
		cell: ({ row }) => {
			const navigate = useNavigate();
			const { mutate: updateProgram } = useUpdateProgram();
			const program = row.original;

			return (
				<DataTableRowActions
					row={row}
					actions={[
						[
							{
								label: m.programs_table_action_edit(),
								icon: IconPencil,
								onClick: () => {
									void navigate({
										to: "/admin/programs/$programId/edit",
										params: { programId: program.id },
									});
								},
							},
						],
						[
							{
								label: program.isActive
									? m.programs_table_action_deactivate()
									: m.programs_table_action_activate(),
								icon: program.isActive ? IconToggleRight : IconToggleLeft,
								onClick: () => {
									updateProgram({
										id: program.id,
										isActive: !program.isActive,
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
