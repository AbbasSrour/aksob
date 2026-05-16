import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { Button } from "@aksob/ui/core/button";
import { IconArrowLeft } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EventForm } from "@/app/events/components/form/event-form";
import type { EventFormSchema } from "@/app/events/components/form/event-form-schema";
import { EditEventSkeleton } from "@/app/events/components/loading/edit-event-skeleton";
import type { EventItem } from "@/app/events/hooks/api/events.functions";
import { eventQueries } from "@/app/events/hooks/api/events.queries";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toDateInputValue(iso: string): string {
	if (!iso) return "";
	return iso.slice(0, 10);
}

/** Single-day events stored as startDate + 1 day in DB; multi-day events have larger gap. */
function isMultiDay(startDate: string, endDate: string): boolean {
	const s = new Date(`${startDate}T00:00:00`);
	const e = new Date(`${endDate}T00:00:00`);
	const diffDays = (e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24);
	return diffDays > 1;
}

function eventToFormValues(event: EventItem): EventFormSchema {
	const startDate = toDateInputValue(event.startDate);
	const endDate = toDateInputValue(event.endDate);

	return {
		title: event.title,
		description: event.description,
		coverImage: event.coverImage ?? "",
		eventType: event.eventType as EventFormSchema["eventType"],
		location: event.location ?? "",
		meetingPlatform: event.meetingPlatform ?? "",
		meetingUrl: event.meetingUrl ?? "",
		startDate,
		endDate,
		multiDay: isMultiDay(event.startDate, event.endDate),
		requiresRegistration: event.requiresRegistration,
		registrationDeadline: event.registrationDeadline
			? toDateInputValue(event.registrationDeadline)
			: "",
		registrationMode:
			event.registrationMode as EventFormSchema["registrationMode"],
		capacity: event.capacity ?? 0,
		checkInEnabled: event.checkInEnabled,
		remindersEnabled: event.remindersEnabled,
		attendeeListVisible: event.attendeeListVisible,
	};
}

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

export const Route = createFileRoute("/admin/events/$eventId/edit")({
	pendingComponent: EditEventSkeleton,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			eventQueries.single(params.eventId),
		);
	},
	head: () => ({
		meta: [
			{ title: "Edit Event" },
			{ name: "description", content: "Edit an existing event." },
		],
	}),
	component: EditEventPage,
});

function EditEventPage() {
	const params = Route.useParams();
	const eventId = params.eventId;
	const { data: event } = useSuspenseQuery(eventQueries.single(eventId));

	if (!event) {
		return <div>Event not found.</div>;
	}

	return (
		<Main>
			<PageHeader
				title={`Edit ${event.title}`}
				description="Update event details."
				withSeparator
			>
				<Link to="/admin/events">
					<Button variant="ghost" className="gap-2">
						<IconArrowLeft size={16} />
						Back to Events
					</Button>
				</Link>
			</PageHeader>
			<EventForm eventId={eventId} defaultValues={eventToFormValues(event)} />
		</Main>
	);
}
