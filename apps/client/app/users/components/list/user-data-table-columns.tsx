import { DataTableBadgeCell } from "@aksob/ui/components/data-table/cells/data-table-badge-cell";
import { DataTableIconLabelCell } from "@aksob/ui/components/data-table/cells/data-table-icon-label-cell";
import { DataTablePhoneCell } from "@aksob/ui/components/data-table/cells/data-table-phone-cell";
import { DataTableColumnHeader } from "@aksob/ui/components/data-table/data-table-column-header";
import { DataTableRowActions } from "@aksob/ui/components/data-table/data-table-row-actions";
import { createRowNumberColumn } from "@aksob/ui/components/data-table/utils/row-number-column-helper";
import { Avatar, AvatarFallback, AvatarImage } from "@aksob/ui/core/avatar";
import { IconMail, IconTrash, IconUser } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { userRoleTypes } from "@/app/users/constants/user-role-types.ts";
import { userStatusType } from "@/app/users/constants/user-status-type.ts";
import type { AdminUser } from "@/app/users/hooks/api/users.functions.ts";
import {
	useDeleteUser,
	useSendEmailVerification,
} from "@/app/users/hooks/api/users.queries.ts";
import { userRoleFilter } from "@/app/users/utils/user-role-filter";
import { userStatusFilter } from "@/app/users/utils/user-status-filter";
import { m } from "@/paraglide/messages";

const columnHelper = createColumnHelper<AdminUser>();

const getRoleLabel = (role: string) => {
	switch (role) {
		case "ADMIN":
			return m.users_role_admin();
		case "USER":
			return m.users_role_user();
		default:
			return role;
	}
};

const getStatusLabel = (status: string) => {
	switch (status) {
		case "active":
			return m.users_status_active();
		case "invited":
			return m.users_status_invited();
		case "suspended":
			return m.users_status_suspended();
		default:
			return status;
	}
};

export const userDataTableColumns = [
	// --------------------> Row # Column <------------------- //
	createRowNumberColumn<AdminUser>(),
	// --------------------> Name Column <-------------------- //
	columnHelper.accessor("name", {
		id: "name",
		header: ({ column }) => (
			<DataTableColumnHeader
				title={m.users_table_column_user()}
				column={column}
			/>
		),
		cell: ({ cell }) => (
			<div className="flex items-center gap-3">
				<Avatar className="h-8 w-8">
					<AvatarImage
						src={cell.row.original.image ?? undefined}
						alt={cell.getValue()}
					/>
					<AvatarFallback>
						{cell.getValue().slice(0, 2).toUpperCase()}
					</AvatarFallback>
				</Avatar>
				<div className="flex flex-col">
					<span className="font-medium text-foreground">{cell.getValue()}</span>
					<span className="text-xs text-muted-foreground">
						{cell.row.original.email}
					</span>
				</div>
			</div>
		),
		enableSorting: true,
	}),
	// --------------------> Phone Column <------------------- //
	columnHelper.accessor("phoneNumber", {
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title={m.users_table_column_phone()}
			/>
		),
		cell: ({ cell }) => <DataTablePhoneCell value={cell.getValue()} />,
		enableSorting: true,
		enableHiding: false,
	}),
	// --------------------> Role Column <------------------- //
	columnHelper.accessor("role", {
		id: userRoleFilter.id,
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title={m.users_table_column_role()}
			/>
		),
		cell: ({ row }) => {
			return (
				<DataTableIconLabelCell
					value={row.original.role}
					options={userRoleTypes.map((r) => ({
						...r,
						label: getRoleLabel(r.value),
					}))}
					defaultIcon={IconUser}
				/>
			);
		},
		enableSorting: true,
		enableHiding: false,
	}),
	// --------------------> Status Column <------------------- //
	columnHelper.accessor(userStatusFilter.getValue, {
		id: userStatusFilter.id,
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title={m.users_table_column_status()}
			/>
		),
		cell: ({ cell }) => (
			<DataTableBadgeCell
				value={cell.getValue()}
				options={userStatusType.map((s) => ({
					...s,
					label: getStatusLabel(s.value),
				}))}
			/>
		),
		enableHiding: true,
		enableSorting: false,
		enableColumnFilter: true,
	}),
	// --------------------> Actions Column <-------------------- //
	columnHelper.display({
		id: "actions",
		cell: ({ row }) => {
			const navigate = useNavigate();
			const { mutate: deleteUser } = useDeleteUser();
			const { mutate: sendEmailVerification } = useSendEmailVerification();

			return (
				<DataTableRowActions
					row={row}
					actions={[
						[
							{
								label: m.users_table_action_edit(),
								onClick: () => {
									void navigate({
										to: "/admin/users/$userId/edit",
										params: {
											userId: row.original.id!,
										},
									});
								},
							},
							{
								label: m.users_table_action_send_verification(),
								icon: IconMail,
								onClick: () => {
									sendEmailVerification({ email: row.original.email });
								},
							},
						],
						[
							{
								label: m.users_table_action_delete(),
								icon: IconTrash,
								onClick: () => {
									deleteUser({ userId: row.original.id || "" });
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
