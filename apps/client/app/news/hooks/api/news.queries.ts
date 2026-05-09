import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import type { NewsArticle } from "@/app/news/hooks/api/news.functions";
import {
	createNewsCategoryServerFn,
	createNewsServerFn,
	deleteNewsCategoryServerFn,
	deleteNewsServerFn,
	getNewsServerFn,
	listNewsCategoriesServerFn,
	listNewsServerFn,
	publishNewsServerFn,
	unpublishNewsServerFn,
	updateNewsServerFn,
} from "@/app/news/hooks/api/news.functions";
import { mutationKeyFactory } from "@/constants/mutation-key-factory";

export interface ListNewsQueryParams {
	search?: string;
	page?: number;
	pageSize?: number;
	category?: string;
	status?: string;
}

export const newsQueries = {
	entity: queryOptions({
		queryKey: ["news"] as const,
	}),

	single: (id: string) =>
		queryOptions({
			queryKey: [...newsQueries.entity.queryKey, "single", id],
			queryFn: async () => {
				return await getNewsServerFn({ id });
			},
			enabled: Boolean(id),
		}),

	list: (params?: ListNewsQueryParams) =>
		queryOptions({
			queryKey: [...newsQueries.entity.queryKey, "list", params],
			queryFn: async () => {
				return await listNewsServerFn({
					search: params?.search,
					page: params?.page,
					limit: params?.pageSize,
					category: params?.category,
					status: params?.status,
				});
			},
			select: (data) => {
				const page = params?.page ?? 1;
				const take = params?.pageSize ?? 10;
				const itemCount = data.meta.total;
				const pageCount = data.meta.totalPages;

				return {
					data: data.data as NewsArticle[],
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

	categories: () =>
		queryOptions({
			queryKey: [...newsQueries.entity.queryKey, "categories"],
			queryFn: listNewsCategoriesServerFn,
			staleTime: 5 * 60 * 1000,
		}),
};

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export const useCreateNews = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.news.create(),
		mutationFn: createNewsServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: newsQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Creating article...",
			successMessage: "Article created!",
			errorMessages: {
				default: "Error creating article!",
			},
		},
	});
};

export const useUpdateNews = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.news.update(),
		mutationFn: updateNewsServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: newsQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Updating article...",
			successMessage: "Article updated!",
			errorMessages: {
				default: "Error updating article!",
			},
		},
	});
};

export const useDeleteNews = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.news.delete(),
		mutationFn: deleteNewsServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: newsQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Deleting article...",
			successMessage: "Article deleted!",
			errorMessages: {
				default: "Error deleting article!",
			},
		},
	});
};

export const usePublishNews = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.news.publish(),
		mutationFn: publishNewsServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: newsQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Publishing article...",
			successMessage: "Article published!",
			errorMessages: {
				default: "Error publishing article!",
			},
		},
	});
};

export const useUnpublishNews = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.news.unpublish(),
		mutationFn: unpublishNewsServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: newsQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Unpublishing article...",
			successMessage: "Article unpublished!",
			errorMessages: {
				default: "Error unpublishing article!",
			},
		},
	});
};

export const useCreateNewsCategory = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.news.createCategory(),
		mutationFn: createNewsCategoryServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: newsQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Creating category...",
			successMessage: "Category created!",
			errorMessages: {
				default: "Error creating category!",
			},
		},
	});
};

export const useDeleteNewsCategory = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.news.deleteCategory(),
		mutationFn: deleteNewsCategoryServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: newsQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Deleting category...",
			successMessage: "Category deleted!",
			errorMessages: {
				default: "Error deleting category!",
			},
		},
	});
};
