import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import type { Research } from "@/app/research/hooks/api/research.functions";
import {
	approveResearchServerFn,
	createResearchServerFn,
	deleteResearchServerFn,
	getResearchServerFn,
	listResearchServerFn,
	rejectResearchServerFn,
	updateResearchServerFn,
} from "@/app/research/hooks/api/research.functions";
import { mutationKeyFactory } from "@/constants/mutation-key-factory";

export interface ListResearchQueryParams {
	search?: string;
	page?: number;
	pageSize?: number;
	researchType?: string;
	status?: string;
}

export const researchQueries = {
	entity: queryOptions({
		queryKey: ["research"],
	}),

	single: (id: string) =>
		queryOptions({
			queryKey: [...researchQueries.entity.queryKey, "single", id],
			queryFn: async () => {
				return await getResearchServerFn({ id });
			},
			enabled: Boolean(id),
		}),

	list: (params?: ListResearchQueryParams) =>
		queryOptions({
			queryKey: [...researchQueries.entity.queryKey, "list", params],
			queryFn: async () => {
				return await listResearchServerFn({
					search: params?.search,
					page: params?.page,
					limit: params?.pageSize,
					researchType: params?.researchType,
					status: params?.status,
				});
			},
			select: (data) => {
				const page = params?.page ?? 1;
				const take = params?.pageSize ?? 10;
				const itemCount = data.meta.total;
				const pageCount = data.meta.totalPages;

				return {
					data: data.data as Research[],
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

export const useApproveResearch = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.research.approve(),
		mutationFn: approveResearchServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: researchQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Approving research...",
			successMessage: "Research approved!",
			errorMessages: {
				default: "Error approving research!",
			},
		},
	});
};

export const useRejectResearch = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.research.reject(),
		mutationFn: rejectResearchServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: researchQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Rejecting research...",
			successMessage: "Research rejected!",
			errorMessages: {
				default: "Error rejecting research!",
			},
		},
	});
};

export const useDeleteResearch = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.research.delete(),
		mutationFn: deleteResearchServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: researchQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Deleting research...",
			successMessage: "Research deleted!",
			errorMessages: {
				default: "Error deleting research!",
			},
		},
	});
};

export const useCreateResearch = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.research.create(),
		mutationFn: createResearchServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: researchQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Creating research...",
			successMessage: "Research program created!",
			errorMessages: {
				default: "Error creating research!",
			},
		},
	});
};

export const useUpdateResearch = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.research.update(),
		mutationFn: updateResearchServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: researchQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Updating research...",
			successMessage: "Research updated!",
			errorMessages: {
				default: "Error updating research!",
			},
		},
	});
};
