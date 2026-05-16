import { useEffect, useRef, useState } from "react";

import {
	listApprovedStories,
	STORY_CATEGORY_LABELS,
	type Story,
} from "~/app/lib/stories";

// ─── Fallback placeholder stories ────────────────────────────────────

const FALLBACK_STORIES: Story[] = [
	{
		id: "fallback-1",
		title: "Leading AI Research at Google DeepMind",
		description:
			"From ACSOB labs to the forefront of artificial intelligence research.",
		content: "",
		coverImage: "/home/events/event-1.jpg",
		thumbnailImage: null,
		category: "career_advancement",
		storyDate: "2024-01-01T00:00:00.000Z",
		status: "approved",
		author: { id: "f1", name: "Nadia Hamdan", image: null, major: null },
		reviewedBy: null,
		reviewNotes: null,
		reviewedAt: null,
		createdAt: "2024-01-01T00:00:00.000Z",
		updatedAt: "2024-01-01T00:00:00.000Z",
	},
	{
		id: "fallback-2",
		title: "Launching a FinTech Startup in Dubai",
		description:
			"Turning a classroom project into a multi-million dollar company.",
		content: "",
		coverImage: "/home/events/event-2.jpg",
		thumbnailImage: null,
		category: "entrepreneurship",
		storyDate: "2024-06-01T00:00:00.000Z",
		status: "approved",
		author: { id: "f2", name: "Rami Chami", image: null, major: null },
		reviewedBy: null,
		reviewNotes: null,
		reviewedAt: null,
		createdAt: "2024-06-01T00:00:00.000Z",
		updatedAt: "2024-06-01T00:00:00.000Z",
	},
	{
		id: "fallback-3",
		title: "Award-Winning Architect Redesigning Beirut",
		description:
			"Using sustainable design to rebuild communities after the blast.",
		content: "",
		coverImage: "/home/events/event-3.jpg",
		thumbnailImage: null,
		category: "social_impact",
		storyDate: "2023-09-01T00:00:00.000Z",
		status: "approved",
		author: { id: "f3", name: "Layla Khoury", image: null, major: null },
		reviewedBy: null,
		reviewNotes: null,
		reviewedAt: null,
		createdAt: "2023-09-01T00:00:00.000Z",
		updatedAt: "2023-09-01T00:00:00.000Z",
	},
	{
		id: "fallback-4",
		title: "Publishing in Nature at 26",
		description:
			"A breakthrough in renewable energy research from our alumni labs.",
		content: "",
		coverImage: "/home/events/event-4.jpg",
		thumbnailImage: null,
		category: "academic_achievement",
		storyDate: "2024-03-01T00:00:00.000Z",
		status: "approved",
		author: { id: "f4", name: "Tarek Mansour", image: null, major: null },
		reviewedBy: null,
		reviewNotes: null,
		reviewedAt: null,
		createdAt: "2024-03-01T00:00:00.000Z",
		updatedAt: "2024-03-01T00:00:00.000Z",
	},
	{
		id: "fallback-5",
		title: "Chief Innovation Officer at Amazon MENA",
		description:
			"From student projects to shaping the future of cloud computing.",
		content: "",
		coverImage: "/home/events/event-5.jpg",
		thumbnailImage: null,
		category: "leadership",
		storyDate: "2024-08-01T00:00:00.000Z",
		status: "approved",
		author: { id: "f5", name: "Sarah Beydoun", image: null, major: null },
		reviewedBy: null,
		reviewNotes: null,
		reviewedAt: null,
		createdAt: "2024-08-01T00:00:00.000Z",
		updatedAt: "2024-08-01T00:00:00.000Z",
	},
];

// ─── Editorial story positions ────────────────────────────────────────

const CARD_LAYOUT = [
	{
		className: "md:left-0 md:top-0 md:w-[34%]",
		imageClassName: "h-[210px] md:h-[250px] lg:h-[290px]",
	},
	{
		className: "md:right-0 md:top-[-2%] md:w-[25%]",
		imageClassName: "h-[185px] md:h-[220px] lg:h-[255px]",
	},
	{
		className: "md:left-[27%] md:top-[36%] md:w-[34%]",
		imageClassName: "h-[205px] md:h-[250px] lg:h-[290px]",
	},
	{
		className: "md:left-0 md:top-[72%] md:w-[25%]",
		imageClassName: "h-[180px] md:h-[220px] lg:h-[255px]",
	},
	{
		className: "md:right-0 md:top-[72%] md:w-[34%]",
		imageClassName: "h-[210px] md:h-[250px] lg:h-[290px]",
	},
] as const;

// ─── Connection lines between cards (percentage coordinates) ──────────

interface ConnectionLine {
	id: string;
	d: string;
	delay: string;
}

const CONNECTION_LINES: ConnectionLine[] = [
	{
		id: "top-left-to-center",
		d: "M 34 16 C 42 16, 35 32, 27 50",
		delay: "0.5s",
	},
	{
		id: "top-right-to-center",
		d: "M 75 12 C 68 12, 68 32, 61 50",
		delay: "0.65s",
	},
	{
		id: "center-to-bottom-left",
		d: "M 27 54 C 22 62, 30 72, 25 82",
		delay: "0.8s",
	},
	{
		id: "center-to-bottom-right",
		d: "M 61 54 C 66 62, 61 72, 66 82",
		delay: "0.95s",
	},
];

