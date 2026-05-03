import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import type { Story } from "@/app/stories/hooks/api/stories.functions";
import {
	approveStoryServerFn,
	createStoryServerFn,
	deleteStoryServerFn,
	getStoryServerFn,
	listStoriesServerFn,
	rejectStoryServerFn,
	updateStoryServerFn,
} from "@/app/stories/hooks/api/stories.functions";
import { mutationKeyFactory } from "@/constants/mutation-key-factory";

export interface ListStoriesQueryParams {
	search?: string;
	page?: number;
	pageSize?: number;
	category?: string;
	status?: string;
}

export const storyQueries = {
	entity: queryOptions({
		queryKey: ["stories"],
	}),

	single: (id: string) =>
		queryOptions({
			queryKey: [...storyQueries.entity.queryKey, "single", id],
			queryFn: async () => {
				return await getStoryServerFn({ id });
			},
			enabled: Boolean(id),
		}),

	list: (params?: ListStoriesQueryParams) =>
		queryOptions({
			queryKey: [...storyQueries.entity.queryKey, "list", params],
			queryFn: async () => {
				return await listStoriesServerFn({
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
					data: data.data as Story[],
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

// ---------------------------------------> Mutations <----------------------------------------------------------//

export const useApproveStory = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.stories.approve(),
		mutationFn: approveStoryServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: storyQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Approving story...",
			successMessage: "Story approved!",
			errorMessages: {
				default: "Error approving story!",
			},
		},
	});
};

export const useRejectStory = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.stories.reject(),
		mutationFn: rejectStoryServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: storyQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Rejecting story...",
			successMessage: "Story rejected!",
			errorMessages: {
				default: "Error rejecting story!",
			},
		},
	});
};

export const useDeleteStory = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.stories.delete(),
		mutationFn: deleteStoryServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: storyQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Deleting story...",
			successMessage: "Story deleted!",
			errorMessages: {
				default: "Error deleting story!",
			},
		},
	});
};

export const useCreateStory = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.stories.create(),
		mutationFn: createStoryServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: storyQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Creating story...",
			successMessage: "Story created successfully!",
			errorMessages: {
				default: "Error creating story!",
			},
		},
	});
};

export const useUpdateStory = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.stories.update(),
		mutationFn: updateStoryServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: storyQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Updating story...",
			successMessage: "Story updated successfully!",
			errorMessages: {
				default: "Error updating story!",
			},
		},
	});
};
