import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import type { Donor } from "@/app/donors/hooks/api/donors.functions";
import {
	createDonorServerFn,
	deleteDonorServerFn,
	getDonorServerFn,
	listDonorsServerFn,
	updateDonorServerFn,
} from "@/app/donors/hooks/api/donors.functions";
import { mutationKeyFactory } from "@/constants/mutation-key-factory";

export interface ListDonorsQueryParams {
	page?: number;
	pageSize?: number;
}

export const donorQueries = {
	entity: queryOptions({
		queryKey: ["donors"] as const,
	}),

	single: (id: string) =>
		queryOptions({
			queryKey: [...donorQueries.entity.queryKey, "single", id],
			queryFn: async () => {
				return await getDonorServerFn({ id });
			},
			enabled: Boolean(id),
		}),

	list: (params?: ListDonorsQueryParams) =>
		queryOptions({
			queryKey: [...donorQueries.entity.queryKey, "list", params],
			queryFn: async () => {
				return await listDonorsServerFn({
					page: params?.page,
					limit: params?.pageSize,
				});
			},
			select: (data) => {
				const page = params?.page ?? 1;
				const take = params?.pageSize ?? 10;
				const itemCount = data.meta.total;
				const pageCount = data.meta.totalPages;

				return {
					data: data.data as Donor[],
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

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export const useCreateDonor = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.donors.create(),
		mutationFn: createDonorServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: donorQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Adding donor...",
			successMessage: "Donor added!",
			errorMessages: {
				default: "Error adding donor!",
			},
		},
	});
};

export const useUpdateDonor = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.donors.update(),
		mutationFn: updateDonorServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: donorQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Updating donor...",
			successMessage: "Donor updated!",
			errorMessages: {
				default: "Error updating donor!",
			},
		},
	});
};

export const useDeleteDonor = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.donors.delete(),
		mutationFn: deleteDonorServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: donorQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Deleting donor...",
			successMessage: "Donor deleted!",
			errorMessages: {
				default: "Error deleting donor!",
			},
		},
	});
};
