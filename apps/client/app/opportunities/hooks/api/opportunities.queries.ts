import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import type { Opportunity } from "@/app/opportunities/hooks/api/opportunities.functions";
import {
	approveOpportunityServerFn,
	createOpportunityServerFn,
	deleteOpportunityServerFn,
	getOpportunityServerFn,
	listOpportunitiesServerFn,
	rejectOpportunityServerFn,
	updateOpportunityServerFn,
} from "@/app/opportunities/hooks/api/opportunities.functions";
import { mutationKeyFactory } from "@/constants/mutation-key-factory";

export interface ListOpportunitiesQueryParams {
	search?: string;
	page?: number;
	pageSize?: number;
	type?: string;
	status?: string;
}

export const opportunityQueries = {
	entity: queryOptions({
		queryKey: ["opportunities"],
	}),

	single: (id: string) =>
		queryOptions({
			queryKey: [...opportunityQueries.entity.queryKey, "single", id],
			queryFn: async () => {
				return await getOpportunityServerFn({ id });
			},
			enabled: Boolean(id),
		}),

	list: (params?: ListOpportunitiesQueryParams) =>
		queryOptions({
			queryKey: [...opportunityQueries.entity.queryKey, "list", params],
			queryFn: async () => {
				return await listOpportunitiesServerFn({
					search: params?.search,
					page: params?.page,
					limit: params?.pageSize,
					type: params?.type,
					status: params?.status,
				});
			},
			select: (data) => {
				const page = params?.page ?? 1;
				const take = params?.pageSize ?? 10;
				const itemCount = data.meta.total;
				const pageCount = data.meta.totalPages;

				return {
					data: data.data as Opportunity[],
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

export const useApproveOpportunity = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.opportunities.approve(),
		mutationFn: approveOpportunityServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: opportunityQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Approving opportunity...",
			successMessage: "Opportunity approved!",
			errorMessages: {
				default: "Error approving opportunity!",
			},
		},
	});
};

export const useRejectOpportunity = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.opportunities.reject(),
		mutationFn: rejectOpportunityServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: opportunityQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Rejecting opportunity...",
			successMessage: "Opportunity rejected!",
			errorMessages: {
				default: "Error rejecting opportunity!",
			},
		},
	});
};

export const useDeleteOpportunity = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.opportunities.delete(),
		mutationFn: deleteOpportunityServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: opportunityQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Deleting opportunity...",
			successMessage: "Opportunity deleted!",
			errorMessages: {
				default: "Error deleting opportunity!",
			},
		},
	});
};

export const useCreateOpportunity = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.opportunities.create(),
		mutationFn: createOpportunityServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: opportunityQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Creating opportunity...",
			successMessage: "Opportunity created successfully!",
			errorMessages: {
				default: "Error creating opportunity!",
			},
		},
	});
};

export const useUpdateOpportunity = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.opportunities.update(),
		mutationFn: updateOpportunityServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: opportunityQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Updating opportunity...",
			successMessage: "Opportunity updated successfully!",
			errorMessages: {
				default: "Error updating opportunity!",
			},
		},
	});
};
