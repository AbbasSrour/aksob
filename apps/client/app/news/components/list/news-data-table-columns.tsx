import { DataTableBadgeCell } from "@aksob/ui/components/data-table/cells/data-table-badge-cell";
import { DataTableIconLabelCell } from "@aksob/ui/components/data-table/cells/data-table-icon-label-cell";
import DataTableTextCell from "@aksob/ui/components/data-table/cells/data-table-text-cell";
import { DataTableColumnHeader } from "@aksob/ui/components/data-table/data-table-column-header";
import { DataTableRowActions } from "@aksob/ui/components/data-table/data-table-row-actions";
import { createRowNumberColumn } from "@aksob/ui/components/data-table/utils/row-number-column-helper";
import {
	IconEye,
	IconEyeOff,
	IconPencil,
	IconTrash,
	IconUser,
} from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { newsStatusOptions } from "@/app/news/constants/news-status-options";
import type { NewsArticle } from "@/app/news/hooks/api/news.functions";
import {
	useDeleteNews,
	usePublishNews,
	useUnpublishNews,
} from "@/app/news/hooks/api/news.queries";
import { newsStatusFilter } from "@/app/news/utils/news-status-filter";

const columnHelper = createColumnHelper<NewsArticle>();

export const newsDataTableColumns = [
	createRowNumberColumn<NewsArticle>(),

	columnHelper.accessor("title", {
		id: "title",
		header: ({ column }) => (
			<DataTableColumnHeader title="Title" column={column} />
		),
		cell: ({ row }) => (
			<div className="flex min-w-[300px] max-w-[500px] flex-col gap-0.5">
				<DataTableTextCell className="whitespace-normal font-medium leading-snug text-foreground">
					{row.original.title}
				</DataTableTextCell>
				{row.original.excerpt && (
					<DataTableTextCell className="line-clamp-2 text-xs text-muted-foreground">
						{row.original.excerpt}
					</DataTableTextCell>
				)}
			</div>
		),
		enableSorting: false,
	}),

	columnHelper.accessor("author", {
		id: "author",
		header: ({ column }) => (
			<DataTableColumnHeader title="Author" column={column} />
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

	columnHelper.accessor("category", {
		id: "category",
		header: ({ column }) => (
			<DataTableColumnHeader title="Category" column={column} />
		),
		cell: ({ cell }) => {
			const category = cell.getValue();
			if (!category) {
				return <DataTableTextCell>—</DataTableTextCell>;
			}
			return (
				<DataTableBadgeCell
					value={category.name}
					options={[{ label: category.name, value: category.name }]}
					variant="outline"
				/>
			);
		},
		enableSorting: false,
	}),

	columnHelper.accessor(newsStatusFilter.getValue, {
		id: newsStatusFilter.id,
		header: ({ column }) => (
			<DataTableColumnHeader title="Status" column={column} />
		),
		cell: ({ cell }) => (
			<DataTableBadgeCell value={cell.getValue()} options={newsStatusOptions} />
		),
		enableColumnFilter: true,
		enableSorting: false,
	}),

	columnHelper.accessor("readTime", {
		id: "readTime",
		header: ({ column }) => (
			<DataTableColumnHeader title="Read Time" column={column} />
		),
		cell: ({ cell }) => {
			const value = cell.getValue();
			if (!value) return <DataTableTextCell>—</DataTableTextCell>;
			return <DataTableTextCell>{value} min</DataTableTextCell>;
		},
		enableSorting: false,
		enableHiding: true,
	}),

	columnHelper.accessor("date", {
		id: "date",
		header: ({ column }) => (
			<DataTableColumnHeader title="Date" column={column} />
		),
		cell: ({ cell }) => {
			const value = cell.getValue();
			if (!value) return <DataTableTextCell>—</DataTableTextCell>;
			return (
				<DataTableTextCell>
					{new Date(value).toLocaleDateString()}
				</DataTableTextCell>
			);
		},
		enableSorting: false,
		enableHiding: true,
	}),

	columnHelper.display({
		id: "actions",
		cell: ({ row }) => {
			const { mutate: publishNews } = usePublishNews();
			const { mutate: unpublishNews } = useUnpublishNews();
			const { mutate: deleteNews } = useDeleteNews();

			const isDraft = row.original.status === "draft";
			const navigate = useNavigate();

			const publishActions = isDraft
				? [
						{
							label: "Publish",
							icon: IconEye,
							onClick: () => publishNews({ id: row.original.id }),
						},
					]
				: [
						{
							label: "Unpublish",
							icon: IconEyeOff,
							onClick: () => unpublishNews({ id: row.original.id }),
						},
					];

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
										to: "/admin/news/$newsId/edit",
										params: { newsId: row.original.id },
									}),
							},
							...publishActions,
							{
								label: "Delete",
								icon: IconTrash,
								onClick: () => deleteNews({ id: row.original.id }),
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
