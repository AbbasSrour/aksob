import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import type { Program } from "@/app/programs/hooks/api/programs.functions";
import {
	createProgramServerFn,
	getProgramServerFn,
	listProgramsServerFn,
	updateProgramServerFn,
} from "@/app/programs/hooks/api/programs.functions";
import { mutationKeyFactory } from "@/constants/mutation-key-factory";

export const programQueries = {
	entity: queryOptions({
		queryKey: ["programs"],
	}),

	single: (id: string) =>
		queryOptions({
			queryKey: [...programQueries.entity.queryKey, "single", id],
			queryFn: async () => {
				return await getProgramServerFn({ id });
			},
			enabled: Boolean(id),
		}),

	list: () =>
		queryOptions({
			queryKey: [...programQueries.entity.queryKey, "list"],
			queryFn: async () => {
				return await listProgramsServerFn();
			},
			select: (data) => {
				return {
					data: data.data as Program[],
					meta: {
						itemCount: data.data.length,
					},
				};
			},
		}),
};

// ---------------------------------------> Mutations <----------------------------------------------------------//

export const useCreateProgram = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.programs.create(),
		mutationFn: createProgramServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: programQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Creating program...",
			successMessage: "Program created successfully!",
			errorMessages: {
				default: "Error creating program!",
			},
		},
	});
};

export const useUpdateProgram = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.programs.update(),
		mutationFn: updateProgramServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: programQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Updating program...",
			successMessage: "Program updated successfully!",
			errorMessages: {
				default: "Error updating program!",
			},
		},
	});
};