// ─── Story card ──────────────────────────────────────────────────────

function StoryCard({
	story,
	layout,
	index,
	isVisible,
}: {
	story: Story;
	layout: (typeof CARD_LAYOUT)[number];
	index: number;
	isVisible: boolean;
}) {
	const year = story.storyDate
		? new Date(story.storyDate).getFullYear().toString()
		: "";

	return (
		<div
			className={`group relative md:absolute w-full ${layout.className} ${isVisible ? "animate-editorial-slide-up" : "opacity-0"}`}
			style={
				isVisible ? { animationDelay: `${0.15 + index * 0.12}s` } : undefined
			}
		>
			<div
				className={`relative overflow-hidden rounded-xl ${layout.imageClassName}`}
			>
				{story.coverImage ? (
					<img
						src={story.coverImage}
						alt={story.title}
						className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
					/>
				) : (
					<div className="w-full h-full bg-gradient-to-br from-[var(--aksob-primary)] to-[var(--aksob-secondary)]" />
				)}
			</div>

			<div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-sm leading-tight">
				<div>
					<h3
						className="text-black font-medium tracking-tight line-clamp-2"
						style={{ fontFamily: "var(--font-display)" }}
					>
						{story.title}
					</h3>
					{year && (
						<p
							className="text-[var(--gray-400)]"
							style={{ fontFamily: "var(--font-display)" }}
						>
							{year}
						</p>
					)}
				</div>
				<div
					className="max-w-[120px] text-right text-[var(--gray-400)]"
					style={{ fontFamily: "var(--font-display)" }}
				>
					<p className="text-black/70">{story.author.name}</p>
					<p>{STORY_CATEGORY_LABELS[story.category]}</p>
				</div>
			</div>
		</div>
	);
}

// ─── Connection Lines SVG ────────────────────────────────────────────

function ConnectionLines({ isVisible }: { isVisible: boolean }) {
	return (
		<svg
			className="pointer-events-none absolute inset-0 hidden overflow-visible md:block"
			viewBox="0 0 100 100"
			preserveAspectRatio="none"
			style={{ width: "100%", height: "100%" }}
		>
			{CONNECTION_LINES.map((line) => (
				<path
					key={line.id}
					d={line.d}
					fill="none"
					strokeWidth="0.15"
					className={`stroke-[#e5e7eb] ${isVisible ? "animate-grid-line" : ""}`}
					style={
						isVisible
							? {
									animationDelay: line.delay,
								}
							: undefined
					}
				/>
			))}
		</svg>
	);
}

// ─── Success Stories section ──────────────────────────────────────────

export function SuccessStories() {
	const sectionRef = useRef<HTMLElement>(null);
	const [isVisible, setIsVisible] = useState(false);
	const [stories, setStories] = useState<Story[]>(FALLBACK_STORIES);

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
		let isMounted = true;

		const loadStories = async () => {
			try {
				const response = await listApprovedStories(5);
				if (isMounted && response.data.length > 0) {
					setStories(response.data);
				}
			} catch {
				// Keep fallback stories
			}
		};

		void loadStories();

		return () => {
			isMounted = false;
		};
	}, []);

	return (
		<section ref={sectionRef} className="relative z-10 py-20 md:py-32">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-full max-w-7xl -translate-x-1/2 md:block">
					{[0, 20, 40, 80, 100].map((left) => (
						<div
							key={left}
							className="absolute top-0 h-full w-px bg-[#e5e7eb]"
							style={{ left: `${left}%` }}
						/>
					))}
				</div>

				{/* Header — centered editorial style */}
				<div className="text-center mb-16 md:mb-24">
					<span
						className={`text-xs font-semibold italic tracking-[0.15em] text-(--gray-400) ${isVisible ? "animate-editorial-fade" : "opacity-0"}`}
						style={isVisible ? { animationDelay: "0.1s" } : undefined}
					>
						Success Stories
					</span>

					<h2
						className="mt-3 text-3xl md:text-5xl lg:text-[3.25rem] font-light leading-[1.05] tracking-[-0.01em] max-w-3xl mx-auto"
						style={{ fontFamily: "var(--font-display)" }}
					>
						<span
							className={`text-(--aksob-darkest) ${isVisible ? "animate-editorial-reveal" : "opacity-0"}`}
							style={isVisible ? { animationDelay: "0.2s" } : undefined}
						>
							From Our Campus{" "}
						</span>
						<span
							className={`text-(--aksob-primary) ${isVisible ? "animate-editorial-reveal" : "opacity-0"}`}
							style={isVisible ? { animationDelay: "0.35s" } : undefined}
						>
							To the World{" "}
						</span>
					</h2>
				</div>

				{/* Editorial freeform layout */}
				<div className="relative flex flex-col gap-14 md:block md:h-262.5 lg:h-295">
					{/* Connection lines between cards */}
					<ConnectionLines isVisible={isVisible} />

					{stories.slice(0, 5).map((story, i) => (
						<StoryCard
							key={story.id}
							story={story}
							layout={CARD_LAYOUT[i % CARD_LAYOUT.length]}
							index={i}
							isVisible={isVisible}
						/>
					))}
				</div>
			</div>
		</section>
	);
}
