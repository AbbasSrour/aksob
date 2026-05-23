import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { type EventItem, listLatestEvents } from "~/app/lib/users";

const AUTO_ADVANCE_MS = 5000;

// ─── Helpers ──────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
	return new Date(dateStr).toLocaleDateString("en-US", {
		month: "long",
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

const PHASE_COLORS: Record<EventPhase, string> = {
	upcoming: "text-[var(--aksob-primary)]",
	"in-progress": "text-emerald-400",
	passed: "text-white/40",
};

/** Sort upcoming first, then in-progress, then passed. */
function sortEventsByPhase(events: EventItem[]): EventItem[] {
	const order: Record<EventPhase, number> = {
		upcoming: 0,
		"in-progress": 1,
		passed: 2,
	};
	return [...events].sort(
		(a, b) => order[getEventPhase(a)] - order[getEventPhase(b)],
	);
}

// ─── Event Spotlight section ─────────────────────────────────────────

export function EventSpotlight() {
	const sectionRef = useRef<HTMLElement>(null);
	const [isVisible, setIsVisible] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	const [progress, setProgress] = useState(0);
	const [textVisible, setTextVisible] = useState(true);

	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const goToSlide = useCallback((nextIndex: number) => {
		setTextVisible(false);
		setProgress(0);
		setTimeout(() => {
			setActiveIndex(nextIndex);
			setTextVisible(true);
		}, 250);
	}, []);

	const { data: rawEvents = [], isPending } = useQuery({
		queryKey: ["events", "spotlight"],
		queryFn: () => listLatestEvents(10).then((r) => r.data),
	});

	const events = sortEventsByPhase(rawEvents);

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

	useEffect(() => {
		if (!isVisible || events.length === 0) return;

		const startTime = Date.now();
		intervalRef.current = setInterval(() => {
			const elapsed = Date.now() - startTime;
			const newProgress = Math.min((elapsed / AUTO_ADVANCE_MS) * 100, 100);
			setProgress(newProgress);

			if (newProgress >= 100) {
				if (intervalRef.current) clearInterval(intervalRef.current);
				goToSlide((activeIndex + 1) % events.length);
			}
		}, 50);

		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, [activeIndex, isVisible, events.length, goToSlide]);

	function handlePrev() {
		if (events.length === 0) return;
		goToSlide((activeIndex - 1 + events.length) % events.length);
	}

	function handleNext() {
		if (events.length === 0) return;
		goToSlide((activeIndex + 1) % events.length);
	}

	const activeEvent = events[activeIndex];
	const activePhase = activeEvent ? getEventPhase(activeEvent) : "upcoming";

	return (
		<section
			ref={sectionRef}
			className="relative z-[20] w-full max-w-[90rem] mx-auto"
		>
			{isPending ? (
				<div className="relative w-full aspect-[16/11] min-h-[600px] max-h-[90vh] overflow-hidden rounded-2xl bg-[var(--gray-100)] flex items-center justify-center">
					<Loader2
						size={40}
						className="animate-spin text-[var(--aksob-primary)]"
					/>
				</div>
			) : events.length === 0 ? (
				<div className="relative w-full aspect-[16/11] min-h-[600px] max-h-[90vh] overflow-hidden rounded-2xl bg-[var(--gray-100)] flex items-center justify-center">
					<p className="text-[var(--gray-400)] text-lg">
						No events yet. Check back soon.
					</p>
				</div>
			) : (
				/* Showcase card */
				<div className="relative w-full aspect-[16/11] min-h-[600px] max-h-[90vh] overflow-hidden rounded-2xl cursor-pointer">
					{/* Background Images */}
					<div className="absolute inset-0 w-full h-full">
						{events.map((evt, idx) => (
							<img
								key={evt.id}
								src={evt.coverImage ?? "/home/showcase/round-table.png"}
								alt={evt.title}
								className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
									idx === activeIndex
										? "opacity-100 animate-ken-burns"
										: "opacity-0"
								}`}
							/>
						))}
						<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
					</div>

					{/* Top-left: Counter + Phase badge */}
					<div className="absolute top-6 left-6 md:top-10 md:left-10 z-10 flex flex-col gap-2">
						<div className="flex items-baseline text-white">
							<span className="text-4xl md:text-5xl font-light tabular-nums">
								{String(activeIndex + 1).padStart(2, "0")}
							</span>
							<span className="text-sm text-white/40 ml-2">
								/ {String(events.length).padStart(2, "0")}
							</span>
						</div>
						<span
							className={`text-xs tracking-[0.2em] uppercase font-medium ${PHASE_COLORS[activePhase]}`}
							style={{ fontFamily: "var(--font-display)" }}
						>
							{PHASE_LABELS[activePhase]}
						</span>
					</div>

					{/* Bottom content */}
					<div className="absolute bottom-0 left-0 right-0 z-10 p-6 md:p-10">
						{/* Title + metadata — smooth fade in/out on slide change */}
						<div
							className={`transition-all duration-300 ease-out ${
								textVisible
									? "opacity-100 translate-y-0"
									: "opacity-0 translate-y-3"
							}`}
						>
							<h3
								className="text-white text-3xl md:text-5xl font-medium leading-tight tracking-tight mb-1.5"
								style={{ fontFamily: "var(--font-display)" }}
							>
								{activeEvent?.title}
							</h3>
							<div className="flex items-center gap-3">
								<span
									className="text-white/60 text-xs tracking-widest uppercase"
									style={{ fontFamily: "var(--font-display)" }}
								>
									{activeEvent ? formatDate(activeEvent.startDate) : ""}
								</span>
								<span className="w-1 h-1 rounded-full bg-white/30" />
								<span
									className="text-white/60 text-xs tracking-widest uppercase"
									style={{ fontFamily: "var(--font-display)" }}
								>
									{activeEvent ? formatTime(activeEvent.startDate) : ""}
								</span>
								{activeEvent?.location && (
									<>
										<span className="w-1 h-1 rounded-full bg-white/30" />
										<span
											className="text-white/50 text-xs tracking-wide"
											style={{ fontFamily: "var(--font-display)" }}
										>
											{activeEvent.location}
										</span>
									</>
								)}
							</div>
						</div>

						{/* Progress bar + nav */}
						<div className="flex items-center gap-5 mt-6">
							<div className="flex-1 h-[2px] bg-white/15 rounded-full overflow-hidden">
								<div
									className="h-full bg-white transition-all duration-100 ease-linear"
									style={{ width: `${progress}%` }}
								/>
							</div>

							<div className="flex gap-2.5">
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										handlePrev();
									}}
									className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200 cursor-pointer"
									aria-label="Previous event"
								>
									<ChevronLeft className="w-5 h-5" />
								</button>
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										handleNext();
									}}
									className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200 cursor-pointer"
									aria-label="Next event"
								>
									<ChevronRight className="w-5 h-5" />
								</button>
							</div>
						</div>
					</div>

					{/* Click to navigate to events page */}
					<Link
						to="/events"
						className="absolute inset-0 z-0"
						aria-label="View all events"
					/>
				</div>
			)}
		</section>
	);
}
