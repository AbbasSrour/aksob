import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, Loader2, MapPin, Plus, Users, X } from "lucide-react";
import { useState } from "react";
import { createEvent, type EventItem, listMyEvents } from "~/app/lib/users";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

const STATUS_COLORS: Record<
	string,
	{
		label: string;
		variant: "default" | "primary" | "success" | "warning" | "error";
	}
> = {
	draft: { label: "Draft", variant: "default" },
	pending_review: { label: "Pending Review", variant: "warning" },
	approved: { label: "Approved", variant: "success" },
	in_progress: { label: "In Progress", variant: "primary" },
	completed: { label: "Completed", variant: "success" },
	cancelled: { label: "Cancelled", variant: "error" },
	rejected: { label: "Rejected", variant: "error" },
};

const EVENT_TYPES = ["in_person", "online", "hybrid"];

type TabKey = "upcoming" | "past";

export function EventsSection() {
	const [tab, setTab] = useState<TabKey>("upcoming");
	const [showCreate, setShowCreate] = useState(false);
	const queryClient = useQueryClient();

	const { data, isLoading } = useQuery({
		queryKey: ["my-events", tab],
		queryFn: () => listMyEvents(tab).then((r) => r.data),
	});

	const createMutation = useMutation({
		mutationFn: createEvent,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["my-events"] });
			setShowCreate(false);
		},
	});

	const events = data ?? [];

	return (
		<div className="space-y-4">
			{/* Create button */}
			<div className="flex justify-end">
				<Button
					variant="primary"
					size="sm"
					onClick={() => setShowCreate(true)}
					leftIcon={<Plus size={14} />}
				>
					Create Event
				</Button>
			</div>

			{/* Create form */}
			{showCreate && (
				<CreateEventForm
					onSubmit={(params) => createMutation.mutate(params)}
					onCancel={() => setShowCreate(false)}
					isLoading={createMutation.isPending}
					error={
						createMutation.error
							? (createMutation.error as Error).message
							: null
					}
				/>
			)}

			{/* Tabs */}
			<div className="flex gap-1 p-1 bg-[var(--gray-100)] rounded-lg w-fit">
				<button
					type="button"
					onClick={() => setTab("upcoming")}
					className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
						tab === "upcoming"
							? "bg-white text-[var(--aksob-primary)] shadow-sm"
							: "text-gray-500 hover:text-gray-700"
					}`}
				>
					Upcoming
				</button>
				<button
					type="button"
					onClick={() => setTab("past")}
					className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
						tab === "past"
							? "bg-white text-[var(--aksob-primary)] shadow-sm"
							: "text-gray-500 hover:text-gray-700"
					}`}
				>
					Past
				</button>
			</div>

			{isLoading ? (
				<div className="flex items-center justify-center py-12">
					<Loader2
						size={24}
						className="animate-spin text-[var(--aksob-primary)]"
					/>
				</div>
			) : events.length === 0 ? (
				<div className="text-center py-12">
					<div className="w-16 h-16 bg-[var(--gray-100)] rounded-full flex items-center justify-center mx-auto mb-3">
						<Calendar size={24} className="text-[var(--gray-400)]" />
					</div>
					<p className="text-sm text-[var(--gray-500)]">
						{tab === "upcoming" ? "No upcoming events." : "No past events."}
					</p>
					{tab === "upcoming" ? (
						<p className="text-xs text-[var(--gray-400)] mt-1">
							Create an event or check the events page to discover new
							opportunities.
						</p>
					) : null}
				</div>
			) : (
				<div className="grid gap-3">
					{events.map((e) => (
						<EventCard key={e.id} event={e} />
					))}
				</div>
			)}
		</div>
	);
}

