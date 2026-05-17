import { useQuery } from "@tanstack/react-query";
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
			className={`block rounded-2xl border border-[var(--gray-200)] bg-white overflow-hidden hover:shadow-md transition-shadow group ${isVisible ? "animate-editorial-slide-up" : "opacity-0"}`}
			style={
				isVisible ? { animationDelay: `${0.2 + index * 0.1}s` } : undefined
			}
		>
			<div className="h-48 bg-[var(--pale-mint)] overflow-hidden">
				<img
					src={image}
					alt={article.title}
					className="h-full w-full object-cover transition-transform group-hover:scale-105"
				/>
			</div>
			<div className="p-6">
				{article.category && (
					<span className="text-xs font-medium text-(--aksob-primary)">
						{article.category.name}
					</span>
				)}
				<h3 className="mt-2 text-xl font-medium text-(--aksob-darkest) line-clamp-2 group-hover:text-(--aksob-primary) transition-colors">
					{article.title}
				</h3>
				<p className="mt-2 text-sm text-[var(--gray-500)] line-clamp-2">
					{article.excerpt}
				</p>
				<div className="mt-4 flex items-center justify-between text-xs text-[var(--gray-400)]">
					<span>{article.author.name}</span>
					<span>{formatDate(date)}</span>
				</div>
			</div>
		</Link>
	);
}

export default function NewsPage() {
	const sectionRef = useRef<HTMLElement>(null);
	const [isVisible, setIsVisible] = useState(false);

	const { data: response, isPending } = useQuery({
		queryKey: ["news", "list"],
		queryFn: () => listLatestNews(12),
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
			{ threshold: 0.1 },
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<main ref={sectionRef} className="min-h-screen bg-(--off-white)">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 md:pt-10 md:pb-32">
				{/* Header — centered editorial style */}
				<div className="text-center mb-16 md:mb-24">
					<span
						className={`text-xs font-semibold italic tracking-[0.15em] text-[var(--gray-400)] ${isVisible ? "animate-editorial-fade" : "opacity-0"}`}
						style={isVisible ? { animationDelay: "0.1s" } : undefined}
					>
						News
					</span>

					<h1
						className="mt-3 text-3xl md:text-5xl lg:text-[3.25rem] font-light leading-[1.05] tracking-[-0.01em] max-w-3xl mx-auto"
						style={{ fontFamily: "var(--font-display)" }}
					>
						<span
							className={`text-(--aksob-darkest) ${isVisible ? "animate-editorial-reveal" : "opacity-0"}`}
							style={isVisible ? { animationDelay: "0.2s" } : undefined}
						>
							What&rsquo;s Happening{" "}
						</span>
						<span
							className={`text-(--aksob-primary) ${isVisible ? "animate-editorial-reveal" : "opacity-0"}`}
							style={isVisible ? { animationDelay: "0.35s" } : undefined}
						>
						in Our Community{" "}
					</span>
				</h1>

				<p
					className={`mt-5 text-base md:text-lg text-[var(--gray-400)] max-w-xl mx-auto leading-relaxed ${isVisible ? "animate-editorial-fade" : "opacity-0"}`}
					style={
						isVisible ? { animationDelay: "0.5s" } : undefined
					}
				>
					The latest news, achievements, and announcements from the
					Adnan Kassar School of Business alumni network.
				</p>
			</div>

				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					{isPending &&
						Array.from({ length: 6 }).map((_, i) => (
							<div
								key={i}
								className="rounded-2xl border border-[var(--gray-200)] bg-white overflow-hidden animate-pulse"
							>
								<div className="h-48 bg-[var(--pale-mint)]" />
								<div className="p-6 space-y-3">
									<div className="h-3 w-20 bg-[var(--gray-200)] rounded" />
									<div className="h-5 w-full bg-[var(--gray-200)] rounded" />
									<div className="h-4 w-full bg-[var(--gray-200)] rounded" />
								</div>
							</div>
						))}

					{!isPending && articles.length === 0 && (
						<div className="col-span-full text-center py-12">
							<p className="text-[var(--gray-400)]">
								No news articles yet. Check back soon.
							</p>
						</div>
					)}

					{articles.map((article, index) => (
						<NewsCard
							key={article.id}
							article={article}
							index={index}
							isVisible={isVisible}
						/>
					))}
				</div>
			</div>
		</main>
	);
}
