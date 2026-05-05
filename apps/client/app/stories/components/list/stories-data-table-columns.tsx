import { DataTableBadgeCell } from "@aksob/ui/components/data-table/cells/data-table-badge-cell";
import { DataTableIconLabelCell } from "@aksob/ui/components/data-table/cells/data-table-icon-label-cell";
import DataTableTextCell from "@aksob/ui/components/data-table/cells/data-table-text-cell";
import { DataTableColumnHeader } from "@aksob/ui/components/data-table/data-table-column-header";
import { DataTableRowActions } from "@aksob/ui/components/data-table/data-table-row-actions";
import { createRowNumberColumn } from "@aksob/ui/components/data-table/utils/row-number-column-helper";
import { IconCheck, IconPencil, IconTrash, IconUser } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { storyCategoryOptions } from "@/app/stories/constants/story-category-options";
import { storyStatusOptions } from "@/app/stories/constants/story-status-options";
import type { Story } from "@/app/stories/hooks/api/stories.functions";
import {
	useApproveStory,
	useDeleteStory,
} from "@/app/stories/hooks/api/stories.queries";
import { storyCategoryFilter } from "@/app/stories/utils/story-category-filter";
import { storyStatusFilter } from "@/app/stories/utils/story-status-filter";
import { m } from "@/paraglide/messages";

const columnHelper = createColumnHelper<Story>();

export const storiesDataTableColumns = [
	// Row # Column
	createRowNumberColumn<Story>(),

	// Title Column
	columnHelper.accessor("title", {
		id: "title",
		header: ({ column }) => (
			<DataTableColumnHeader
				title={m.stories_table_column_title()}
				column={column}
			/>
		),
		cell: ({ row }) => (
			<div className="flex min-w-[300px] max-w-[500px] flex-col gap-0.5">
				<DataTableTextCell className="whitespace-normal font-medium leading-snug text-foreground">
					{row.original.title}
				</DataTableTextCell>
				{row.original.description && (
					<DataTableTextCell className="line-clamp-2 text-xs text-muted-foreground">
						{row.original.description}
					</DataTableTextCell>
				)}
			</div>
		),
		enableSorting: false,
	}),

	// Author Column
	columnHelper.accessor("author", {
		id: "author",
		header: ({ column }) => (
			<DataTableColumnHeader
				title={m.stories_table_column_author()}
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

	// Category Column
	columnHelper.accessor(storyCategoryFilter.getValue, {
		id: storyCategoryFilter.id,
		header: ({ column }) => (
			<DataTableColumnHeader
				title={m.stories_table_column_category()}
				column={column}
			/>
		),
		cell: ({ cell }) => (
			<DataTableBadgeCell
				value={cell.getValue()}
				options={storyCategoryOptions}
				variant="outline"
			/>
		),
		enableColumnFilter: true,
		enableSorting: false,
	}),

	// Status Column
	columnHelper.accessor(storyStatusFilter.getValue, {
		id: storyStatusFilter.id,
		header: ({ column }) => (
			<DataTableColumnHeader
				title={m.stories_table_column_status()}
				column={column}
			/>
		),
		cell: ({ cell }) => (
			<DataTableBadgeCell
				value={cell.getValue()}
				options={storyStatusOptions}
			/>
		),
		enableColumnFilter: true,
		enableSorting: false,
	}),

	// Date Column
	columnHelper.accessor("storyDate", {
		id: "storyDate",
		header: ({ column }) => (
			<DataTableColumnHeader
				title={m.stories_table_column_date()}
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
			const { mutate: approveStory } = useApproveStory();
			const { mutate: deleteStory } = useDeleteStory();

			const isPending = row.original.status === "pending";
			const isRejected = row.original.status === "rejected";

			const navigate = useNavigate();

			return (
				<DataTableRowActions
					row={row}
					actions={[
						[
							{
								label: m.stories_table_action_edit(),
								icon: IconPencil,
								onClick: () =>
									void navigate({
										to: "/admin/stories/$storyId/edit",
										params: { storyId: row.original.id },
									}),
							},
							...(isPending || isRejected
								? [
										{
											label: m.stories_table_action_approve(),
											icon: IconCheck,
											onClick: () => approveStory({ id: row.original.id }),
										},
									]
								: []),
							{
								label: m.stories_table_action_delete(),
								icon: IconTrash,
								onClick: () => deleteStory({ id: row.original.id }),
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
