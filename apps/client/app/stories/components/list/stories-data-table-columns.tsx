import { DataTableBadgeCell } from "@aksob/ui/components/data-table/cells/data-table-badge-cell";
import { DataTableColumnHeader } from "@aksob/ui/components/data-table/data-table-column-header";
import { DataTableRowActions } from "@aksob/ui/components/data-table/data-table-row-actions";
import { createRowNumberColumn } from "@aksob/ui/components/data-table/utils/row-number-column-helper";
import { Avatar, AvatarFallback, AvatarImage } from "@aksob/ui/core/avatar";
import { IconCheck, IconPencil, IconTrash, IconX } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import type { Story } from "@/app/stories/hooks/api/stories.functions";
import { useApproveStory, useDeleteStory, useRejectStory } from "@/app/stories/hooks/api/stories.queries";
import { storyCategoryOptions } from "@/app/stories/constants/story-category-options";
import { storyStatusOptions } from "@/app/stories/constants/story-status-options";
import { storyCategoryFilter } from "@/app/stories/utils/story-category-filter";
import { storyStatusFilter } from "@/app/stories/utils/story-status-filter";
import { m } from "@/paraglide/messages";

const columnHelper = createColumnHelper<Story>();

export const storiesDataTableColumns = [
	// Row # Column
	createRowNumberColumn<Story>(),

	// Title + Author Column
	columnHelper.accessor("title", {
		id: "title",
		header: ({ column }) => (
			<DataTableColumnHeader title={m.stories_table_column_title()} column={column} />
		),
		cell: ({ row }) => (
			<div className="flex items-center gap-3">
				<Avatar className="h-8 w-8">
					<AvatarImage
						src={row.original.author.image ?? undefined}
						alt={row.original.author.name}
					/>
					<AvatarFallback>
						{row.original.author.name.slice(0, 2).toUpperCase()}
					</AvatarFallback>
				</Avatar>
				<div className="flex flex-col">
					<span className="font-medium text-foreground">{row.original.title}</span>
					<span className="text-xs text-muted-foreground">
						{row.original.author.name}
					</span>
				</div>
			</div>
		),
		enableSorting: false,
	}),

	// Category Column
	columnHelper.accessor(storyCategoryFilter.getValue, {
		id: storyCategoryFilter.id,
		header: ({ column }) => (
			<DataTableColumnHeader title={m.stories_table_column_category()} column={column} />
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
			<DataTableColumnHeader title={m.stories_table_column_status()} column={column} />
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
			<DataTableColumnHeader title={m.stories_table_column_date()} column={column} />
		),
		cell: ({ cell }) => {
			const value = cell.getValue();
			if (!value) return <span className="text-muted-foreground">-</span>;
			return <span>{new Date(value).toLocaleDateString()}</span>;
		},
		enableSorting: false,
		enableHiding: true,
	}),

	// Actions Column
	columnHelper.display({
		id: "actions",
		cell: ({ row }) => {
			const { mutate: approveStory } = useApproveStory();
			const { mutate: rejectStory } = useRejectStory();
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
