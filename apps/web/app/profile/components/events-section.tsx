import { useQuery } from "@tanstack/react-query";
import {
	Calendar,
	Clock,
	Edit2,
	Loader2,
	MapPin,
	Plus,
	Users,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { type EventItem, listMyEvents } from "~/app/lib/users";
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

type TabKey = "upcoming" | "past";

export function EventsSection({ userId }: { userId: string }) {
	const [tab, setTab] = useState<TabKey>("upcoming");

	const { data, isLoading } = useQuery({
		queryKey: ["my-events", userId, tab],
		queryFn: () => listMyEvents(tab, userId).then((r) => r.data),
	});

	const events = data ?? [];

	return (
		<div className="space-y-4">
			{/* Create button */}
			<div className="flex justify-end">
				<Link to="/events/new">
					<Button variant="primary" size="sm" leftIcon={<Plus size={14} />}>
						Create Event
					</Button>
				</Link>
			</div>

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

function EventCard({ event }: { event: EventItem }) {
	const status = STATUS_COLORS[event.status] ?? {
		label: event.status,
		variant: "default" as const,
	};
	const startDate = new Date(event.startDate);

	return (
		<div className="overflow-hidden flex flex-col sm:flex-row bg-white/60 backdrop-blur-sm rounded-xl border border-white/50 hover:border-[var(--aksob-primary)]/30 transition-colors">
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
						<Link to={`/events/${event.id}`} className="min-w-0">
							<h4 className="text-sm font-semibold text-gray-900 line-clamp-1 hover:text-[var(--aksob-primary)] transition-colors">
								{event.title}
							</h4>
						</Link>
						<div className="flex items-center gap-2 flex-shrink-0">
							<Link
								to={`/events/${event.id}/edit`}
								className="p-1 text-[var(--gray-400)] hover:text-[var(--aksob-primary)] transition-colors"
								onClick={(e) => e.stopPropagation()}
							>
								<Edit2 size={12} />
							</Link>
							<Badge
								variant={status.variant}
								className="text-[10px] px-1.5 py-0.5"
							>
								{status.label}
							</Badge>
						</div>
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
