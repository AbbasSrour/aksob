import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import type { EventItem } from "@/app/events/hooks/api/events.functions";
import {
	approveEventServerFn,
	cancelEventServerFn,
	closeRegistrationServerFn,
	createEventServerFn,
	deleteEventServerFn,
	getEventServerFn,
	listAttendeesServerFn,
	listEventsServerFn,
	rejectEventServerFn,
	submitEventServerFn,
	updateAttendeeServerFn,
	updateEventServerFn,
} from "@/app/events/hooks/api/events.functions";
import type { ListAttendeesParams } from "@/app/events/hooks/api/events.functions";
import { mutationKeyFactory } from "@/constants/mutation-key-factory";

export interface ListEventsQueryParams {
	search?: string;
	page?: number;
	pageSize?: number;
	status?: string;
	filter?: string;
}

export const eventQueries = {
	entity: queryOptions({
		queryKey: ["events"] as const,
	}),

	single: (id: string) =>
		queryOptions({
			queryKey: [...eventQueries.entity.queryKey, "single", id],
			queryFn: async () => {
				return await getEventServerFn({ id });
			},
			enabled: Boolean(id),
		}),

	list: (params?: ListEventsQueryParams) =>
		queryOptions({
			queryKey: [...eventQueries.entity.queryKey, "list", params],
			queryFn: async () => {
				return await listEventsServerFn({
					search: params?.search,
					page: params?.page,
					limit: params?.pageSize,
					status: params?.status,
					filter: params?.filter,
				});
			},
			select: (data) => {
				const page = params?.page ?? 1;
				const take = params?.pageSize ?? 10;
				const itemCount = data.meta.total;
				const pageCount = data.meta.totalPages;

				return {
					data: data.data as EventItem[],
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

export const useCreateEvent = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.events.create(),
		mutationFn: createEventServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: eventQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Creating event...",
			successMessage: "Event created!",
			errorMessages: {
				default: "Error creating event!",
			},
		},
	});
};

export const useUpdateEvent = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.events.update(),
		mutationFn: updateEventServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: eventQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Updating event...",
			successMessage: "Event updated!",
			errorMessages: {
				default: "Error updating event!",
			},
		},
	});
};

export const useDeleteEvent = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.events.delete(),
		mutationFn: deleteEventServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: eventQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Deleting event...",
			successMessage: "Event deleted!",
			errorMessages: {
				default: "Error deleting event!",
			},
		},
	});
};

// ---------------------------------------------------------------------------
// Attendee Queries
// ---------------------------------------------------------------------------

export const eventAttendeeQueries = {
	list: (params: ListAttendeesParams) =>
		queryOptions({
			queryKey: [
				...eventQueries.entity.queryKey,
				"attendees",
				params.eventId,
				params,
			],
			queryFn: async () => {
				return await listAttendeesServerFn(params);
			},
		}),
};

// ---------------------------------------------------------------------------
// Action Mutations
// ---------------------------------------------------------------------------

export const useSubmitEvent = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.events.submit(),
		mutationFn: submitEventServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: eventQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Submitting event...",
			successMessage: "Event submitted for review!",
			errorMessages: { default: "Error submitting event!" },
		},
	});
};

export const useApproveEvent = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.events.approve(),
		mutationFn: approveEventServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: eventQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Approving event...",
			successMessage: "Event approved!",
			errorMessages: { default: "Error approving event!" },
		},
	});
};

export const useRejectEvent = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.events.reject(),
		mutationFn: rejectEventServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: eventQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Rejecting event...",
			successMessage: "Event rejected.",
			errorMessages: { default: "Error rejecting event!" },
		},
	});
};

export const useCancelEvent = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.events.cancel(),
		mutationFn: cancelEventServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: eventQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Cancelling event...",
			successMessage: "Event cancelled.",
			errorMessages: { default: "Error cancelling event!" },
		},
	});
};

export const useCloseRegistration = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.events.closeRegistration(),
		mutationFn: closeRegistrationServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: eventQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Closing registration...",
			successMessage: "Registration closed!",
			errorMessages: { default: "Error closing registration!" },
		},
	});
};

export const useUpdateAttendee = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: mutationKeyFactory.events.updateAttendee(),
		mutationFn: updateAttendeeServerFn,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: eventQueries.entity.queryKey,
			});
		},
		meta: {
			showToast: true,
			loadingMessage: "Updating attendee...",
			successMessage: "Attendee updated!",
			errorMessages: { default: "Error updating attendee!" },
		},
	});
};
