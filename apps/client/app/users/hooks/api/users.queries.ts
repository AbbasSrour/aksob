import {
	infiniteQueryOptions,
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

export interface ListUsersParams {
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

export const userQueries = {
	entity: queryOptions({
		queryKey: ["users"],
	}),
	single: (userId: string) =>
		queryOptions({
			queryKey: [...userQueries.entity.queryKey, "single", userId],
			queryFn: async () => {
				return await getUserServerFn({
					query: {
						id: userId,
					},
				});
			},
			enabled: Boolean(userId),
		}),
	insights: {
		total: (params?: Pick<ListUsersParams, "search">) =>
			userQueries.list({
				search: params?.search,
				pageSize: 1,
			}),
		active: (params?: Pick<ListUsersParams, "search">) =>
			userQueries.list({
				search: params?.search,
				pageSize: 1,
				banned: false,
				emailVerified: true,
			}),
		admins: (params?: Pick<ListUsersParams, "search">) =>
			userQueries.list({
				search: params?.search,
				pageSize: 1,
				role: "admin",
			}),
		managers: (params?: Pick<ListUsersParams, "search">) =>
			userQueries.list({
				search: params?.search,
				pageSize: 1,
				role: "manager",
			}),
		newUsers: (params?: Pick<ListUsersParams, "search">) =>
			userQueries.list({
				search: params?.search,
				pageSize: 1,
				// TODO: Enable createdAt filtering once available in the API.
				// createdAtFrom: new Date(
				//   new Date().setMonth(new Date().getMonth() - 1),
				// ).toISOString(),
			}),
		all: (params?: Pick<ListUsersParams, "search">) => [
			userQueries.insights.total(params),
			userQueries.insights.active(params),
			userQueries.insights.admins(params),
			userQueries.insights.managers(params),
			userQueries.insights.newUsers(params),
		],
	},
	list: (params?: ListUsersParams) =>
		queryOptions({
			queryKey: [...userQueries.entity.queryKey, "list", params],
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
	infinite: (params?: Omit<ListUsersParams, "page">) =>
		infiniteQueryOptions({
			queryKey: [...userQueries.entity.queryKey, "infinite", params],
			queryFn: async ({ pageParam }) => {
				const page = pageParam as number;
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
					},
				});
			},
			initialPageParam: 1,
			getNextPageParam: (lastPage, allPages) => {
				const take = params?.pageSize ?? 10;
				const totalPages = Math.ceil(lastPage.total / take);
				const nextPage = allPages.length + 1;
				return nextPage <= totalPages ? nextPage : undefined;
			},
			select: (data) => ({
				pages: data.pages.map((page) => ({
					data: page.users,
					meta: {
						itemCount: page.total,
					},
				})),
				pageParams: data.pageParams,
			}),
		}),
};

export const useCreateUser = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.users.create(),
		mutationFn: createUserServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: userQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Creating user...",
			successMessage: "User created successfully!",
			errorMessages: {
				default: "Error creating user!",
			},
		},
	});
};

export const useUpdateUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: mutationKeyFactory.users.update(),
		mutationFn: updateUserServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: userQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Updating user...",
			successMessage: "User updated successfully!",
			errorMessages: {
				default: "Error updating user!",
			},
		},
	});
};

export const useDeleteUser = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.users.delete(),
		mutationFn: deleteUserServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: userQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Deleting user...",
			successMessage: "User deleted successfully!",
			errorMessages: {
				default: "Error deleting user!",
			},
		},
	});
};

export const useSendEmailVerification = () => {
	return useMutation({
		mutationKey: mutationKeyFactory.users.sendVerification(),
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
