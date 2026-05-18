import { useQuery } from "@tanstack/react-query";
import { Calendar, FileText, Newspaper, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { listEvents } from "~/app/lib/events";
import { listNews } from "~/app/lib/news";
import { listStories } from "~/app/lib/stories";
import { LoadingSpinner } from "~/components/ui/loading-spinner";

type SearchResultType = "event" | "news" | "story";

interface SearchResult {
	type: SearchResultType;
	id: string;
	title: string;
	description: string;
}

const TYPE_CONFIG: Record<
	SearchResultType,
	{ icon: typeof Calendar; label: string; badgeClass: string }
> = {
	event: {
		icon: Calendar,
		label: "Event",
		badgeClass: "bg-[#FEF3C7] text-[var(--warning)]",
	},
	news: {
		icon: Newspaper,
		label: "News",
		badgeClass: "bg-[var(--pale-mint)] text-[var(--aksob-primary)]",
	},
	story: {
		icon: FileText,
		label: "Story",
		badgeClass: "bg-[#D1FAE5] text-[var(--success)]",
	},
};

function getResultHref(result: SearchResult): string {
	switch (result.type) {
		case "event":
			return `/events/${result.id}`;
		case "news":
			return `/news/${result.id}`;
		case "story":
			return `/stories/${result.id}`;
	}
}

interface NavbarSearchProps {
	isDark: boolean;
	navText: string;
}

export const NavbarSearch: React.FC<NavbarSearchProps> = ({
	isDark,
	navText,
}) => {
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	/* ── Debounce ── */
	useEffect(() => {
		const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
		return () => clearTimeout(timer);
	}, [query]);

	/* ── Click outside ── */
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	/* ── Escape to close ── */
	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") {
				setOpen(false);
				setQuery("");
			}
		}
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	/* ── Focus input when opening ── */
	useEffect(() => {
		if (open) {
			inputRef.current?.focus();
		}
	}, [open]);

	const shouldSearch = debouncedQuery.length >= 2 && open;

	/* ── Parallel queries ── */
	const eventsQuery = useQuery({
		queryKey: ["navbar-search", "events", debouncedQuery],
		queryFn: () =>
			listEvents({ search: debouncedQuery, limit: 5 }).then((r) => r.data),
		enabled: shouldSearch,
		staleTime: 60_000,
	});

	const newsQuery = useQuery({
		queryKey: ["navbar-search", "news", debouncedQuery],
		queryFn: () =>
			listNews({ search: debouncedQuery, limit: 5 }).then((r) => r.data),
		enabled: shouldSearch,
		staleTime: 60_000,
	});

	const storiesQuery = useQuery({
		queryKey: ["navbar-search", "stories", debouncedQuery],
		queryFn: () =>
			listStories({
				search: debouncedQuery,
				limit: 5,
				status: "approved",
			}).then((r) => r.data),
		enabled: shouldSearch,
		staleTime: 60_000,
	});

	/* ── Merge results ── */
	const results = useMemo(() => {
		const items: SearchResult[] = [];

		for (const event of eventsQuery.data ?? []) {
			items.push({
				type: "event",
				id: event.id,
				title: event.title,
				description: event.description,
			});
		}
		for (const article of newsQuery.data ?? []) {
			items.push({
				type: "news",
				id: article.id,
				title: article.title,
				description: article.excerpt,
			});
		}
		for (const story of storiesQuery.data ?? []) {
			items.push({
				type: "story",
				id: story.id,
				title: story.title,
				description: story.description,
			});
		}

		return items;
	}, [eventsQuery.data, newsQuery.data, storiesQuery.data]);

	const isSearching =
		shouldSearch &&
		(eventsQuery.isLoading || newsQuery.isLoading || storiesQuery.isLoading);
	const hasQuery = query.trim().length >= 2;
	const showDropdown = open && (hasQuery || isSearching);
	const noResults = hasQuery && !isSearching && results.length === 0;

	/* ── Navigate to result ── */
	function handleResultClick(result: SearchResult) {
		setOpen(false);
		setQuery("");
		navigate(getResultHref(result));
	}

	/* ── Handle input keydown (Enter navigates to first result) ── */
	function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Enter" && results.length > 0) {
			e.preventDefault();
			handleResultClick(results[0]);
		}
	}

	return (
		<div ref={containerRef} className="relative pointer-events-auto">
			{/* Search trigger + input */}
			<div
				className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 ${open ? "" : navText}`}
			>
				<button
					type="button"
					onClick={() => {
						if (!open) setOpen(true);
					}}
					className={`flex items-center gap-2 shrink-0 transition-colors duration-200 ${open ? (isDark ? "text-white/50" : "text-[var(--gray-400)]") : ""}`}
				>
					<Search size={18} strokeWidth={1.5} />
					<span
						className="overflow-hidden whitespace-nowrap text-[14px] font-medium transition-all duration-300"
						style={{
							fontFamily: "var(--font-display)",
							maxWidth: open ? 0 : "80px",
							opacity: open ? 0 : 1,
						}}
					>
						Search
					</span>
				</button>
				<input
					ref={inputRef}
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onKeyDown={handleInputKeyDown}
					placeholder="Search..."
					className={`bg-transparent border-none outline-none caret-(--aksob-primary) text-[14px] font-medium transition-all duration-300 ${
						isDark
							? "text-white placeholder:text-white/30"
							: "text-[var(--gray-700)] placeholder:text-[var(--gray-400)]"
					}`}
					style={{
						fontFamily: "var(--font-display)",
						maxWidth: open ? "200px" : 0,
						opacity: open ? 1 : 0,
						padding: 0,
					}}
				/>
			</div>

			{/* Results dropdown */}
			{showDropdown && (
				<div
					className={`absolute right-0 top-full mt-2 w-80 rounded-xl border shadow-lg overflow-hidden animate-slide-up ${
						isDark
							? "bg-[#1a2e29]/98 backdrop-blur-md border-white/10"
							: "bg-white border-[var(--gray-200)]"
					}`}
				>
					{isSearching && (
						<div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-[var(--gray-400)]">
							<LoadingSpinner size="sm" />
							Searching...
						</div>
					)}

					{noResults && (
						<div className="px-4 py-6 text-center text-sm text-[var(--gray-400)]">
							No results for &quot;{debouncedQuery}&quot;
						</div>
					)}

					{!isSearching && results.length > 0 && (
						<ul className="py-1">
							{results.map((result) => {
								const config = TYPE_CONFIG[result.type];
								const Icon = config.icon;

								return (
									<li key={`${result.type}-${result.id}`}>
										<button
											type="button"
											onClick={() => handleResultClick(result)}
											className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
												isDark
													? "hover:bg-white/5"
													: "hover:bg-[var(--gray-50)]"
											}`}
										>
											<span
												className={`mt-0.5 p-1 rounded-md shrink-0 ${config.badgeClass}`}
											>
												<Icon size={14} />
											</span>
											<div className="min-w-0 flex-1">
												<div className="flex items-center gap-2 mb-0.5">
													<span
														className={`text-[11px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${config.badgeClass}`}
													>
														{config.label}
													</span>
												</div>
												<p
													className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-(--aksob-darkest)"}`}
													style={{
														fontFamily: "var(--font-display)",
													}}
												>
													{result.title}
												</p>
												{result.description && (
													<p className="text-xs text-[var(--gray-400)] truncate mt-0.5">
														{result.description}
													</p>
												)}
											</div>
										</button>
									</li>
								);
							})}
						</ul>
					)}
				</div>
			)}
		</div>
	);
};
