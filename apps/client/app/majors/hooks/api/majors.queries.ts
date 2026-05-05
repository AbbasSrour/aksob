import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import type {
	Major,
} from "@/app/majors/hooks/api/majors.functions";
import {
	createMajorServerFn,
	getMajorServerFn,
	listMajorsServerFn,
	updateMajorServerFn,
} from "@/app/majors/hooks/api/majors.functions";
import { mutationKeyFactory } from "@/constants/mutation-key-factory";

export const majorQueries = {
	entity: queryOptions({
		queryKey: ["majors"],
	}),

	single: (id: string) =>
		queryOptions({
			queryKey: [...majorQueries.entity.queryKey, "single", id],
			queryFn: async () => {
				return await getMajorServerFn({ id });
			},
			enabled: Boolean(id),
		}),

	list: () =>
		queryOptions({
			queryKey: [...majorQueries.entity.queryKey, "list"],
			queryFn: async () => {
				return await listMajorsServerFn();
			},
			select: (data) => {
				return {
					data: data.data as Major[],
					meta: {
						itemCount: data.data.length,
					},
				};
			},
		}),
};

// ---------------------------------------> Mutations <----------------------------------------------------------//

export const useCreateMajor = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.majors.create(),
		mutationFn: createMajorServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: majorQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Creating major...",
			successMessage: "Major created successfully!",
			errorMessages: {
				default: "Error creating major!",
			},
		},
	});
};

export const useUpdateMajor = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.majors.update(),
		mutationFn: updateMajorServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: majorQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Updating major...",
			successMessage: "Major updated successfully!",
			errorMessages: {
				default: "Error updating major!",
			},
		},
	});
};
