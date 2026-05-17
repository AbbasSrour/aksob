import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { listLatestNews, type NewsArticle } from "~/app/lib/news";

const PLACEHOLDER_IMAGE = "/home/events/event-1.jpg";

function formatDate(isoString: string | null): string {
	if (!isoString) return "";
	return new Date(isoString).toLocaleDateString("en-US", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

function formatReadTime(minutes: number | null): string {
	if (!minutes) return "";
	return `${minutes} min Read`;
}

function NewsCard({
	article,
	index,
	isVisible,
}: {
	article: NewsArticle;
	index: number;
	isVisible: boolean;
}) {
	const date = article.date ?? article.publishedAt;
	const image = article.coverImage ?? PLACEHOLDER_IMAGE;

	return (
		<Link
			to={`/news/${article.id}`}
			className={`flex flex-col group ${isVisible ? "animate-editorial-slide-up" : "opacity-0"}`}
			style={
				isVisible ? { animationDelay: `${0.2 + index * 0.12}s` } : undefined
			}
		>
			<div className="overflow-hidden rounded-xl">
				<img
					src={image}
					alt={article.title}
					className="h-72 w-full object-cover md:h-80 transition-transform group-hover:scale-105"
				/>
			</div>

			<div className="mt-5 flex flex-col gap-2">
				<div className="flex items-center justify-between text-xs text-[var(--gray-400)]">
					<span>{formatDate(date)}</span>
					<span>{article.author.name}</span>
				</div>

				<h3
					className="text-lg font-semibold leading-snug text-(--aksob-darkest) tracking-[-0.01em] group-hover:text-(--aksob-primary) transition-colors"
					style={{ fontFamily: "var(--font-display)" }}
				>
					{article.title}
				</h3>
			</div>
		</Link>
	);
}

export function News() {
	const sectionRef = useRef<HTMLElement>(null);
	const [isVisible, setIsVisible] = useState(false);

	const { data: response, isPending } = useQuery({
		queryKey: ["news", "latest"],
		queryFn: () => listLatestNews(3),
	});

	const articles = response?.data ?? [];

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
		<section ref={sectionRef} className="relative z-10 pt-12 pb-24 md:pt-16 md:pb-32">
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

				{!isPending && articles.length === 0 && (
					<p className="text-center text-[var(--gray-400)]">
						No news articles yet.
					</p>
				)}

				{articles.length > 0 && (
					<>
						<div className="grid grid-cols-1 gap-8 px-4 sm:px-6 md:grid-cols-3 md:gap-10 lg:px-8">
							{articles.map((article, index) => (
								<NewsCard
									key={article.id}
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
							{articles.map((article, index) => (
								<div
									key={`${article.id}-meta`}
									className={`flex items-center justify-between text-xs text-[var(--gray-400)] ${isVisible ? "animate-editorial-fade" : "opacity-0"}`}
									style={
										isVisible
											? { animationDelay: `${0.65 + index * 0.08}s` }
											: undefined
									}
								>
									<span>{formatReadTime(article.readTime)}</span>
									<span className="inline-flex items-center gap-1.5 text-(--aksob-darkest) transition-colors duration-300 hover:text-(--aksob-primary)">
										<Link to={`/news/${article.id}`}>
											<span>Read more</span>
										</Link>
										<ArrowRight size={14} />
									</span>
								</div>
							))}
						</div>
					</>
				)}
			</div>
		</section>
	);
}
