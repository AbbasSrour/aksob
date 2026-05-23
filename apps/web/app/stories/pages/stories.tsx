import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

import {
	listApprovedStories,
	STORY_CATEGORY_LABELS,
	type Story,
} from "~/app/lib/stories";
import { Avatar } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";

export default function StoriesPage() {
	const sectionRef = useRef<HTMLElement>(null);
	const [isVisible, setIsVisible] = useState(false);

	const { data, isLoading } = useQuery({
		queryKey: ["stories"],
		queryFn: () => listApprovedStories(50).then((r) => r.data),
	});

	const stories = data ?? [];

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
						Success Stories
					</span>
					<h1
						className="mt-3 text-4xl md:text-5xl font-light text-(--aksob-darkest) tracking-[-0.01em]"
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
							To the World
						</span>
					</h1>
					<p
						className={`mt-4 text-lg text-[var(--gray-500)] max-w-2xl mx-auto ${isVisible ? "animate-editorial-fade" : "opacity-0"}`}
						style={isVisible ? { animationDelay: "0.5s" } : undefined}
					>
						Read inspiring journeys from our alumni community.
					</p>
				</div>

				{/* Stories Grid */}
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
				) : stories.length === 0 ? (
					<div className="text-center py-20">
						<div className="w-16 h-16 bg-[var(--gray-100)] rounded-full flex items-center justify-center mx-auto mb-4">
							<Calendar size={24} className="text-[var(--gray-400)]" />
						</div>
						<p className="text-sm text-[var(--gray-500)]">No stories yet.</p>
					</div>
				) : (
					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
						{stories.map((story, index) => (
							<StoryCard
								key={story.id}
								story={story}
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

function StoryCard({
	story,
	index,
	isVisible,
}: {
	story: Story;
	index: number;
	isVisible: boolean;
}) {
	const dateStr = story.storyDate
		? new Date(story.storyDate).toLocaleDateString("en-US", {
				year: "numeric",
				month: "short",
			})
		: "";

	const wordCount = story.content
		? story.content
				.replace(/<[^>]*>/g, " ")
				.replace(/\s+/g, " ")
				.trim()
				.split(" ").length
		: 0;
	const readTime = Math.max(1, Math.ceil(wordCount / 200));

	return (
		<Link
			to={`/stories/${story.id}`}
			className={`group flex flex-col rounded-2xl border border-[var(--gray-200)] bg-white overflow-hidden hover:shadow-md transition-shadow ${isVisible ? "animate-editorial-slide-up" : "opacity-0"}`}
			style={
				isVisible ? { animationDelay: `${0.2 + index * 0.1}s` } : undefined
			}
		>
			{/* Cover */}
			<div className="aspect-[16/9] overflow-hidden bg-[var(--pale-mint)]">
				{story.coverImage ? (
					<img
						src={story.coverImage}
						alt={story.title}
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
						{STORY_CATEGORY_LABELS[story.category] ?? story.category}
					</Badge>
					{dateStr && (
						<span className="text-xs text-[var(--gray-400)]">{dateStr}</span>
					)}
				</div>

				<h3
					className="text-lg font-semibold text-(--aksob-darkest) line-clamp-2 group-hover:text-(--aksob-primary) transition-colors"
					style={{ fontFamily: "var(--font-display)" }}
				>
					{story.title}
				</h3>

				<p className="text-sm text-[var(--gray-500)] mt-2 line-clamp-2 flex-1">
					{story.description}
				</p>

				{/* Footer */}
				<div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--gray-100)]">
					<div className="flex items-center gap-2">
						<Avatar
							name={story.author.name}
							src={story.author.image ?? undefined}
							size="xs"
						/>
						<span className="text-xs text-[var(--gray-500)]">
							{story.author.name}
						</span>
					</div>
					<span className="text-xs text-[var(--gray-400)] flex items-center gap-1">
						<Clock size={12} />
						{readTime} min
					</span>
				</div>
			</div>
		</Link>
	);
}
