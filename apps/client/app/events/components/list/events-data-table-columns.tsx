import { DataTableBadgeCell } from "@aksob/ui/components/data-table/cells/data-table-badge-cell";
import { DataTableColumnHeader } from "@aksob/ui/components/data-table/data-table-column-header";
import { DataTableRowActions } from "@aksob/ui/components/data-table/data-table-row-actions";
import { createRowNumberColumn } from "@aksob/ui/components/data-table/utils/row-number-column-helper";
import { IconCalendar, IconEye, IconTrash } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { eventStatusOptions } from "@/app/events/constants/event-status-options";
import { eventTypeOptions } from "@/app/events/constants/event-type-options";
import type { EventItem } from "@/app/events/hooks/api/events.functions";
import { useDeleteEvent } from "@/app/events/hooks/api/events.queries";
import { eventStatusFilter } from "@/app/events/utils/event-status-filter";

const columnHelper = createColumnHelper<EventItem>();

export const eventDataTableColumns = [
	createRowNumberColumn<EventItem>(),

	columnHelper.accessor("title", {
		id: "title",
		header: ({ column }) => (
			<DataTableColumnHeader title="Title" column={column} />
		),
		cell: ({ cell, row }) => (
			<div className="flex flex-col">
				<span className="font-medium text-foreground">{cell.getValue()}</span>
				<span className="text-xs text-muted-foreground">
					{new Date(row.original.startDate).toLocaleDateString()}
				</span>
			</div>
		),
		enableSorting: true,
	}),

	columnHelper.accessor("eventType", {
		id: "eventType",
		header: ({ column }) => (
			<DataTableColumnHeader title="Type" column={column} />
		),
		cell: ({ cell }) => {
			return (
				<DataTableBadgeCell
					value={cell.getValue()}
					options={eventTypeOptions.map((o) => ({
						label: o.label,
						value: o.value,
						className: o.className,
					}))}
				/>
			);
		},
		enableSorting: true,
	}),

	columnHelper.accessor((row) => new Date(row.startDate), {
		id: "startDate",
		header: ({ column }) => (
			<DataTableColumnHeader title="Date" column={column} />
		),
		cell: ({ row }) => {
			const startDate = new Date(row.original.startDate);
			const dateStr = startDate.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
			});
			return (
				<div className="flex items-center gap-1.5 text-sm">
					<IconCalendar size={14} className="text-muted-foreground shrink-0" />
					<span>{dateStr}</span>
				</div>
			);
		},
		enableSorting: true,
	}),

	columnHelper.accessor(eventStatusFilter.getValue, {
		id: eventStatusFilter.id,
		header: ({ column }) => (
			<DataTableColumnHeader title="Status" column={column} />
		),
		cell: ({ cell }) => (
			<DataTableBadgeCell
				value={cell.getValue()}
				options={eventStatusOptions.map((o) => ({
					label: o.label,
					value: o.value,
					className: o.className,
				}))}
			/>
		),
		enableSorting: true,
		enableColumnFilter: true,
	}),

	columnHelper.accessor("owner.name", {
		id: "owner",
		header: ({ column }) => (
			<DataTableColumnHeader title="Owner" column={column} />
		),
		cell: ({ cell }) => (
			<span className="text-sm text-muted-foreground">
				{cell.getValue() ?? "—"}
			</span>
		),
		enableSorting: false,
	}),

	columnHelper.display({
		id: "actions",
		cell: ({ row }) => {
			const navigate = useNavigate();
			const { mutate: deleteEvent } = useDeleteEvent();

			return (
				<DataTableRowActions
					row={row}
					actions={[
						[
							{
								label: "Manage",
								icon: IconEye,
								onClick: () => {
									void navigate({
										to: "/admin/events/$eventId",
										params: { eventId: row.original.id },
									});
								},
							},
						],
						[
							{
								label: "Delete",
								icon: IconTrash,
								onClick: () => {
									deleteEvent({ id: row.original.id });
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
