import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@aksob/ui/core/card";
import { Button } from "@aksob/ui/core/button";
import { Badge } from "@aksob/ui/core/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@aksob/ui/core/tabs";
import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	IconArrowLeft,
	IconCalendar,
	IconCheck,
	IconMapPin,
	IconUsers,
	IconX,
} from "@tabler/icons-react";
import { eventStatusOptions } from "@/app/events/constants/event-status-options";
import { eventTypeOptions } from "@/app/events/constants/event-type-options";
import {
	eventQueries,
	eventAttendeeQueries,
	useSubmitEvent,
	useApproveEvent,
	useRejectEvent,
	useCancelEvent,
	useCloseRegistration,
	useUpdateAttendee,
} from "@/app/events/hooks/api/events.queries";
import type { EventItem, EventAttendee } from "@/app/events/hooks/api/events.functions";

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function statusBadge(status: string) {
	const opt = eventStatusOptions.find((o) => o.value === status);
	if (!opt) return <Badge variant="outline">{status}</Badge>;
	return <Badge className={opt.className}>{opt.label}</Badge>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function eventTypeLabel(type: string) {
	return eventTypeOptions.find((o) => o.value === type)?.label ?? type;
}

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

// ---------------------------------------------------------------------------
// Available actions
// ---------------------------------------------------------------------------

interface Action {
	label: string;
	variant: "default" | "destructive" | "outline" | "secondary";
	fn: () => void;
	isPending: boolean;
}

function getActions(
	event: EventItem,
	callbacks: {
		submit: (id: string) => void;
		approve: (id: string) => void;
		reject: (id: string) => void;
		cancel: (id: string) => void;
		closeRegistration: (id: string) => void;
		submitPending: boolean;
		approvePending: boolean;
		rejectPending: boolean;
		cancelPending: boolean;
		closePending: boolean;
	},
): Action[] {
	const { status, id } = event;

	switch (status) {
		case "draft":
			return [
				{
					label: "Submit for Review",
					variant: "default",
					fn: () => callbacks.submit(id),
					isPending: callbacks.submitPending,
				},
			];
		case "pending_review":
			return [
				{
					label: "Approve",
					variant: "default",
					fn: () => callbacks.approve(id),
					isPending: callbacks.approvePending,
				},
				{
					label: "Reject",
					variant: "destructive",
					fn: () => callbacks.reject(id),
					isPending: callbacks.rejectPending,
				},
			];
		case "approved":
		case "in_progress":
			return [
				{
					label: "Cancel",
					variant: "destructive",
					fn: () => callbacks.cancel(id),
					isPending: callbacks.cancelPending,
				},
				{
					label: "Close Registration",
					variant: "outline",
					fn: () => callbacks.closeRegistration(id),
					isPending: callbacks.closePending,
				},
			];
		default:
			return [];
	}
}

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

export const Route = createFileRoute("/admin/events/$eventId")({
	loader: async ({ context, params }) => {
		await Promise.all([
			context.queryClient.ensureQueryData(
				eventQueries.single(params.eventId),
			),
			context.queryClient.ensureQueryData(
				eventAttendeeQueries.list({
					eventId: params.eventId,
					page: 1,
					limit: 20,
				}),
			),
		]);
	},
	head: () => ({
		meta: [
			{ title: "Event Details" },
			{ name: "description", content: "Manage event details." },
		],
	}),
	component: EventDetailPage,
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function EventDetailPage() {
	const { eventId } = Route.useParams();
	const { data: event } = useSuspenseQuery(eventQueries.single(eventId));
	if (!event) return <div>Event not found.</div>;

	return (
		<Main>
			<PageHeader
				title={
					<div className="flex items-center gap-3">
						{event.title}
						{statusBadge(event.status)}
					</div>
				}
				description={`${eventTypeLabel(event.eventType)} event`}
				withSeparator
			>
				<div className="flex flex-wrap items-center gap-2">
					<Link to="/admin/events">
						<Button variant="ghost" className="gap-2">
							<IconArrowLeft size={16} />
							Back to Events
						</Button>
					</Link>
					<Link
						to="/admin/events/$eventId/edit"
						params={{ eventId }}
					>
						<Button variant="outline">Edit</Button>
					</Link>
				</div>
			</PageHeader>

			<ActionBar event={event} />
			<EventTabs event={event} />
		</Main>
	);
}

// ---------------------------------------------------------------------------
// Action bar
// ---------------------------------------------------------------------------

function ActionBar({ event }: { event: EventItem }) {
	const submitMutation = useSubmitEvent();
	const approveMutation = useApproveEvent();
	const rejectMutation = useRejectEvent();
	const cancelMutation = useCancelEvent();
	const closeMutation = useCloseRegistration();

	const actions = getActions(event, {
		submit: (id) => submitMutation.mutate({ id }),
		approve: (id) => approveMutation.mutate({ id }),
		reject: (id) => {
			const reason = prompt("Rejection reason:");
			if (reason) rejectMutation.mutate({ id, reason });
		},
		cancel: (id) => {
			if (confirm("Cancel this event?")) cancelMutation.mutate({ id });
		},
		closeRegistration: (id) => closeMutation.mutate({ id }),
		submitPending: submitMutation.isPending,
		approvePending: approveMutation.isPending,
		rejectPending: rejectMutation.isPending,
		cancelPending: cancelMutation.isPending,
		closePending: closeMutation.isPending,
	});

	if (actions.length === 0) return null;

	return (
		<div className="flex flex-wrap gap-2 pb-6">
			{actions.map((action) => (
				<Button
					key={action.label}
					variant={action.variant}
					disabled={action.isPending}
					onClick={action.fn}
				>
					{action.label}
				</Button>
			))}
		</div>
	);
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

function EventTabs({ event }: { event: EventItem }) {
	return (
		<Tabs defaultValue="overview" className="w-full">
			<TabsList>
				<TabsTrigger value="overview">Overview</TabsTrigger>
				<TabsTrigger value="attendees">Attendees</TabsTrigger>
				<TabsTrigger value="surveys">Surveys</TabsTrigger>
			</TabsList>

			<TabsContent value="overview" className="pt-4">
				<OverviewTab event={event} />
			</TabsContent>

			<TabsContent value="attendees" className="pt-4">
				<AttendeesTab eventId={event.id} />
			</TabsContent>

			<TabsContent value="surveys" className="pt-4">
				<SurveysTab surveys={event.surveys} />
			</TabsContent>
		</Tabs>
	);
}

// ---------------------------------------------------------------------------
// Overview tab
// ---------------------------------------------------------------------------

function OverviewTab({ event }: { event: EventItem }) {
	return (
		<div className="grid gap-6 md:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Event Details</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-1">
						<span className="text-sm font-medium text-muted-foreground">
							Description
						</span>
						<p className="text-sm whitespace-pre-wrap">
							{event.description}
						</p>
					</div>

					<div className="flex items-center gap-2 text-sm">
						<IconCalendar size={16} className="text-muted-foreground" />
						<span>
							{formatDate(event.startDate)}
							{event.startDate !== event.endDate &&
								` — ${formatDate(event.endDate)}`}
						</span>
					</div>

					{(event.eventType === "in_person" ||
						event.eventType === "hybrid") &&
						event.location && (
							<div className="flex items-center gap-2 text-sm">
								<IconMapPin
									size={16}
									className="text-muted-foreground"
								/>
								<span>{event.location}</span>
							</div>
						)}

					{event.owner && (
						<div className="flex items-center gap-2 text-sm">
							<IconUsers
								size={16}
								className="text-muted-foreground"
							/>
							<span>Owned by {event.owner.name}</span>
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Registration</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<InfoRow
						label="Registration"
						value={
							event.requiresRegistration
								? event.registrationMode === "approval"
									? "Requires Approval"
									: "Open"
								: "Not Required"
						}
					/>
					{event.requiresRegistration && (
						<>
							{event.registrationDeadline && (
								<InfoRow
									label="Deadline"
									value={formatDate(
										event.registrationDeadline,
									)}
								/>
							)}
							{event.capacity && (
								<InfoRow
									label="Capacity"
									value={String(event.capacity)}
								/>
							)}
						</>
					)}
					<InfoRow
						label="Check-in"
						value={event.checkInEnabled ? "Enabled" : "Disabled"}
					/>
					<InfoRow
						label="Reminders"
						value={event.remindersEnabled ? "Enabled" : "Disabled"}
					/>
					<InfoRow
						label="Attendee List"
						value={
							event.attendeeListVisible
								? "Public"
								: "Private"
						}
					/>
					{event.meetingPlatform && (
						<InfoRow
							label="Platform"
							value={event.meetingPlatform}
						/>
					)}
					{event.meetingUrl && (
						<div className="space-y-1">
							<span className="text-sm font-medium text-muted-foreground">
								Meeting URL
							</span>
							<a
								href={event.meetingUrl}
								target="_blank"
								rel="noreferrer"
								className="block text-sm text-primary underline truncate"
							>
								{event.meetingUrl}
							</a>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function InfoRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex justify-between items-center">
			<span className="text-sm text-muted-foreground">{label}</span>
			<span className="text-sm font-medium">{value}</span>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Attendees tab
// ---------------------------------------------------------------------------

function AttendeesTab({ eventId }: { eventId: string }) {
	const [page, setPage] = useState(1);
	const limit = 20;

	const { data: attendeesData } = useSuspenseQuery(
		eventAttendeeQueries.list({ eventId, page, limit }),
	);

	const updateAttendee = useUpdateAttendee();
	const attendees = (attendeesData?.data ?? []) as EventAttendee[];
	const total = attendeesData?.meta?.total ?? 0;
	const totalPages = attendeesData?.meta?.totalPages ?? 1;

	const handleApprove = (memberId: string) => {
		updateAttendee.mutate({ eventId, memberId, status: "approved" });
	};

	const handleReject = (memberId: string) => {
		if (!confirm("Reject this attendee?")) return;
		updateAttendee.mutate({ eventId, memberId, status: "rejected" });
	};

	if (attendees.length === 0) {
		return (
			<p className="text-sm text-muted-foreground py-8 text-center">
				No attendees yet.
			</p>
		);
	}

	return (
		<div>
			<div className="rounded-md border">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b bg-muted/50">
							<th className="px-4 py-3 text-left font-medium">
								Name
							</th>
							<th className="px-4 py-3 text-left font-medium">
								Status
							</th>
							<th className="px-4 py-3 text-left font-medium">
								Checked In
							</th>
							<th className="px-4 py-3 text-right font-medium">
								Actions
							</th>
						</tr>
					</thead>
					<tbody>
						{attendees.map((a) => (
							<tr key={a.id} className="border-b last:border-0">
								<td className="px-4 py-3 font-medium">{a.name}</td>
								<td className="px-4 py-3">
									<Badge variant="outline" className="text-xs">
										{a.status}
									</Badge>
								</td>
								<td className="px-4 py-3">
									{a.checkedIn ? (
										<IconCheck
											size={16}
											className="text-emerald-600"
										/>
									) : (
										<IconX
											size={16}
											className="text-muted-foreground"
										/>
									)}
								</td>
								<td className="px-4 py-3 text-right space-x-1">
									{a.status === "pending" && (
										<>
											<Button
												size="sm"
												variant="outline"
												onClick={() =>
													handleApprove(a.id)
												}
												disabled={
													updateAttendee.isPending
												}
											>
												Approve
											</Button>
											<Button
												size="sm"
												variant="outline"
												onClick={() =>
													handleReject(a.id)
												}
												disabled={
													updateAttendee.isPending
												}
											>
												Reject
											</Button>
										</>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<PageControls
				page={page}
				totalPages={totalPages}
				total={total}
				onPageChange={setPage}
			/>
		</div>
	);
}

function PageControls({
	page,
	totalPages,
	total,
	onPageChange,
}: {
	page: number;
	totalPages: number;
	total: number;
	onPageChange: (p: number) => void;
}) {
	return (
		<div className="flex items-center justify-between py-4">
			<span className="text-sm text-muted-foreground">
				{total} attendee{total !== 1 ? "s" : ""}
			</span>
			<div className="flex gap-2">
				<Button
					size="sm"
					variant="outline"
					disabled={page <= 1}
					onClick={() => onPageChange(page - 1)}
				>
					Previous
				</Button>
				<span className="flex items-center text-sm text-muted-foreground px-2">
					{page} / {totalPages}
				</span>
				<Button
					size="sm"
					variant="outline"
					disabled={page >= totalPages}
					onClick={() => onPageChange(page + 1)}
				>
					Next
				</Button>
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Surveys tab
// ---------------------------------------------------------------------------

function SurveysTab({ surveys }: { surveys: EventItem["surveys"] }) {
	if (!surveys || surveys.length === 0) {
		return (
			<p className="text-sm text-muted-foreground py-8 text-center">
				No surveys configured.
			</p>
		);
	}

	return (
		<div className="rounded-md border">
			<table className="w-full text-sm">
				<thead>
					<tr className="border-b bg-muted/50">
						<th className="px-4 py-3 text-left font-medium">
							Audience
						</th>
						<th className="px-4 py-3 text-left font-medium">URL</th>
						<th className="px-4 py-3 text-left font-medium">
							Send At
						</th>
						<th className="px-4 py-3 text-left font-medium">
							Sent
						</th>
					</tr>
				</thead>
				<tbody>
					{surveys.map((s) => (
						<tr key={s.id} className="border-b last:border-0">
							<td className="px-4 py-3">
								<Badge variant="outline" className="text-xs">
									{s.audience}
								</Badge>
							</td>
							<td className="px-4 py-3">
								<a
									href={s.url}
									target="_blank"
									rel="noreferrer"
									className="text-primary underline truncate max-w-xs block"
								>
									{s.url}
								</a>
							</td>
							<td className="px-4 py-3">
								{formatDate(s.sendAt)}
							</td>
							<td className="px-4 py-3">
								{s.sentAt ? (
									<IconCheck
										size={16}
										className="text-emerald-600"
									/>
								) : (
									<span className="text-muted-foreground">
										Pending
									</span>
								)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
