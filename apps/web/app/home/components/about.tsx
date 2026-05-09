import { useEffect, useRef, useState } from "react";

export function About() {
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
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex">
					{/* Spacer up to the 3rd line */}
					<div className="hidden md:block w-[40%] shrink-0" />

					{/* Content — starts at 3rd line, spans to last line */}
					<div className="flex-1 md:pl-1">
						<span
							className={`text-xs font-semibold italic tracking-[0.15em] text-[var(--gray-400)] ${isVisible ? "animate-editorial-fade" : "opacity-0"}`}
							style={isVisible ? { animationDelay: "0.1s" } : undefined}
						>
							About us
						</span>

						<h2 className="mt-6 text-3xl md:text-4xl font-light leading-[1.25] tracking-[-0.01em]">
							<span
								className={`text-(--aksob-darkest) ${isVisible ? "animate-slide-in-left" : "opacity-0"}`}
								style={isVisible ? { animationDelay: "0.2s" } : undefined}
							>
								A living network of faculty, alumni, and students
							</span>{" "}
							<span
								className={`text-[var(--gray-400)] ${isVisible ? "animate-slide-in-right" : "opacity-0"}`}
								style={isVisible ? { animationDelay: "0.4s" } : undefined}
							>
								— mentoring, researching, and shaping the future of business
								education together.
							</span>
						</h2>
					</div>
				</div>
			</div>
		</section>
	);
}
