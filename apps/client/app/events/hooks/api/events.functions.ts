import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { api } from "@/lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EventOwner {
	id: string;
	name: string;
	image: string | null;
}

export interface EventSurvey {
	id: string;
	eventId: string;
	audience: string;
	url: string;
	sendAt: string;
	sentAt: string | null;
	createdAt: string;
}

export interface EventItem {
	id: string;
	title: string;
	description: string;
	coverImage: string | null;
	eventType: string;
	location: string | null;
	meetingPlatform: string | null;
	meetingUrl: string | null;
	startDate: string;
	endDate: string;
	registrationDeadline: string | null;
	requiresRegistration: boolean;
	registrationMode: string;
	capacity: number | null;
	registrationClosed: boolean;
	registrationClosedAt: string | null;
	status: string;
	rejectionReason: string | null;
	checkInEnabled: boolean;
	remindersEnabled: boolean;
	attendeeListVisible: boolean;
	owner: EventOwner | null;
	surveys: EventSurvey[];
	createdAt: string;
	updatedAt: string;
}

export interface ListEventsResponse {
	status: "ok";
	data: EventItem[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export interface EventResponse {
	status: "ok";
	data: EventItem;
}

export interface ListEventsParams {
	page?: number;
	limit?: number;
	search?: string;
	status?: string;
	filter?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toFetchOptions(headers?: Headers): {
	fetch?: { headers: Record<string, string> };
} {
	if (!headers) return {};
	return { fetch: { headers: Object.fromEntries(headers.entries()) } };
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

export const listEventsFn = async (
	params: ListEventsParams,
	headers?: Headers,
): Promise<ListEventsResponse> => {
	const { data, error } = await api.events.get(
		{ query: params as Record<string, string | number | undefined> },
		toFetchOptions(headers),
	);

	if (error) throw error;
	return data as unknown as ListEventsResponse;
};

export const listEventsServerFn = createIsomorphicFn()
	.client((params: ListEventsParams) => listEventsFn(params))
	.server((params: ListEventsParams) =>
		listEventsFn(params, getRequestHeaders()),
	);

// ---------------------------------------------------------------------------
// Get Single
// ---------------------------------------------------------------------------

export interface GetEventParams {
	id: string;
}

export const getEventFn = async (
	params: GetEventParams,
	headers?: Headers,
): Promise<EventItem> => {
	const { data, error } = await api
		.events({ id: params.id })
		.get(toFetchOptions(headers));

	if (error) throw error;
	return (data as unknown as EventResponse).data;
};

export const getEventServerFn = createIsomorphicFn()
	.client((params: GetEventParams) => getEventFn(params))
	.server((params: GetEventParams) => getEventFn(params, getRequestHeaders()));

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export interface DeleteEventParams {
	id: string;
}

export const deleteEventFn = async (
	params: DeleteEventParams,
	headers?: Headers,
): Promise<void> => {
	const { error } = await api
		.events({ id: params.id })
		.delete(undefined, toFetchOptions(headers));

	if (error) throw error;
};

export const deleteEventServerFn = createIsomorphicFn()
	.client((params: DeleteEventParams) => deleteEventFn(params))
	.server((params: DeleteEventParams) =>
		deleteEventFn(params, getRequestHeaders()),
	);

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export interface CreateEventParams {
	title: string;
	description: string;
	coverImage?: string;
	eventType: string;
	location?: string;
	meetingPlatform?: string;
	meetingUrl?: string;
	startDate: string;
	endDate: string;
	requiresRegistration?: boolean;
	registrationDeadline?: string;
	registrationMode?: string;
	capacity?: number;
	checkInEnabled?: boolean;
	remindersEnabled?: boolean;
	attendeeListVisible?: boolean;
}

export const createEventFn = async (
	params: CreateEventParams,
	headers?: Headers,
): Promise<EventItem> => {
	const { data, error } = await api.events.post(
		params,
		toFetchOptions(headers),
	);

	if (error) throw error;
	return (data as unknown as EventResponse).data;
};

export const createEventServerFn = createIsomorphicFn()
	.client((params: CreateEventParams) => createEventFn(params))
	.server((params: CreateEventParams) =>
		createEventFn(params, getRequestHeaders()),
	);

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export interface UpdateEventParams {
	id: string;
	title?: string;
	description?: string;
	coverImage?: string | null;
	eventType?: string;
	location?: string | null;
	meetingPlatform?: string | null;
	meetingUrl?: string | null;
	startDate?: string;
	endDate?: string;
	requiresRegistration?: boolean;
	registrationDeadline?: string | null;
	registrationMode?: string;
	capacity?: number | null;
	checkInEnabled?: boolean;
	remindersEnabled?: boolean;
	attendeeListVisible?: boolean;
	notifyAttendees?: boolean;
}

export const updateEventFn = async (
	params: UpdateEventParams,
	headers?: Headers,
): Promise<EventItem> => {
	const { id, ...body } = params;
	const { data, error } = await api
		.events({ id })
		.put(body, toFetchOptions(headers));

	if (error) throw error;
	return (data as unknown as EventResponse).data;
};

export const updateEventServerFn = createIsomorphicFn()
	.client((params: UpdateEventParams) => updateEventFn(params))
	.server((params: UpdateEventParams) =>
		updateEventFn(params, getRequestHeaders()),
	);

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export interface EventActionParams {
	id: string;
}

export interface RejectEventParams extends EventActionParams {
	reason: string;
}

export const submitEventFn = async (
	params: EventActionParams,
	headers?: Headers,
): Promise<EventItem> => {
	const { data, error } = await api
		.events({ id: params.id })
		.submit.post(undefined, toFetchOptions(headers));
	if (error) throw error;
	return (data as unknown as EventResponse).data;
};

export const approveEventFn = async (
	params: EventActionParams,
	headers?: Headers,
): Promise<EventItem> => {
	const { data, error } = await api
		.events({ id: params.id })
		.approve.post(undefined, toFetchOptions(headers));
	if (error) throw error;
	return (data as unknown as EventResponse).data;
};

export const rejectEventFn = async (
	params: RejectEventParams,
	headers?: Headers,
): Promise<EventItem> => {
	const { id, reason } = params;
	const { data, error } = await api
		.events({ id })
		.reject.post({ reason }, toFetchOptions(headers));
	if (error) throw error;
	return (data as unknown as EventResponse).data;
};

export const cancelEventFn = async (
	params: EventActionParams,
	headers?: Headers,
): Promise<EventItem> => {
	const { data, error } = await api
		.events({ id: params.id })
		.cancel.post(undefined, toFetchOptions(headers));
	if (error) throw error;
	return (data as unknown as EventResponse).data;
};

export const closeRegistrationFn = async (
	params: EventActionParams,
	headers?: Headers,
): Promise<EventItem> => {
	const { data, error } = await api
		.events({ id: params.id })
		["close-registration"].post(undefined, toFetchOptions(headers));
	if (error) throw error;
	return (data as unknown as EventResponse).data;
};

export const submitEventServerFn = createIsomorphicFn()
	.client((params: EventActionParams) => submitEventFn(params))
	.server((params: EventActionParams) =>
		submitEventFn(params, getRequestHeaders()),
	);

export const approveEventServerFn = createIsomorphicFn()
	.client((params: EventActionParams) => approveEventFn(params))
	.server((params: EventActionParams) =>
		approveEventFn(params, getRequestHeaders()),
	);

export const rejectEventServerFn = createIsomorphicFn()
	.client((params: RejectEventParams) => rejectEventFn(params))
	.server((params: RejectEventParams) =>
		rejectEventFn(params, getRequestHeaders()),
	);

export const cancelEventServerFn = createIsomorphicFn()
	.client((params: EventActionParams) => cancelEventFn(params))
	.server((params: EventActionParams) =>
		cancelEventFn(params, getRequestHeaders()),
	);

export const closeRegistrationServerFn = createIsomorphicFn()
	.client((params: EventActionParams) => closeRegistrationFn(params))
	.server((params: EventActionParams) =>
		closeRegistrationFn(params, getRequestHeaders()),
	);

// ---------------------------------------------------------------------------
// Attendees
// ---------------------------------------------------------------------------

export interface EventAttendee {
	id: string;
	userId: string;
	name: string;
	image: string | null;
	status: string;
	checkedIn: boolean;
	ticketToken: string | null;
}

export interface ListAttendeesResponse {
	status: "ok";
	data: EventAttendee[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export interface ListAttendeesParams {
	eventId: string;
	status?: string;
	page?: number;
	limit?: number;
}

export const listAttendeesFn = async (
	params: ListAttendeesParams,
	headers?: Headers,
): Promise<ListAttendeesResponse> => {
	const { eventId, ...query } = params;
	const { data, error } = await api
		.events({ id: eventId })
		.attendees.get(
			{ query: query as Record<string, string | number | undefined> },
			toFetchOptions(headers),
		);
	if (error) throw error;
	return data as unknown as ListAttendeesResponse;
};

export const listAttendeesServerFn = createIsomorphicFn()
	.client((params: ListAttendeesParams) => listAttendeesFn(params))
	.server((params: ListAttendeesParams) =>
		listAttendeesFn(params, getRequestHeaders()),
	);

export interface UpdateAttendeeParams {
	eventId: string;
	memberId: string;
	status: "approved" | "rejected";
}

export const updateAttendeeFn = async (
	params: UpdateAttendeeParams,
	headers?: Headers,
): Promise<EventAttendee> => {
	const { eventId, memberId, status } = params;
	const { data, error } = await api
		.events({ id: eventId })
		.attendees({ memberId })
		.put({ status }, toFetchOptions(headers));
	if (error) throw error;
	return data as unknown as EventAttendee;
};

export const updateAttendeeServerFn = createIsomorphicFn()
	.client((params: UpdateAttendeeParams) => updateAttendeeFn(params))
	.server((params: UpdateAttendeeParams) =>
		updateAttendeeFn(params, getRequestHeaders()),
	);
