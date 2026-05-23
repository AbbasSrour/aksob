import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
	getEventDetail,
	type UpdateEventParams,
	updateEvent,
} from "~/app/lib/users";
import { EventCoverUpload } from "~/components/events/event-cover-upload";
import { Button } from "~/components/ui/button";

const EVENT_TYPES = [
	{ value: "in_person", label: "In Person" },
	{ value: "online", label: "Online" },
	{ value: "hybrid", label: "Hybrid" },
];

const REGISTRATION_MODES = [
	{ value: "open", label: "Open (auto-approve)" },
	{ value: "approval", label: "Approval required" },
];

type RegistrationMode = "open" | "approval";

function toIsoDateTime(value: string): string {
	return new Date(value).toISOString();
}

function toLocalDateTime(dateStr: string | null): string {
	if (!dateStr) return "";
	const d = new Date(dateStr);
	const offset = d.getTimezoneOffset();
	const local = new Date(d.getTime() - offset * 60_000);
	return local.toISOString().slice(0, 16);
}

export default function EventEditPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const {
		data,
		error: loadError,
		isLoading: loadingEvent,
	} = useQuery({
		queryKey: ["event-detail", id],
		queryFn: () => getEventDetail(id!).then((r) => r.data),
		enabled: !!id,
	});

	const [form, setForm] = useState({
		title: "",
		description: "",
		eventType: "in_person",
		location: "",
		meetingPlatform: "",
		meetingUrl: "",
		startDate: "",
		endDate: "",
		registrationDeadline: "",
		requiresRegistration: true,
		registrationMode: "open",
		capacity: "",
		checkInEnabled: false,
		remindersEnabled: true,
		attendeeListVisible: false,
		coverImage: "",
		notifyAttendees: false,
	});
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (data) {
			setForm({
				title: data.title,
				description: data.description,
				eventType: data.eventType,
				location: data.location ?? "",
				meetingPlatform: data.meetingPlatform ?? "",
				meetingUrl: data.meetingUrl ?? "",
				startDate: toLocalDateTime(data.startDate),
				endDate: toLocalDateTime(data.endDate),
				registrationDeadline: toLocalDateTime(data.registrationDeadline),
				requiresRegistration: data.requiresRegistration,
				registrationMode: data.registrationMode,
				capacity: data.capacity?.toString() ?? "",
				checkInEnabled: data.checkInEnabled,
				remindersEnabled: data.remindersEnabled,
				attendeeListVisible: data.attendeeListVisible,
				coverImage: data.coverImage ?? "",
				notifyAttendees: false,
			});
		}
	}, [data]);

	const updateMutation = useMutation({
		mutationFn: () => {
			const body: UpdateEventParams = {
				title: form.title.trim(),
				description: form.description.trim(),
				eventType: form.eventType,
				startDate: toIsoDateTime(form.startDate),
				endDate: toIsoDateTime(form.endDate),
				requiresRegistration: form.requiresRegistration,
				registrationMode: form.registrationMode as RegistrationMode,
				checkInEnabled: form.checkInEnabled,
				remindersEnabled: form.remindersEnabled,
				attendeeListVisible: form.attendeeListVisible,
				notifyAttendees: form.notifyAttendees,
			};

			if (form.location.trim()) body.location = form.location.trim();
			else body.location = null;
			if (form.meetingPlatform.trim())
				body.meetingPlatform = form.meetingPlatform.trim();
			else body.meetingPlatform = null;
			if (form.meetingUrl.trim()) body.meetingUrl = form.meetingUrl.trim();
			else body.meetingUrl = null;
			if (form.coverImage.trim()) body.coverImage = form.coverImage.trim();
			else body.coverImage = null;
			if (form.registrationDeadline)
				body.registrationDeadline = toIsoDateTime(form.registrationDeadline);
			else body.registrationDeadline = null;
			if (form.capacity) body.capacity = parseInt(form.capacity, 10);
			else body.capacity = null;

			return updateEvent(id!, body);
		},
		onSuccess: (res) => {
			navigate(`/events/${res.data.id}`);
		},
		onError: (err) => {
			setError((err as Error).message || "Failed to update event");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!form.title.trim() || !form.description.trim()) {
			setError("Title and description are required");
			return;
		}
		if (!form.startDate || !form.endDate) {
			setError("Start and end dates are required");
			return;
		}
		if (new Date(form.startDate) >= new Date(form.endDate)) {
			setError("End date must be after start date");
			return;
		}
		if (
			form.registrationDeadline &&
			new Date(form.registrationDeadline) >= new Date(form.startDate)
		) {
			setError("Registration deadline must be before start date");
			return;
		}
		if (
			(form.eventType === "in_person" || form.eventType === "hybrid") &&
			!form.location.trim()
		) {
			setError("Location is required for in-person or hybrid events");
			return;
		}
		if (
			(form.eventType === "online" || form.eventType === "hybrid") &&
			!form.meetingUrl.trim()
		) {
			setError("Meeting URL is required for online or hybrid events");
			return;
		}

		updateMutation.mutate();
	};

	if (loadingEvent) {
		return (
			<main className="min-h-screen bg-(--off-white) pt-20">
				<div className="max-w-3xl mx-auto px-6 py-16">
					<div className="animate-pulse space-y-8">
						<div className="h-6 w-32 bg-gray-200 rounded" />
						<div className="h-8 w-3/4 bg-gray-200 rounded" />
						<div className="h-64 bg-gray-200 rounded-2xl" />
					</div>
				</div>
			</main>
		);
	}

	if (loadError || !data) {
		return (
			<main className="min-h-screen bg-(--off-white) pt-20">
				<div className="max-w-3xl mx-auto px-6 py-16 text-center">
					<h1
						className="text-3xl font-light text-(--aksob-darkest)"
						style={{ fontFamily: "var(--font-display)" }}
					>
						Event unavailable
					</h1>
					<p className="mt-3 text-sm text-[var(--gray-500)]">
						You may not have permission to edit this event.
					</p>
					<Link
						to="/events"
						className="mt-6 inline-flex items-center gap-2 text-sm text-[var(--aksob-primary)] hover:underline"
					>
						<ArrowLeft size={16} />
						Back to Events
					</Link>
				</div>
			</main>
		);
	}

	const inputClass =
		"w-full h-10 rounded-lg border border-[var(--gray-200)] bg-white px-3 text-sm text-[var(--gray-700)] focus:ring-2 focus:ring-[var(--aksob-primary)]/20 focus:border-[var(--aksob-primary)] transition";
	const textareaClass =
		"w-full rounded-lg border border-[var(--gray-200)] bg-white px-3 py-2 text-sm text-[var(--gray-700)] focus:ring-2 focus:ring-[var(--aksob-primary)]/20 focus:border-[var(--aksob-primary)] transition resize-none";
	const labelClass = "text-xs text-[var(--gray-500)] mb-1 block font-medium";

	return (
		<main className="min-h-screen bg-(--off-white) pt-20">
			<div className="max-w-3xl mx-auto px-6 py-16">
				<Link
					to={`/events/${id}`}
					className="inline-flex items-center gap-2 text-sm text-[var(--gray-500)] hover:text-[var(--aksob-primary)] transition-colors mb-8"
				>
					<ArrowLeft size={16} />
					Back to Event
				</Link>

				<h1
					className="text-3xl font-light text-(--aksob-darkest) tracking-[-0.01em] mb-8"
					style={{ fontFamily: "var(--font-display)" }}
				>
					Edit Event
				</h1>

				<form onSubmit={handleSubmit} className="space-y-8">
					<div className="rounded-2xl border border-[var(--gray-200)] bg-white p-6 sm:p-8 space-y-6">
						<h2 className="text-lg font-medium text-(--aksob-darkest)">
							Basic Information
						</h2>

						<div>
							<label className={labelClass} htmlFor="event-title">
								Title
							</label>
							<input
								id="event-title"
								className={inputClass}
								value={form.title}
								onChange={(e) => setForm({ ...form, title: e.target.value })}
								required
							/>
						</div>

						<div>
							<label className={labelClass} htmlFor="event-description">
								Description
							</label>
							<textarea
								id="event-description"
								className={textareaClass}
								rows={4}
								value={form.description}
								onChange={(e) =>
									setForm({ ...form, description: e.target.value })
								}
								required
							/>
						</div>

						<div>
							<EventCoverUpload
								value={form.coverImage}
								onChange={(url) => setForm({ ...form, coverImage: url })}
							/>
						</div>
					</div>

					<div className="rounded-2xl border border-[var(--gray-200)] bg-white p-6 sm:p-8 space-y-6">
						<h2 className="text-lg font-medium text-(--aksob-darkest)">
							Event Type & Location
						</h2>

						<div>
							<label className={labelClass} htmlFor="event-type">
								Event Type
							</label>
							<select
								id="event-type"
								className={inputClass}
								value={form.eventType}
								onChange={(e) =>
									setForm({ ...form, eventType: e.target.value })
								}
							>
								{EVENT_TYPES.map((t) => (
									<option key={t.value} value={t.value}>
										{t.label}
									</option>
								))}
							</select>
						</div>

						{(form.eventType === "in_person" ||
							form.eventType === "hybrid") && (
							<div>
								<label className={labelClass} htmlFor="event-location">
									Location
								</label>
								<input
									id="event-location"
									className={inputClass}
									value={form.location}
									onChange={(e) =>
										setForm({ ...form, location: e.target.value })
									}
								/>
							</div>
						)}

						{(form.eventType === "online" || form.eventType === "hybrid") && (
							<>
								<div>
									<label className={labelClass} htmlFor="event-meeting-url">
										Meeting URL
									</label>
									<input
										id="event-meeting-url"
										className={inputClass}
										value={form.meetingUrl}
										onChange={(e) =>
											setForm({ ...form, meetingUrl: e.target.value })
										}
									/>
								</div>
								<div>
									<label
										className={labelClass}
										htmlFor="event-meeting-platform"
									>
										Meeting Platform
									</label>
									<input
										id="event-meeting-platform"
										className={inputClass}
										value={form.meetingPlatform}
										onChange={(e) =>
											setForm({ ...form, meetingPlatform: e.target.value })
										}
										placeholder="Zoom, Google Meet, etc."
									/>
								</div>
							</>
						)}
					</div>

					<div className="rounded-2xl border border-[var(--gray-200)] bg-white p-6 sm:p-8 space-y-6">
						<h2 className="text-lg font-medium text-(--aksob-darkest)">
							Date & Time
						</h2>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label className={labelClass} htmlFor="event-start">
									Start Date & Time
								</label>
								<input
									id="event-start"
									className={inputClass}
									type="datetime-local"
									value={form.startDate}
									onChange={(e) =>
										setForm({ ...form, startDate: e.target.value })
									}
									required
								/>
							</div>
							<div>
								<label className={labelClass} htmlFor="event-end">
									End Date & Time
								</label>
								<input
									id="event-end"
									className={inputClass}
									type="datetime-local"
									value={form.endDate}
									onChange={(e) =>
										setForm({ ...form, endDate: e.target.value })
									}
									required
								/>
							</div>
						</div>
					</div>

					<div className="rounded-2xl border border-[var(--gray-200)] bg-white p-6 sm:p-8 space-y-6">
						<h2 className="text-lg font-medium text-(--aksob-darkest)">
							Registration Settings
						</h2>

						<div className="flex items-center gap-3">
							<input
								id="requires-registration"
								type="checkbox"
								checked={form.requiresRegistration}
								onChange={(e) =>
									setForm({ ...form, requiresRegistration: e.target.checked })
								}
								className="w-4 h-4 rounded border-[var(--gray-300)] text-[var(--aksob-primary)] focus:ring-[var(--aksob-primary)]"
							/>
							<label
								htmlFor="requires-registration"
								className="text-sm text-[var(--gray-700)]"
							>
								Requires registration
							</label>
						</div>

						{form.requiresRegistration && (
							<>
								<div>
									<label className={labelClass} htmlFor="registration-mode">
										Registration Mode
									</label>
									<select
										id="registration-mode"
										className={inputClass}
										value={form.registrationMode}
										onChange={(e) =>
											setForm({ ...form, registrationMode: e.target.value })
										}
									>
										{REGISTRATION_MODES.map((m) => (
											<option key={m.value} value={m.value}>
												{m.label}
											</option>
										))}
									</select>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<label className={labelClass} htmlFor="event-capacity">
											Capacity
										</label>
										<input
											id="event-capacity"
											className={inputClass}
											type="number"
											min="1"
											value={form.capacity}
											onChange={(e) =>
												setForm({ ...form, capacity: e.target.value })
											}
											placeholder="Unlimited"
										/>
									</div>
									<div>
										<label
											className={labelClass}
											htmlFor="registration-deadline"
										>
											Registration Deadline
										</label>
										<input
											id="registration-deadline"
											className={inputClass}
											type="datetime-local"
											value={form.registrationDeadline}
											onChange={(e) =>
												setForm({
													...form,
													registrationDeadline: e.target.value,
												})
											}
										/>
									</div>
								</div>

								<div className="space-y-3">
									<div className="flex items-center gap-3">
										<input
											id="check-in-enabled"
											type="checkbox"
											checked={form.checkInEnabled}
											onChange={(e) =>
												setForm({
													...form,
													checkInEnabled: e.target.checked,
												})
											}
											className="w-4 h-4 rounded border-[var(--gray-300)] text-[var(--aksob-primary)] focus:ring-[var(--aksob-primary)]"
										/>
										<label
											htmlFor="check-in-enabled"
											className="text-sm text-[var(--gray-700)]"
										>
											Enable check-in
										</label>
									</div>
									<div className="flex items-center gap-3">
										<input
											id="reminders-enabled"
											type="checkbox"
											checked={form.remindersEnabled}
											onChange={(e) =>
												setForm({
													...form,
													remindersEnabled: e.target.checked,
												})
											}
											className="w-4 h-4 rounded border-[var(--gray-300)] text-[var(--aksob-primary)] focus:ring-[var(--aksob-primary)]"
										/>
										<label
											htmlFor="reminders-enabled"
											className="text-sm text-[var(--gray-700)]"
										>
											Enable email reminders
										</label>
									</div>
									<div className="flex items-center gap-3">
										<input
											id="attendee-list-visible"
											type="checkbox"
											checked={form.attendeeListVisible}
											onChange={(e) =>
												setForm({
													...form,
													attendeeListVisible: e.target.checked,
												})
											}
											className="w-4 h-4 rounded border-[var(--gray-300)] text-[var(--aksob-primary)] focus:ring-[var(--aksob-primary)]"
										/>
										<label
											htmlFor="attendee-list-visible"
											className="text-sm text-[var(--gray-700)]"
										>
											Show attendee list publicly
										</label>
									</div>
								</div>
							</>
						)}
					</div>

					{data?.status === "approved" || data?.status === "in_progress" ? (
						<div className="rounded-2xl border border-[var(--gray-200)] bg-white p-6 sm:p-8">
							<div className="flex items-center gap-3">
								<input
									id="notify-attendees"
									type="checkbox"
									checked={form.notifyAttendees}
									onChange={(e) =>
										setForm({
											...form,
											notifyAttendees: e.target.checked,
										})
									}
									className="w-4 h-4 rounded border-[var(--gray-300)] text-[var(--aksob-primary)] focus:ring-[var(--aksob-primary)]"
								/>
								<label
									htmlFor="notify-attendees"
									className="text-sm text-[var(--gray-700)]"
								>
									Notify attendees of changes
								</label>
							</div>
						</div>
					) : null}

					{error && (
						<div className="p-4 bg-red-50 rounded-lg border border-red-200">
							<p className="text-sm text-red-700">{error}</p>
						</div>
					)}

					<div className="flex gap-3 justify-end">
						<Link to={`/events/${id}`}>
							<Button variant="ghost" type="button">
								Cancel
							</Button>
						</Link>
						<Button
							variant="primary"
							type="submit"
							isLoading={updateMutation.isPending}
						>
							{updateMutation.isPending ? (
								<span className="flex items-center gap-2">
									<Loader2 size={14} className="animate-spin" />
									Saving...
								</span>
							) : (
								"Save Changes"
							)}
						</Button>
					</div>
				</form>
			</div>
		</main>
	);
}