function CreateEventForm({
	onSubmit,
	onCancel,
	isLoading,
	error,
}: {
	onSubmit: (params: {
		title: string;
		description: string;
		eventType: string;
		startDate: string;
		endDate: string;
		location?: string;
	}) => void;
	onCancel: () => void;
	isLoading: boolean;
	error: string | null;
}) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [eventType, setEventType] = useState(EVENT_TYPES[0]);
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [location, setLocation] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim() || !description.trim() || !startDate || !endDate) return;
		onSubmit({
			title: title.trim(),
			description: description.trim(),
			eventType,
			startDate,
			endDate,
			...(location.trim() ? { location: location.trim() } : {}),
		});
	};

	const inputClass =
		"w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:ring-2 focus:ring-[var(--aksob-primary)]/20 focus:border-[var(--aksob-primary)] transition";
	const textareaClass =
		"w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-[var(--aksob-primary)]/20 focus:border-[var(--aksob-primary)] transition resize-none";

	return (
		<div className="p-5 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-sm font-semibold text-gray-900">Create Event</h3>
				<button
					type="button"
					onClick={onCancel}
					className="text-gray-400 hover:text-gray-600"
				>
					<X size={16} />
				</button>
			</div>
			<form onSubmit={handleSubmit} className="space-y-3">
				<input
					className={inputClass}
					placeholder="Event title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					required
				/>
				<textarea
					className={textareaClass}
					rows={3}
					placeholder="Description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					required
				/>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<select
						className={inputClass}
						value={eventType}
						onChange={(e) => setEventType(e.target.value)}
					>
						{EVENT_TYPES.map((t) => (
							<option key={t} value={t}>
								{t.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
							</option>
						))}
					</select>
					<input
						className={inputClass}
						placeholder="Location (optional)"
						value={location}
						onChange={(e) => setLocation(e.target.value)}
					/>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div>
						<label
							htmlFor="event-start"
							className="text-xs text-[var(--gray-500)] mb-1 block"
						>
							Start Date
						</label>
						<input
							id="event-start"
							className={inputClass}
							type="datetime-local"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
							required
						/>
					</div>
					<div>
						<label
							htmlFor="event-end"
							className="text-xs text-[var(--gray-500)] mb-1 block"
						>
							End Date
						</label>
						<input
							id="event-end"
							className={inputClass}
							type="datetime-local"
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
							required
						/>
					</div>
				</div>
				{error ? <p className="text-xs text-red-600">{error}</p> : null}
				<div className="flex gap-2 justify-end">
					<Button
						variant="ghost"
						size="sm"
						type="button"
						onClick={onCancel}
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						size="sm"
						type="submit"
						isLoading={isLoading}
					>
						Create Event
					</Button>
				</div>
			</form>
		</div>
	);
}

function EventCard({ event }: { event: EventItem }) {
	const status = STATUS_COLORS[event.status] ?? {
		label: event.status,
		variant: "default" as const,
	};
	const startDate = new Date(event.startDate);

	return (
		<div className="overflow-hidden flex flex-col sm:flex-row bg-white/60 backdrop-blur-sm rounded-xl border border-white/50">
			{/* Cover Image */}
			<div className="sm:w-48 h-32 sm:h-auto bg-[var(--gray-100)] flex-shrink-0 relative overflow-hidden">
				{event.coverImage ? (
					<img
						src={event.coverImage}
						alt={event.title}
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center">
						<Calendar size={32} className="text-[var(--gray-300)]" />
					</div>
				)}
			</div>

			{/* Content */}
			<div className="p-4 flex-1 min-w-0 flex flex-col justify-between">
				<div>
					<div className="flex items-start justify-between gap-2">
						<h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
							{event.title}
						</h4>
						<Badge
							variant={status.variant}
							className="text-[10px] px-1.5 py-0.5 flex-shrink-0"
						>
							{status.label}
						</Badge>
					</div>
					<p className="text-xs text-[var(--gray-500)] mt-1 line-clamp-2">
						{event.description}
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-[var(--gray-500)]">
					<span className="flex items-center gap-1">
						<Calendar size={12} />
						{startDate.toLocaleDateString(undefined, {
							month: "short",
							day: "numeric",
							year: "numeric",
						})}
					</span>
					<span className="flex items-center gap-1">
						<Clock size={12} />
						{startDate.toLocaleTimeString(undefined, {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</span>
					{event.location ? (
						<span className="flex items-center gap-1">
							<MapPin size={12} />
							{event.location}
						</span>
					) : null}
					{event.eventType ? (
						<span className="flex items-center gap-1">
							<Users size={12} />
							{event.eventType.replace("_", " ")}
						</span>
					) : null}
				</div>
			</div>
		</div>
	);
}
