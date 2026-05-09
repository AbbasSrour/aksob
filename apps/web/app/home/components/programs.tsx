import { ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const PROGRAMS = [
	{
		number: "01",
		name: "Undergraduate",
		description:
			"World-class bachelor's degrees with personalized tutorials and a rich academic environment across business, analytics, and management.",
	},
	{
		number: "02",
		name: "Graduate",
		description:
			"Advanced master's and doctoral studies guided by leading researchers, designed to shape future leaders and experts.",
	},
	{
		number: "03",
		name: "Continuing Education",
		description:
			"Flexible learning for professionals and adults, offering online and in-person programs to support lifelong development.",
	},
	{
		number: "04",
		name: "Short Courses",
		description:
			"Quick, focused learning across diverse topics — ideal for upskilling, exploring new interests, or reconnecting with the AKSOB Alumni community.",
	},
];

export function Programs() {
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
			<div className="max-w-7xl mx-auto">
				{/* Header area — label, heading, and floating image */}
				<div className="relative mb-20 md:mb-28 px-4 sm:px-6 lg:px-8">
					{/* Small label */}
					<span
						className={`text-xs font-semibold italic tracking-[0.15em] text-[var(--gray-400)] ${isVisible ? "animate-editorial-fade" : "opacity-0"}`}
					>
						Our Programs
					</span>

					{/* Heading with floating image */}
					<div className="relative mt-6">
						<h2
							className="text-3xl md:text-5xl lg:text-[3.5rem] font-light leading-[1.15] tracking-[-0.01em] max-w-2xl"
							style={{ fontFamily: "var(--font-display)" }}
						>
							<span
								className={`text-(--aksob-darkest) ${isVisible ? "animate-editorial-reveal" : "opacity-0"}`}
								style={isVisible ? { animationDelay: "0.2s" } : undefined}
							>
								A World-Class Range of{" "}
							</span>
							<span
								className={`text-(--aksob-primary) ${isVisible ? "animate-editorial-reveal" : "opacity-0"}`}
								style={isVisible ? { animationDelay: "0.35s" } : undefined}
							>
								Academic Programs{" "}
							</span>
							<span
								className={`text-(--aksob-darkest) ${isVisible ? "animate-editorial-reveal" : "opacity-0"}`}
								style={isVisible ? { animationDelay: "0.5s" } : undefined}
							>
								for Every Ambition and Passion
							</span>
						</h2>

						{/* Floating architectural image */}
						<div
							className={`hidden lg:block absolute top-0 right-0 w-64 h-44 rounded-2xl overflow-hidden shadow-lg ${isVisible ? "animate-editorial-slide-up" : "opacity-0"}`}
							style={isVisible ? { animationDelay: "0.6s" } : undefined}
						>
							<img
								src="/home/hero/hero-1.png"
								alt="AKSOB Campus"
								className="w-full h-full object-cover"
							/>
						</div>
					</div>
				</div>

				{/* Program rows */}
				<div className="flex flex-col bg-(--off-white)">
					{PROGRAMS.map((program, index) => (
						<div key={program.number} className="relative">
							{/* Border — draws in from left */}
							<div
								className={`absolute top-0 left-0 right-0 h-px bg-[var(--gray-200)] ${isVisible ? "animate-row-draw" : "opacity-0"}`}
								style={
									isVisible
										? { animationDelay: `${1.2 + index * 0.12}s` }
										: undefined
								}
							/>
							{/* Bottom border on last row */}
							{index === PROGRAMS.length - 1 && (
								<div
									className={`absolute bottom-0 left-0 right-0 h-px bg-[var(--gray-200)] ${isVisible ? "animate-row-draw" : "opacity-0"}`}
									style={
										isVisible
											? { animationDelay: `${1.2 + (index + 1) * 0.12}s` }
											: undefined
									}
								/>
							)}

							{/* Content — slides up */}
							<div
								className={`group flex items-start gap-6 md:gap-10 px-6 md:px-10 py-8 md:py-10 hover:bg-[var(--pale-mint)]/40 transition-colors duration-300 cursor-pointer ${isVisible ? "animate-editorial-slide-up" : "opacity-0"}`}
								style={
									isVisible
										? { animationDelay: `${0.4 + index * 0.12}s` }
										: undefined
								}
							>
								{/* Number */}
								<span
									className="text-sm font-medium text-(--aksob-primary) w-8 shrink-0 pt-1"
									style={{ fontFamily: "var(--font-display)" }}
								>
									{program.number}
								</span>

								{/* Name */}
								<h3
									className="text-xl md:text-2xl font-medium text-(--aksob-darkest) w-48 md:w-64 shrink-0"
									style={{ fontFamily: "var(--font-display)" }}
								>
									{program.name}
								</h3>

								{/* Description */}
								<p className="flex-1 text-sm text-[var(--gray-500)] leading-relaxed pt-1">
									{program.description}
								</p>

								{/* Chevron */}
								<div className="shrink-0 w-10 h-10 rounded-full border border-[var(--gray-200)] flex items-center justify-center text-[var(--gray-400)] group-hover:border-(--aksob-primary) group-hover:text-(--aksob-primary) transition-colors duration-300">
									<ChevronRight size={16} />
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
