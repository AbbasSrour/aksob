import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const NEWS = [
	{
		date: "10 Jun 2025",
		author: "AKSOB Editorial",
		title: "Alumni network reaches record 4,200 members across 38 countries",
		readTime: "5 min Read",
		image: "/home/events/event-1.jpg",
	},
	{
		date: "28 May 2025",
		author: "AKSOB Editorial",
		title: "AKSOB tops national business school rankings in 2025 report",
		readTime: "7 min Read",
		image: "/home/events/event-2.jpg",
	},
	{
		date: "12 May 2025",
		author: "AKSOB Editorial",
		title:
			"Faculty and graduates publish breakthrough research on sustainable finance",
		readTime: "4 min Read",
		image: "/home/events/event-3.jpg",
	},
];

function NewsCard({
	article,
	index,
	isVisible,
}: {
	article: (typeof NEWS)[number];
	index: number;
	isVisible: boolean;
}) {
	return (
		<article
			className={`flex flex-col cursor-pointer ${isVisible ? "animate-editorial-slide-up" : "opacity-0"}`}
			style={
				isVisible ? { animationDelay: `${0.2 + index * 0.12}s` } : undefined
			}
		>
			<div className="overflow-hidden rounded-xl">
				<img
					src={article.image}
					alt={article.title}
					className="h-72 w-full object-cover md:h-80"
				/>
			</div>

			<div className="mt-5 flex flex-col gap-2">
				<div className="flex items-center justify-between text-xs text-[var(--gray-400)]">
					<span>{article.date}</span>
					<span>{article.author}</span>
				</div>

				<h3
					className="text-lg font-semibold leading-snug text-(--aksob-darkest) tracking-[-0.01em]"
					style={{ fontFamily: "var(--font-display)" }}
				>
					{article.title}
				</h3>

			</div>
		</article>
	);
}

export function News() {
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
			{ threshold: 0.15 },
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<section ref={sectionRef} className="relative z-10 py-24 md:py-32">
			<div className="mx-auto max-w-7xl">
				<div className="mb-14 text-center md:mb-20">
					<span
						className={`text-xs font-semibold italic tracking-[0.15em] text-[var(--gray-400)] ${isVisible ? "animate-editorial-fade" : "opacity-0"}`}
						style={isVisible ? { animationDelay: "0.1s" } : undefined}
					>
						News
					</span>

					<h2
						className="mx-auto mt-5 max-w-4xl text-4xl font-light leading-[1.12] tracking-[-0.02em] text-(--aksob-darkest) md:text-[3.5rem]"
						style={{ fontFamily: "var(--font-display)" }}
					>
						<span
							className={isVisible ? "animate-editorial-reveal" : "opacity-0"}
							style={isVisible ? { animationDelay: "0.2s" } : undefined}
						>
							Discover the Latest AKSOB Alumni News
						</span>
					</h2>
				</div>

				<div className="grid grid-cols-1 gap-8 px-4 sm:px-6 md:grid-cols-3 md:gap-10 lg:px-8">
					{NEWS.map((article, index) => (
						<NewsCard
							key={article.title}
							article={article}
							index={index}
							isVisible={isVisible}
						/>
					))}
				</div>

				<div
					className={`mt-5 h-px w-full bg-[#e5e7eb] ${isVisible ? "animate-horizontal-grid-line" : "scale-x-0"}`}
					style={isVisible ? { animationDelay: "0.55s" } : undefined}
				/>

				<div className="grid grid-cols-1 gap-8 px-4 pt-5 sm:px-6 md:grid-cols-3 md:gap-10 lg:px-8">
					{NEWS.map((article, index) => (
						<div
							key={`${article.title}-meta`}
							className={`flex items-center justify-between text-xs text-[var(--gray-400)] ${isVisible ? "animate-editorial-fade" : "opacity-0"}`}
							style={
								isVisible
									? { animationDelay: `${0.65 + index * 0.08}s` }
									: undefined
							}
						>
							<span>{article.readTime}</span>
							<span className="inline-flex items-center gap-1.5 text-(--aksob-darkest) transition-colors duration-300 hover:text-(--aksob-primary)">
								<span>Read more</span>
								<ArrowRight size={14} />
							</span>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
