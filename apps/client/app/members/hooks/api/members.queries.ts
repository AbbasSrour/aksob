import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import {
	createUserServerFn,
	deleteUserServerFn,
	getUserServerFn,
	listUsersServerFn,
	sendVerificationEmailServerFn,
	updateUserServerFn,
} from "@/app/users/hooks/api/users.functions.ts";
import { mutationKeyFactory } from "@/constants/mutation-key-factory";

export interface ListMembersParams {
	search?: string;
	searchField?: "email" | "name";
	page?: number;
	pageSize?: number;
	role?: string;
	banned?: boolean;
	emailVerified?: boolean;
	sort?: string;
	order?: "ASC" | "DESC";
}

export const memberQueries = {
	entity: queryOptions({
		queryKey: ["members"],
	}),
	single: (userId: string) =>
		queryOptions({
			queryKey: [...memberQueries.entity.queryKey, "single", userId],
			queryFn: async () => {
				return await getUserServerFn({
					query: {
						id: userId,
					},
				});
			},
			enabled: Boolean(userId),
		}),
	list: (params?: ListMembersParams) =>
		queryOptions({
			queryKey: [...memberQueries.entity.queryKey, "list", params],
			queryFn: async () => {
				const page = params?.page ?? 1;
				const take = params?.pageSize ?? 10;
				const offset = (page - 1) * take;

				return await listUsersServerFn({
					query: {
						limit: take,
						offset,
						...(params?.search && {
							searchField: (params.searchField ?? "email") as "email" | "name",
							searchValue: params.search,
						}),
						...(params?.role && {
							filterField: "role" as const,
							filterValue: params.role,
						}),
						...(params?.sort && {
							sortBy: params.sort,
							sortDirection: (params.order ?? "ASC").toLowerCase() as
								| "asc"
								| "desc",
						}),
					},
				});
			},
			select: (data) => {
				const page = params?.page ?? 1;
				const take = params?.pageSize ?? 10;
				const itemCount = data.total;
				const pageCount = Math.ceil(itemCount / take);

				return {
					data: data.users,
					meta: {
						page,
						take,
						itemCount,
						pageCount,
						hasPreviousPage: page > 1,
						hasNextPage: page < pageCount,
					},
				};
			},
		}),
};

export const useCreateMember = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.members.create(),
		mutationFn: createUserServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: memberQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Creating member...",
			successMessage: "Member created successfully!",
			errorMessages: {
				default: "Error creating member!",
			},
		},
	});
};

export const useUpdateMember = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: mutationKeyFactory.members.update(),
		mutationFn: updateUserServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: memberQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Updating member...",
			successMessage: "Member updated successfully!",
			errorMessages: {
				default: "Error updating member!",
			},
		},
	});
};

export const useDeleteMember = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.members.delete(),
		mutationFn: deleteUserServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: memberQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Deleting member...",
			successMessage: "Member deleted successfully!",
			errorMessages: {
				default: "Error deleting member!",
			},
		},
	});
};

export const useSendEmailVerification = () => {
	return useMutation({
		mutationKey: mutationKeyFactory.members.sendVerification(),
		mutationFn: sendVerificationEmailServerFn,
		meta: {
			showToast: true,
			loadingMessage: "Sending verification email...",
			successMessage: "Verification email sent successfully!",
			errorMessages: {
				default: "Error sending verification email!",
			},
		},
	});
};
