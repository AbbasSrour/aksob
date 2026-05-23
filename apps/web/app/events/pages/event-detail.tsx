import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ArrowLeft,
	Calendar,
	Check,
	Clock,
	Edit2,
	MapPin,
	Users,
	Video,
	X,
} from "lucide-react";
import { Link, useParams } from "react-router";
import { useSession } from "~/app/lib/auth";
import {
	getEventDetail,
	listEventAttendees,
	registerForEvent,
	submitEventForReview,
	unregisterFromEvent,
	updateAttendeeStatus,
} from "~/app/lib/users";
import { Avatar } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { FullPageLoader } from "~/components/ui/loading-spinner";

function formatDateTime(dateStr: string): string {
	return new Date(dateStr).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}

const EVENT_TYPE_LABELS: Record<string, string> = {
	online: "Online",
	in_person: "In Person",
	hybrid: "Hybrid",
};

const ATTENDEE_STATUS_COLORS: Record<
	string,
	"default" | "primary" | "success" | "warning" | "error"
> = {
	approved: "success",
	pending: "warning",
	waitlisted: "default",
	cancelled: "error",
	rejected: "error",
};

export default function EventDetailPage() {
	const { id } = useParams<{ id: string }>();
	const queryClient = useQueryClient();
	const { data: session } = useSession();

	const {
		data: event,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["event-detail", id],
		queryFn: () => getEventDetail(id!).then((r) => r.data),
		enabled: !!id,
	});

	const isOrganizer =
		event?.viewerRegistration?.role === "owner" ||
		event?.viewerRegistration?.role === "organizer";
	const isAdmin = (session?.user as Record<string, unknown>)?.role === "admin";
	const canManage = isOrganizer || isAdmin;

	const { data: attendees = [], isLoading: attendeesLoading } = useQuery({
		queryKey: ["event-attendees", id],
		queryFn: () => listEventAttendees(id!).then((r) => r.data),
		enabled: !!id && canManage,
	});

	const registerMutation = useMutation({
		mutationFn: () => registerForEvent(id!),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["event-detail", id] }),
	});

	const unregisterMutation = useMutation({
		mutationFn: () => unregisterFromEvent(id!),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["event-detail", id] }),
	});

	const submitMutation = useMutation({
		mutationFn: () => submitEventForReview(id!),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["event-detail", id] }),
	});

	const updateAttendeeMutation = useMutation({
		mutationFn: ({
			memberId,
			status,
		}: {
			memberId: string;
			status: "approved" | "pending" | "waitlisted" | "cancelled" | "rejected";
		}) => updateAttendeeStatus(id!, memberId, status),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["event-attendees", id] });
			queryClient.invalidateQueries({ queryKey: ["event-detail", id] });
		},
	});

	if (isLoading) {
		return (
			<main className="min-h-screen bg-(--off-white) pt-20">
				<div className="flex items-center justify-center py-32">
					<FullPageLoader />
				</div>
			</main>
		);
	}

	if (error || !event) {
		return (
			<main className="min-h-screen bg-(--off-white) pt-20">
				<div className="max-w-3xl mx-auto px-6 py-16 text-center">
					<h1
						className="text-3xl font-light text-(--aksob-darkest)"
						style={{ fontFamily: "var(--font-display)" }}
					>
						Event Not Found
					</h1>
					<p className="mt-4 text-[var(--gray-500)]">
						The event you&apos;re looking for doesn&apos;t exist or has been
						removed.
					</p>
					<Link
						to="/events"
						className="mt-6 inline-flex items-center gap-2 text-[var(--aksob-primary)] hover:underline"
					>
						<ArrowLeft size={16} />
						Back to Events
					</Link>
				</div>
			</main>
		);
	}

	const isOnline = event.eventType === "online";
	const isPast = new Date(event.endDate) < new Date();
	const registrationDeadlinePassed = event.registrationDeadline
		? new Date(event.registrationDeadline) < new Date()
		: false;
	const registrationUnavailable =
		isPast ||
		event.registrationClosed ||
		registrationDeadlinePassed ||
		(event.status !== "approved" && event.status !== "in_progress");
	const mutationError = registerMutation.error ?? unregisterMutation.error;
	const loginPath = `/auth/login?redirectTo=${encodeURIComponent(`/events/${event.id}`)}`;
	const canSubmit =
		canManage && (event.status === "draft" || event.status === "rejected");

	const pendingAttendees = attendees.filter((a) => a.status === "pending");
	const approvedAttendees = attendees.filter((a) => a.status === "approved");
	const waitlistedAttendees = attendees.filter(
		(a) => a.status === "waitlisted",
	);

	return (
		<main className="min-h-screen bg-(--off-white) pt-20">
			<div className="max-w-4xl mx-auto px-6 py-6">
				<Link
					to="/events"
					className="inline-flex items-center gap-2 text-sm text-[var(--gray-500)] hover:text-[var(--aksob-primary)] transition-colors"
				>
					<ArrowLeft size={16} />
					Back to Events
				</Link>
			</div>

			{event.coverImage && (
				<div className="max-w-5xl mx-auto px-6">
					<img
						src={event.coverImage}
						alt={event.title}
						className="w-full aspect-[2/1] object-cover rounded-2xl"
					/>
				</div>
			)}

			<article className="max-w-3xl mx-auto px-6 py-12">
				{canManage && (
					<div className="mb-8 rounded-2xl border border-[var(--aksob-primary)]/20 bg-[var(--pale-mint)] p-5">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
							<div>
								<p className="text-sm font-medium text-(--aksob-darkest)">
									Event management
								</p>
								<p className="mt-1 text-xs text-[var(--gray-500)]">
									Status: {event.status.replace("_", " ")}
								</p>
							</div>
							<div className="flex flex-wrap gap-2">
								<Link to={`/events/${event.id}/edit`}>
									<Button
										variant="outline"
										size="sm"
										leftIcon={<Edit2 size={14} />}
									>
										Edit
									</Button>
								</Link>
								{canSubmit && (
									<Button
										variant="primary"
										size="sm"
										isLoading={submitMutation.isPending}
										onClick={() => submitMutation.mutate()}
									>
										Submit for Review
									</Button>
								)}
							</div>
						</div>
						{submitMutation.error && (
							<p className="mt-3 text-sm text-red-600">
								{submitMutation.error.message}
							</p>
						)}
					</div>
				)}

				<div className="flex items-center gap-3 mb-6 flex-wrap">
					<Badge variant="primary" className="text-xs">
						{EVENT_TYPE_LABELS[event.eventType] ?? event.eventType}
					</Badge>
					{isPast && (
						<Badge variant="default" className="text-xs">
							Past Event
						</Badge>
					)}
				</div>

				<h1
					className="text-3xl md:text-4xl font-bold text-(--aksob-darkest) tracking-tight leading-tight"
					style={{ fontFamily: "var(--font-display)" }}
				>
					{event.title}
				</h1>

				<p className="mt-4 text-lg text-[var(--gray-500)] leading-relaxed whitespace-pre-wrap">
					{event.description}
				</p>

				<div className="mt-8 grid gap-3 sm:grid-cols-2">
					<div className="flex items-center gap-3 text-sm text-[var(--gray-700)]">
						<Calendar size={16} className="shrink-0 text-[var(--gray-400)]" />
						<div>
							<p className="font-medium">Date</p>
							<p className="text-[var(--gray-500)] text-xs">
								{formatDateTime(event.startDate)} to{" "}
								{formatDateTime(event.endDate)}
							</p>
						</div>
					</div>

					{event.location && (
						<div className="flex items-center gap-3 text-sm text-[var(--gray-700)]">
							{isOnline ? (
								<Video size={16} className="shrink-0 text-[var(--gray-400)]" />
							) : (
								<MapPin size={16} className="shrink-0 text-[var(--gray-400)]" />
							)}
							<div>
								<p className="font-medium">
									{isOnline ? "Platform" : "Location"}
								</p>
								<p className="text-[var(--gray-500)] text-xs">
									{event.location}
								</p>
							</div>
						</div>
					)}

					{event.meetingUrl && (
						<div className="flex items-center gap-3 text-sm text-[var(--gray-700)]">
							<Video size={16} className="shrink-0 text-[var(--gray-400)]" />
							<div>
								<p className="font-medium">
									{event.meetingPlatform ?? "Online Meeting"}
								</p>
								<a
									href={event.meetingUrl}
									target="_blank"
									rel="noreferrer"
									className="text-[var(--aksob-primary)] text-xs hover:underline"
								>
									Open meeting link
								</a>
							</div>
						</div>
					)}

					{event.requiresRegistration && (
						<div className="flex items-center gap-3 text-sm text-[var(--gray-700)]">
							<Users size={16} className="shrink-0 text-[var(--gray-400)]" />
							<div>
								<p className="font-medium">Registration Required</p>
								{event.registrationDeadline && (
									<p className="text-[var(--gray-500)] text-xs">
										Deadline: {formatDateTime(event.registrationDeadline)}
									</p>
								)}
							</div>
						</div>
					)}

					{event.capacity && (
						<div className="flex items-center gap-3 text-sm text-[var(--gray-700)]">
							<Users size={16} className="shrink-0 text-[var(--gray-400)]" />
							<div>
								<p className="font-medium">Capacity</p>
								<p className="text-[var(--gray-500)] text-xs">
									{event.capacity} attendees
								</p>
							</div>
						</div>
					)}
				</div>

				{/* ── Attendee Management ─────────────────────────── */}
				{canManage && event.requiresRegistration && (
					<div className="mt-10">
						<div className="flex items-center gap-3 mb-6">
							<Users size={20} className="text-(--aksob-darkest)" />
							<h2
								className="text-xl font-semibold text-(--aksob-darkest)"
								style={{ fontFamily: "var(--font-display)" }}
							>
								Attendees
							</h2>
							<Badge variant="primary" className="text-xs">
								{attendees.length}
							</Badge>
						</div>

						{attendeesLoading ? (
							<div className="space-y-3">
								{Array.from({ length: 3 }).map((_, i) => (
									<div
										key={i}
										className="flex items-center gap-3 p-4 rounded-xl border border-[var(--gray-200)] bg-white animate-pulse"
									>
										<div className="w-10 h-10 rounded-full bg-[var(--gray-200)]" />
										<div className="flex-1 space-y-2">
											<div className="h-4 w-32 bg-[var(--gray-200)] rounded" />
											<div className="h-3 w-20 bg-[var(--gray-200)] rounded" />
										</div>
									</div>
								))}
							</div>
						) : attendees.length === 0 ? (
							<div className="text-center py-12 rounded-2xl border border-[var(--gray-200)] bg-white">
								<Users
									size={32}
									className="mx-auto text-[var(--gray-300)] mb-3"
								/>
								<p className="text-sm text-[var(--gray-500)]">
									No registrations yet.
								</p>
							</div>
						) : (
							<div className="space-y-6">
								{/* Pending */}
								{pendingAttendees.length > 0 && (
									<div>
										<h3 className="text-sm font-medium text-[var(--gray-500)] mb-3 flex items-center gap-2">
											<Clock size={14} />
											Pending ({pendingAttendees.length})
										</h3>
										<div className="space-y-2">
											{pendingAttendees.map((attendee) => (
												<AttendeeRow
													key={attendee.memberId}
													attendee={attendee}
													mutation={updateAttendeeMutation}
												/>
											))}
										</div>
									</div>
								)}

								{/* Approved */}
								{approvedAttendees.length > 0 && (
									<div>
										<h3 className="text-sm font-medium text-[var(--gray-500)] mb-3 flex items-center gap-2">
											<Check size={14} />
											Approved ({approvedAttendees.length})
										</h3>
										<div className="space-y-2">
											{approvedAttendees.map((attendee) => (
												<AttendeeRow
													key={attendee.memberId}
													attendee={attendee}
													mutation={updateAttendeeMutation}
												/>
											))}
										</div>
									</div>
								)}

								{/* Waitlisted */}
								{waitlistedAttendees.length > 0 && (
									<div>
										<h3 className="text-sm font-medium text-[var(--gray-500)] mb-3 flex items-center gap-2">
											<Clock size={14} />
											Waitlisted ({waitlistedAttendees.length})
										</h3>
										<div className="space-y-2">
											{waitlistedAttendees.map((attendee) => (
												<AttendeeRow
													key={attendee.memberId}
													attendee={attendee}
													mutation={updateAttendeeMutation}
												/>
											))}
										</div>
									</div>
								)}
							</div>
						)}
					</div>
				)}

				<div className="mt-8 rounded-2xl border border-[var(--gray-200)] bg-white p-5">
					{!event.requiresRegistration ? (
						<p className="text-sm text-[var(--aksob-primary)]">
							No registration is required for this event.
						</p>
					) : !session?.user ? (
						<div className="space-y-3">
							<p className="text-sm text-[var(--gray-600)]">
								Sign in to register for this event.
							</p>
							<Link to={loginPath}>
								<Button variant="primary" leftIcon={<Clock size={14} />}>
									Sign in to Register
								</Button>
							</Link>
						</div>
					) : event.viewerRegistration?.role === "owner" ||
						event.viewerRegistration?.role === "organizer" ? (
						<p className="text-sm text-[var(--gray-600)]">
							You are an{" "}
							{event.viewerRegistration.role === "owner"
								? "owner"
								: "organizer"}{" "}
							of this event.
						</p>
					) : event.viewerRegistration?.role === "attendee" ? (
						<div className="space-y-3">
							<div className="flex items-center gap-2">
								<span className="text-sm text-[var(--gray-600)]">
									Registration status:{" "}
									<span className="font-medium capitalize">
										{event.viewerRegistration.attendeeStatus?.replace("_", " ")}
									</span>
								</span>
							</div>
							{event.viewerRegistration.attendeeStatus !== "cancelled" && (
								<Button
									variant="outline"
									size="sm"
									isLoading={unregisterMutation.isPending}
									onClick={() => unregisterMutation.mutate()}
								>
									Cancel Registration
								</Button>
							)}
							{mutationError && (
								<p className="text-sm text-red-600">{mutationError.message}</p>
							)}
						</div>
					) : (
						<div className="space-y-3">
							<p className="text-sm text-[var(--gray-600)]">
								{registrationUnavailable
									? "Registration is not available for this event."
									: "Register to reserve your spot for this event."}
							</p>
							<Button
								variant="primary"
								disabled={registrationUnavailable}
								isLoading={registerMutation.isPending}
								onClick={() => registerMutation.mutate()}
								leftIcon={<Clock size={14} />}
							>
								Register
							</Button>
							{mutationError && (
								<p className="text-sm text-red-600">{mutationError.message}</p>
							)}
						</div>
					)}
				</div>

				{event.owner && (
					<>
						<hr className="mt-8 mb-6 border-[var(--gray-200)]" />
						<div className="flex items-center gap-3">
							<Avatar
								name={event.owner.name}
								src={event.owner.image ?? undefined}
								size="md"
							/>
							<div>
								<p className="text-sm font-medium text-(--aksob-darkest)">
									{event.owner.name}
								</p>
								<p className="text-xs text-[var(--gray-400)]">Organizer</p>
							</div>
						</div>
					</>
				)}
			</article>
		</main>
	);
}

