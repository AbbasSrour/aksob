import DataTableTextCell from "@aksob/ui/components/data-table/cells/data-table-text-cell";
import { DataTableColumnHeader } from "@aksob/ui/components/data-table/data-table-column-header";
import { DataTableRowActions } from "@aksob/ui/components/data-table/data-table-row-actions";
import { createRowNumberColumn } from "@aksob/ui/components/data-table/utils/row-number-column-helper";
import { Avatar, AvatarFallback, AvatarImage } from "@aksob/ui/core/avatar";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import type { Donor } from "@/app/donors/hooks/api/donors.functions";
import { useDeleteDonor } from "@/app/donors/hooks/api/donors.queries";

const columnHelper = createColumnHelper<Donor>();

function initials(name: string) {
	return (
		name
			.split(" ")
			.map((part) => part[0])
			.filter(Boolean)
			.slice(0, 2)
			.join("")
			.toUpperCase() || "?"
	);
}

function formatAmount(value: number | null): string {
	if (value === null || value === undefined) return "—";
	return value.toLocaleString(undefined, {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 0,
	});
}

export const donorsDataTableColumns = [
	createRowNumberColumn<Donor>(),

	columnHelper.accessor("name", {
		id: "name",
		header: ({ column }) => (
			<DataTableColumnHeader title="Donor" column={column} />
		),
		cell: ({ row }) => {
			const donor = row.original;
			return (
				<div className="flex items-center gap-3 min-w-[220px]">
					<Avatar className="h-9 w-9 shrink-0">
						{donor.image ? (
							<AvatarImage src={donor.image} alt={donor.name} />
						) : null}
						<AvatarFallback className="bg-[#076951]/10 text-xs font-medium text-[#076951]">
							{initials(donor.name)}
						</AvatarFallback>
					</Avatar>
					<div className="min-w-0">
						<DataTableTextCell className="font-medium leading-tight">
							{donor.name}
						</DataTableTextCell>
						{donor.position && (
							<DataTableTextCell className="text-xs text-muted-foreground">
								{donor.position}
							</DataTableTextCell>
						)}
					</div>
				</div>
			);
		},
		enableSorting: false,
	}),

	columnHelper.accessor("company", {
		id: "company",
		header: ({ column }) => (
			<DataTableColumnHeader title="Company" column={column} />
		),
		cell: ({ getValue }) => <DataTableTextCell>{getValue()}</DataTableTextCell>,
		enableSorting: false,
	}),

	columnHelper.accessor("donationAmount", {
		id: "donationAmount",
		header: ({ column }) => (
			<DataTableColumnHeader title="Contribution" column={column} />
		),
		cell: ({ getValue }) => (
			<DataTableTextCell className="tabular-nums">
				{formatAmount(getValue())}
			</DataTableTextCell>
		),
		enableSorting: false,
	}),

	columnHelper.accessor("message", {
		id: "message",
		header: ({ column }) => (
			<DataTableColumnHeader title="Message" column={column} />
		),
		cell: ({ getValue }) => {
			const value = getValue();
			if (!value) return <DataTableTextCell>—</DataTableTextCell>;
			return (
				<DataTableTextCell className="line-clamp-2 max-w-[320px] text-xs text-muted-foreground">
					“{value}”
				</DataTableTextCell>
			);
		},
		enableSorting: false,
	}),

	columnHelper.display({
		id: "actions",
		cell: ({ row }) => {
			const navigate = useNavigate();
			const { mutate: deleteDonor } = useDeleteDonor();
			const donor = row.original;

			return (
				<DataTableRowActions
					row={row}
					actions={[
						[
							{
								label: "Edit",
								icon: IconPencil,
								onClick: () => {
									void navigate({
										to: "/admin/donors/$donorId/edit",
										params: { donorId: donor.id },
									});
								},
							},
							{
								label: "Delete",
								icon: IconTrash,
								onClick: () => deleteDonor({ id: donor.id }),
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
