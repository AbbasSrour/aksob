import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─── Featured event data (names from images) ──────────────────────────

const FEATURED_EVENTS = [
	{
		id: 1,
		title: "Round Table",
		date: "March 15, 2025",
		time: "6:00 PM",
		location: "Sheldonian Theatre",
		status: "Registration Open" as const,
		image: "/home/showcase/round-table.png",
	},
	{
		id: 2,
		title: "The Spark of Young Mind",
		date: "April 22, 2025",
		time: "4:30 PM",
		location: "University Museum",
		status: "Limited Seats" as const,
		image: "/home/showcase/the-spark-of-young-mind.png",
	},
	{
		id: 3,
		title: "Let the Experience Talk",
		date: "May 8, 2025",
		time: "7:00 PM",
		location: "Trinity Garden",
		status: "Featured" as const,
		image: "/home/showcase/let-the-experience-talk.png",
	},
];

const AUTO_ADVANCE_MS = 5000;

// ─── Event Spotlight section ─────────────────────────────────────────

export function EventSpotlight() {
	const sectionRef = useRef<HTMLElement>(null);
	const [isVisible, setIsVisible] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	const [progress, setProgress] = useState(0);
	const [textVisible, setTextVisible] = useState(true);

	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
		if (!isVisible) return;

		const startTime = Date.now();
		intervalRef.current = setInterval(() => {
			const elapsed = Date.now() - startTime;
			const newProgress = Math.min((elapsed / AUTO_ADVANCE_MS) * 100, 100);
			setProgress(newProgress);

			if (newProgress >= 100) {
				if (intervalRef.current) clearInterval(intervalRef.current);
				goToSlide((activeIndex + 1) % FEATURED_EVENTS.length);
			}
		}, 50);

		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeIndex, isVisible]);

	function goToSlide(nextIndex: number) {
		setTextVisible(false);
		setProgress(0);
		setTimeout(() => {
			setActiveIndex(nextIndex);
			setTextVisible(true);
		}, 250);
	}

	function handlePrev() {
		goToSlide(
			(activeIndex - 1 + FEATURED_EVENTS.length) % FEATURED_EVENTS.length,
		);
	}

	function handleNext() {
		goToSlide((activeIndex + 1) % FEATURED_EVENTS.length);
	}

	const activeEvent = FEATURED_EVENTS[activeIndex];

	return (
		<section
			ref={sectionRef}
			className="relative z-[20] w-full max-w-[90rem] mx-auto"
		>
			{/* Showcase card */}
			<div className="relative w-full aspect-[16/11] min-h-[600px] max-h-[90vh] overflow-hidden rounded-2xl cursor-pointer">
				{/* Background Images */}
				<div className="absolute inset-0 w-full h-full">
					{FEATURED_EVENTS.map((evt, idx) => (
						<img
							key={evt.id}
							src={evt.image}
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

				{/* Top-left: Counter + Status */}
				<div className="absolute top-6 left-6 md:top-10 md:left-10 z-10 flex flex-col gap-2">
					<div className="flex items-baseline text-white">
						<span className="text-4xl md:text-5xl font-light tabular-nums">
							{String(activeIndex + 1).padStart(2, "0")}
						</span>
						<span className="text-sm text-white/40 ml-2">
							/ {String(FEATURED_EVENTS.length).padStart(2, "0")}
						</span>
					</div>
					<span className="text-white/50 text-xs tracking-[0.2em] uppercase">
						{activeEvent.status}
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
							{activeEvent.title}
						</h3>
						<div className="flex items-center gap-3">
							<span
								className="text-white/60 text-xs tracking-widest uppercase"
								style={{ fontFamily: "var(--font-display)" }}
							>
								{activeEvent.date}
							</span>
							<span className="w-1 h-1 rounded-full bg-white/30" />
							<span
								className="text-white/60 text-xs tracking-widest uppercase"
								style={{ fontFamily: "var(--font-display)" }}
							>
								{activeEvent.time}
							</span>
							<span className="w-1 h-1 rounded-full bg-white/30" />
							<span
								className="text-white/50 text-xs tracking-wide"
								style={{ fontFamily: "var(--font-display)" }}
							>
								{activeEvent.location}
							</span>
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
			</div>
		</section>
	);
}
