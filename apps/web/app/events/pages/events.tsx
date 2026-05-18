import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { listPublicEvents, type EventItem } from "~/app/lib/users";
import { Avatar } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";

type EventPhase = "upcoming" | "in-progress" | "passed";

function getEventPhase(event: EventItem): EventPhase {
	const now = new Date();
	const start = new Date(event.startDate);
	const end = new Date(event.endDate);

	if (event.status === "cancelled") return "passed";
	if (start <= now && end >= now) return "in-progress";
	if (start > now) return "upcoming";
	return "passed";
}

const PHASE_LABELS: Record<EventPhase, string> = {
	upcoming: "Upcoming",
	"in-progress": "In Progress",
	passed: "Passed",
};

function formatDate(dateStr: string): string {
	return new Date(dateStr).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function formatTime(dateStr: string): string {
	return new Date(dateStr).toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

export default function EventsPage() {
	const sectionRef = useRef<HTMLElement>(null);
	const [isVisible, setIsVisible] = useState(false);

	const { data, isLoading } = useQuery({
		queryKey: ["events", "list"],
		queryFn: () => listPublicEvents().then((r) => r.data),
	});

	const events = data ?? [];

	useEffect(() => {
		const el = sectionRef.current;
		if (!el) return;

		const prefersReduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (prefersReduced) {
			setIsVisible(true);
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.1 },
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<main ref={sectionRef} className="min-h-screen bg-(--off-white)">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 md:pt-10 md:pb-32">
				{/* Header */}
				<div className="text-center mb-12">
					<span
						className={`text-xs font-semibold italic tracking-[0.15em] text-(--gray-400) ${isVisible ? "animate-editorial-fade" : "opacity-0"}`}
						style={isVisible ? { animationDelay: "0.1s" } : undefined}
					>
						Events
					</span>
					<h1
						className="mt-3 text-4xl md:text-5xl font-light text-(--aksob-darkest) tracking-[-0.01em]"
						style={{ fontFamily: "var(--font-display)" }}
					>
						<span
							className={`text-(--aksob-darkest) ${isVisible ? "animate-editorial-reveal" : "opacity-0"}`}
							style={isVisible ? { animationDelay: "0.2s" } : undefined}
						>
							Gather{" "}
						</span>
						<span
							className={`text-(--aksob-primary) ${isVisible ? "animate-editorial-reveal" : "opacity-0"}`}
							style={isVisible ? { animationDelay: "0.35s" } : undefined}
						>
							& Connect
						</span>
					</h1>
					<p
						className={`mt-4 text-lg text-[var(--gray-500)] max-w-2xl mx-auto ${isVisible ? "animate-editorial-fade" : "opacity-0"}`}
						style={isVisible ? { animationDelay: "0.5s" } : undefined}
					>
						Discover upcoming alumni events, workshops, and networking
						opportunities.
					</p>
				</div>

				{/* Events Grid */}
				{isLoading ? (
					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 6 }).map((_, i) => (
							<div
								key={i}
								className="rounded-2xl border border-[var(--gray-200)] bg-white overflow-hidden animate-pulse"
							>
								<div className="aspect-[16/9] bg-[var(--pale-mint)]" />
								<div className="p-5 space-y-3">
									<div className="h-3 w-20 bg-[var(--gray-200)] rounded" />
									<div className="h-5 w-full bg-[var(--gray-200)] rounded" />
									<div className="h-4 w-full bg-[var(--gray-200)] rounded" />
								</div>
							</div>
						))}
					</div>
				) : events.length === 0 ? (
					<div className="text-center py-20">
						<div className="w-16 h-16 bg-[var(--gray-100)] rounded-full flex items-center justify-center mx-auto mb-4">
							<Calendar size={24} className="text-[var(--gray-400)]" />
						</div>
						<p className="text-sm text-[var(--gray-500)]">
							No events yet.
						</p>
					</div>
				) : (
					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
						{events.map((event, index) => (
							<EventCard
								key={event.id}
								event={event}
								index={index}
								isVisible={isVisible}
							/>
						))}
					</div>
				)}
			</div>
		</main>
	);
}

function EventCard({
	event,
	index,
	isVisible,
}: {
	event: EventItem;
	index: number;
	isVisible: boolean;
}) {
	const phase = getEventPhase(event);
	const dateStr = formatDate(event.startDate);
	const timeStr = formatTime(event.startDate);

	return (
		<Link
			to={`/events/${event.id}`}
			className={`group flex flex-col rounded-2xl border border-[var(--gray-200)] bg-white overflow-hidden hover:shadow-md transition-shadow ${isVisible ? "animate-editorial-slide-up" : "opacity-0"}`}
			style={
				isVisible ? { animationDelay: `${0.2 + index * 0.1}s` } : undefined
			}
		>
			{/* Cover */}
			<div className="aspect-[16/9] overflow-hidden bg-[var(--pale-mint)]">
				{event.coverImage ? (
					<img
						src={event.coverImage}
						alt={event.title}
						className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
					/>
				) : (
					<div className="w-full h-full bg-gradient-to-br from-[var(--aksob-primary)] to-[var(--aksob-secondary)]" />
				)}
			</div>

			{/* Content */}
			<div className="flex flex-col flex-1 p-5">
				<div className="flex items-center gap-2 mb-3">
					<Badge variant="primary" className="text-[10px] px-2 py-0.5">
						{PHASE_LABELS[phase]}
					</Badge>
					<span className="text-xs text-[var(--gray-400)]">{dateStr}</span>
				</div>

				<h3
					className="text-lg font-semibold text-(--aksob-darkest) line-clamp-2 group-hover:text-(--aksob-primary) transition-colors"
					style={{ fontFamily: "var(--font-display)" }}
				>
					{event.title}
				</h3>

				<p className="text-sm text-[var(--gray-500)] mt-2 line-clamp-2 flex-1">
					{event.description}
				</p>

				{/* Footer */}
				<div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--gray-100)]">
					<div className="flex items-center gap-2">
						{event.owner ? (
							<>
								<Avatar
									name={event.owner.name}
									src={event.owner.image ?? undefined}
									size="xs"
								/>
								<span className="text-xs text-[var(--gray-500)]">
									{event.owner.name}
								</span>
							</>
						) : (
							<span className="flex items-center gap-1 text-xs text-[var(--gray-400)]">
								<Calendar size={12} />
								{event.eventType.replace("_", " ")}
							</span>
						)}
					</div>
					<div className="flex items-center gap-3 text-xs text-[var(--gray-400)]">
						{event.location && (
							<span className="flex items-center gap-1">
								<MapPin size={12} />
								<span className="truncate max-w-20">{event.location}</span>
							</span>
						)}
						<span className="flex items-center gap-1">
							<Clock size={12} />
							{timeStr}
						</span>
					</div>
				</div>
			</div>
		</Link>
	);
}