function AttendeeRow({
	attendee,
	mutation,
}: {
	attendee: {
		memberId: string;
		userId: string;
		user: { id: string; name: string; image: string | null };
		status: string;
		checkedIn: boolean;
	};
	mutation: ReturnType<typeof useMutation>;
}) {
	return (
		<div className="flex items-center justify-between p-4 rounded-xl border border-[var(--gray-200)] bg-white">
			<div className="flex items-center gap-3 min-w-0">
				<Avatar
					name={attendee.user.name}
					src={attendee.user.image ?? undefined}
					size="sm"
				/>
				<div className="min-w-0">
					<p className="text-sm font-medium text-(--aksob-darkest) truncate">
						{attendee.user.name}
					</p>
					<div className="flex items-center gap-2 mt-0.5">
						<Badge
							variant={ATTENDEE_STATUS_COLORS[attendee.status] ?? "default"}
							className="text-[10px] px-1.5 py-0"
						>
							{attendee.status.replace("_", " ")}
						</Badge>
						{attendee.checkedIn && (
							<Badge variant="success" className="text-[10px] px-1.5 py-0">
								Checked in
							</Badge>
						)}
					</div>
				</div>
			</div>

			<div className="flex items-center gap-1.5 shrink-0 ml-3">
				{attendee.status === "pending" && (
					<>
						<Button
							variant="primary"
							size="sm"
							isLoading={mutation.isPending}
							onClick={() =>
								mutation.mutate({
									memberId: attendee.memberId,
									status: "approved",
								})
							}
						>
							<Check size={14} />
						</Button>
						<Button
							variant="outline"
							size="sm"
							isLoading={mutation.isPending}
							onClick={() =>
								mutation.mutate({
									memberId: attendee.memberId,
									status: "rejected",
								})
							}
						>
							<X size={14} />
						</Button>
					</>
				)}
				{attendee.status === "waitlisted" && (
					<Button
						variant="primary"
						size="sm"
						isLoading={mutation.isPending}
						onClick={() =>
							mutation.mutate({
								memberId: attendee.memberId,
								status: "approved",
							})
						}
					>
						<Check size={14} />
					</Button>
				)}
				{attendee.status === "approved" && (
					<Button
						variant="outline"
						size="sm"
						isLoading={mutation.isPending}
						onClick={() =>
							mutation.mutate({
								memberId: attendee.memberId,
								status: "rejected",
							})
						}
					>
						<X size={14} />
					</Button>
				)}
			</div>
		</div>
	);
}
