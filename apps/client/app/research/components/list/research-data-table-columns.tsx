import { DataTableBadgeCell } from "@aksob/ui/components/data-table/cells/data-table-badge-cell";
import { DataTableIconLabelCell } from "@aksob/ui/components/data-table/cells/data-table-icon-label-cell";
import DataTableTextCell from "@aksob/ui/components/data-table/cells/data-table-text-cell";
import { DataTableColumnHeader } from "@aksob/ui/components/data-table/data-table-column-header";
import { DataTableRowActions } from "@aksob/ui/components/data-table/data-table-row-actions";
import { createRowNumberColumn } from "@aksob/ui/components/data-table/utils/row-number-column-helper";
import {
	IconCheck,
	IconPencil,
	IconTrash,
	IconUser,
	IconX,
} from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { researchTypeOptions } from "@/app/research/constants/research-type-options";
import { researchStatusOptions } from "@/app/research/constants/research-status-options";
import type { Research } from "@/app/research/hooks/api/research.functions";
import {
	useApproveResearch,
	useDeleteResearch,
	useRejectResearch,
} from "@/app/research/hooks/api/research.queries";
import { researchTypeFilter } from "@/app/research/utils/research-type-filter";
import { researchStatusFilter } from "@/app/research/utils/research-status-filter";
import { m } from "@/paraglide/messages";

const columnHelper = createColumnHelper<Research>();

export const researchDataTableColumns = [
	createRowNumberColumn<Research>(),

	// Title Column
	columnHelper.accessor("title", {
		id: "title",
		header: ({ column }) => (
			<DataTableColumnHeader
				title={m.research_table_column_title()}
				column={column}
			/>
		),
		cell: ({ row }) => (
			<div className="flex min-w-[300px] max-w-[500px] flex-col gap-0.5">
				<DataTableTextCell className="whitespace-normal font-medium leading-snug text-foreground">
					{row.original.title}
				</DataTableTextCell>
				<DataTableTextCell className="line-clamp-1 text-xs text-muted-foreground">
					{row.original.institution}
				</DataTableTextCell>
			</div>
		),
		enableSorting: false,
	}),

	// Author Column
	columnHelper.accessor("author", {
		id: "author",
		header: ({ column }) => (
			<DataTableColumnHeader
				title={m.research_table_column_author()}
				column={column}
			/>
		),
		cell: ({ cell }) => (
			<DataTableIconLabelCell
				value={cell.getValue().name}
				defaultIcon={IconUser}
				capitalize={false}
			/>
		),
		enableSorting: false,
	}),

	// Research Type Column
	columnHelper.accessor(researchTypeFilter.getValue, {
		id: researchTypeFilter.id,
		header: ({ column }) => (
			<DataTableColumnHeader
				title={m.research_table_column_type()}
				column={column}
			/>
		),
		cell: ({ cell }) => (
			<DataTableBadgeCell
				value={cell.getValue()}
				options={researchTypeOptions}
				variant="outline"
			/>
		),
		enableColumnFilter: true,
		enableSorting: false,
	}),

	// Status Column
	columnHelper.accessor(researchStatusFilter.getValue, {
		id: researchStatusFilter.id,
		header: ({ column }) => (
			<DataTableColumnHeader
				title={m.research_table_column_status()}
				column={column}
			/>
		),
		cell: ({ cell }) => (
			<DataTableBadgeCell
				value={cell.getValue()}
				options={researchStatusOptions}
			/>
		),
		enableColumnFilter: true,
		enableSorting: false,
	}),

	// Deadline Column
	columnHelper.accessor("deadline", {
		id: "deadline",
		header: ({ column }) => (
			<DataTableColumnHeader
				title={m.research_table_column_deadline()}
				column={column}
			/>
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
			const { mutate: approveResearch } = useApproveResearch();
			const { mutate: rejectResearch } = useRejectResearch();
			const { mutate: deleteResearch } = useDeleteResearch();

			const isPending = row.original.status === "pending";
			const isRejected = row.original.status === "rejected";

			const navigate = useNavigate();
			const rejectWithReason = () => {
				const reason = window.prompt(m.research_reject_reason_prompt());
				const trimmedReason = reason?.trim();

				if (!trimmedReason) return;

				rejectResearch({
					id: row.original.id,
					reason: trimmedReason,
				});
			};

			return (
				<DataTableRowActions
					row={row}
					actions={[
						[
							{
								label: m.research_table_action_edit(),
								icon: IconPencil,
								onClick: () =>
									void navigate({
										to: "/admin/research/$researchId/edit",
										params: {
											researchId: row.original.id,
										},
									}),
							},
							...(isPending || isRejected
								? [
										{
											label: m.research_table_action_approve(),
											icon: IconCheck,
											onClick: () =>
												approveResearch({
													id: row.original.id,
												}),
										},
									]
								: []),
							...(row.original.status !== "rejected"
								? [
										{
											label: m.research_table_action_reject(),
											icon: IconX,
											onClick: rejectWithReason,
										},
									]
								: []),
							{
								label: m.research_table_action_delete(),
								icon: IconTrash,
								onClick: () =>
									deleteResearch({
										id: row.original.id,
									}),
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
