import { DataTableBadgeCell } from "@aksob/ui/components/data-table/cells/data-table-badge-cell";
import { DataTableColumnHeader } from "@aksob/ui/components/data-table/data-table-column-header";
import { DataTableRowActions } from "@aksob/ui/components/data-table/data-table-row-actions";
import { createRowNumberColumn } from "@aksob/ui/components/data-table/utils/row-number-column-helper";
import { Avatar, AvatarFallback, AvatarImage } from "@aksob/ui/core/avatar";
import { IconMail, IconTrash } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { memberUserTypes } from "@/app/members/constants/member-user-types";
import {
	useDeleteMember,
	useSendEmailVerification,
} from "@/app/members/hooks/api/members.queries";
import type { MemberUser } from "@/app/members/utils/member-form-transformer";
import { memberStatusFilter } from "@/app/members/utils/member-status-filter";
import { userStatusType } from "@/app/users/constants/user-status-type";
import { m } from "@/paraglide/messages";

const columnHelper = createColumnHelper<MemberUser>();

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

const getUserTypeLabel = (userType: string) => {
	switch (userType) {
		case "student":
			return m.members_user_type_student();
		case "alumni":
			return m.members_user_type_alumni();
		case "faculty":
			return m.members_user_type_faculty();
		default:
			return userType;
	}
};

export const memberDataTableColumns = [
	// --------------------> Row # Column <------------------- //
	createRowNumberColumn<MemberUser>(),
	// --------------------> Name Column <-------------------- //
	columnHelper.accessor("name", {
		id: "name",
		header: ({ column }) => (
			<DataTableColumnHeader
				title={m.members_table_column_user()}
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
				title={m.members_table_column_phone()}
			/>
		),
		cell: ({ cell }) => cell.getValue() || "—",
		enableSorting: true,
		enableHiding: false,
	}),
	// --------------------> User Type Column <------------------- //
	columnHelper.accessor("userType", {
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title={m.members_table_column_user_type()}
			/>
		),
		cell: ({ cell }) => {
			const value = cell.getValue();
			const option = memberUserTypes.find((t) => t.value === value);
			return (
				<span className="inline-flex items-center gap-1.5">
					{option?.icon && (
						<option.icon className="size-4 text-muted-foreground" />
					)}
					{getUserTypeLabel(value || "")}
				</span>
			);
		},
		enableSorting: true,
		enableHiding: false,
	}),
	// --------------------> Major Column <------------------- //
	columnHelper.accessor("major", {
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title={m.members_table_column_major()}
			/>
		),
		cell: ({ cell }) => cell.getValue() || "—",
		enableSorting: true,
		enableHiding: true,
	}),
	// --------------------> Status Column <------------------- //
	columnHelper.accessor(memberStatusFilter.getValue, {
		id: memberStatusFilter.id,
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title={m.members_table_column_status()}
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
			const { mutate: deleteMember } = useDeleteMember();
			const { mutate: sendEmailVerification } = useSendEmailVerification();

			return (
				<DataTableRowActions
					row={row}
					actions={[
						[
							{
								label: m.members_table_action_edit(),
								onClick: () => {
									void navigate({
										to: "/admin/members/$memberId/edit",
										params: {
											memberId: row.original.id!,
										},
									});
								},
							},
							{
								label: m.members_table_action_send_verification(),
								icon: IconMail,
								onClick: () => {
									sendEmailVerification({
										email: row.original.email,
									});
								},
							},
						],
						[
							{
								label: m.members_table_action_delete(),
								icon: IconTrash,
								onClick: () => {
									deleteMember({
										userId: row.original.id || "",
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
