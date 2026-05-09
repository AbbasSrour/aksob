import { useEffect, useRef, useState } from "react";

// ─── Events data ─────────────────────────────────────────────────────

const EVENTS = [
	{
		id: 1,
		title: "AI and the Future of Ethics",
		year: "2025",
		location: "Sheldonian Theatre",
		image: "/home/events/event-1.jpg",
		span: "large" as const,
	},
	{
		id: 2,
		title: "Oxford Science Festival",
		year: "2025",
		location: "University Museum",
		image: "/home/events/event-2.jpg",
		span: "small" as const,
	},
	{
		id: 3,
		title: "Undergraduate Open Day",
		year: "2025",
		location: "On Campus (All Colleges)",
		image: "/home/events/event-3.jpg",
		span: "medium" as const,
	},
	{
		id: 4,
		title: "Shakespeare in the Garden",
		year: "2025",
		location: "Trinity Garden",
		image: "/home/events/event-4.jpg",
		span: "small" as const,
	},
	{
		id: 5,
		title: "The Future of Climate Research",
		year: "2025",
		location: "Sheldonian Theatre",
		image: "/home/events/event-5.jpg",
		span: "large" as const,
	},
];

// ─── Event card ──────────────────────────────────────────────────────

function EventCard({
	event,
	index,
	isVisible,
}: {
	event: (typeof EVENTS)[number];
	index: number;
	isVisible: boolean;
}) {
	const spanClasses = {
		large: "col-span-1 md:col-span-2 row-span-2",
		medium: "col-span-1 md:col-span-2 row-span-1",
		small: "col-span-1 row-span-1",
	};

	const heightClasses = {
		large: "h-[320px] md:h-[420px]",
		medium: "h-[260px] md:h-[300px]",
		small: "h-[260px] md:h-[300px]",
	};

	return (
		<div
			className={`group relative rounded-2xl overflow-hidden cursor-pointer ${spanClasses[event.span]} ${heightClasses[event.span]} ${isVisible ? "animate-editorial-slide-up" : "opacity-0"}`}
			style={
				isVisible ? { animationDelay: `${0.15 + index * 0.12}s` } : undefined
			}
		>
			{/* Image */}
			<img
				src={event.image}
				alt={event.title}
				className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
			/>

			{/* Gradient overlay — stronger at bottom for text legibility */}
			<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

			{/* Content — bottom-left */}
			<div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col gap-1">
				<h3
					className="text-white text-lg md:text-xl font-medium leading-tight tracking-tight"
					style={{ fontFamily: "var(--font-display)" }}
				>
					{event.title}
				</h3>
				<div className="flex items-center gap-3 mt-1">
					<span
						className="text-white/60 text-xs tracking-widest uppercase"
						style={{ fontFamily: "var(--font-display)" }}
					>
						{event.year}
					</span>
					<span className="w-1 h-1 rounded-full bg-white/30" />
					<span
						className="text-white/50 text-xs tracking-wide"
						style={{ fontFamily: "var(--font-display)" }}
					>
						{event.location}
					</span>
				</div>
			</div>

			{/* Hover border glow */}
			<div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 group-hover:ring-white/25 transition-all duration-500" />
		</div>
	);
}

// ─── Events section ──────────────────────────────────────────────────

export function Events() {
	const sectionRef = useRef<HTMLElement>(null);
	const [isVisible, setIsVisible] = useState(false);

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
		<section ref={sectionRef} className="relative z-10 py-24 md:py-32">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header — centered editorial style */}
				<div className="text-center mb-16 md:mb-24">
					<span
						className={`text-xs font-semibold italic tracking-[0.15em] text-[var(--gray-400)] ${isVisible ? "animate-editorial-fade" : "opacity-0"}`}
						style={isVisible ? { animationDelay: "0.1s" } : undefined}
					>
						Events
					</span>

					<h2
						className="mt-6 text-3xl md:text-5xl lg:text-[3.5rem] font-light leading-[1.15] tracking-[-0.01em] max-w-3xl mx-auto"
						style={{ fontFamily: "var(--font-display)" }}
					>
						<span
							className={`text-(--aksob-darkest) ${isVisible ? "animate-editorial-reveal" : "opacity-0"}`}
							style={isVisible ? { animationDelay: "0.2s" } : undefined}
						>
							Lectures, Conferences,{" "}
						</span>
						<span
							className={`text-(--aksob-primary) ${isVisible ? "animate-editorial-reveal" : "opacity-0"}`}
							style={isVisible ? { animationDelay: "0.35s" } : undefined}
						>
							Cultural Moments{" "}
						</span>
						<span
							className={`text-(--aksob-darkest) ${isVisible ? "animate-editorial-reveal" : "opacity-0"}`}
							style={isVisible ? { animationDelay: "0.5s" } : undefined}
						>
							& More
						</span>
					</h2>
				</div>

				{/* Masonry grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 auto-rows-auto">
					{/* Row 1: Large left + Small right */}
					<EventCard event={EVENTS[0]} index={0} isVisible={isVisible} />
					<EventCard event={EVENTS[1]} index={1} isVisible={isVisible} />

					{/* Row 2: Medium centered */}
					<EventCard event={EVENTS[2]} index={2} isVisible={isVisible} />

					{/* Row 3: Small left + Large right */}
					<EventCard event={EVENTS[3]} index={3} isVisible={isVisible} />
					<EventCard event={EVENTS[4]} index={4} isVisible={isVisible} />
				</div>
			</div>
		</section>
	);
}
