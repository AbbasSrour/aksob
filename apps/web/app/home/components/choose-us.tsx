import type { LucideIcon } from "lucide-react";
import { Building2, Globe, GraduationCap, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ChooseUsCard = {
	number: string;
	icon: LucideIcon;
	title: string;
	description: string;
};

const CARDS: ChooseUsCard[] = [
	{
		number: "01",
		icon: GraduationCap,
		title: "Top-Ranked Education",
		description:
			"Backed by AKSOB's top-ranked business education — consistently recognized among the region's leading schools for academic excellence across business, analytics, and management.",
	},
	{
		number: "02",
		icon: Building2,
		title: "World-Class Faculty",
		description:
			"Students learn from renowned scholars and industry leaders at the forefront of research, policy, entrepreneurship, and innovation.",
	},
	{
		number: "03",
		icon: Users,
		title: "Vibrant Community",
		description:
			"Beyond graduation, you belong to a close-knit alumni community built on mentorship, support, and lifelong connection.",
	},
	{
		number: "04",
		icon: Globe,
		title: "Global Network & Impact",
		description:
			"AKSOB alumni span countries, sectors, and industries, creating a network whose influence reaches across continents and communities.",
	},
];

function ValueCard({
	card,
	className = "",
	delay,
	isVisible,
	featured = false,
}: {
	card: ChooseUsCard;
	className?: string;
	delay: string;
	isVisible: boolean;
	featured?: boolean;
}) {
	const Icon = card.icon;

	return (
		<article
			className={`${className} ${isVisible ? "animate-editorial-slide-up" : "opacity-0"}`}
			style={{ animationDelay: delay }}
		>
			<div
				className={`group flex h-full min-h-0 flex-col rounded-[20px] border border-white/[0.09] ${featured ? "bg-white/[0.085] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" : "bg-[#101211]/80"} p-7 md:p-8 transition-colors duration-300 hover:bg-white/[0.07]`}
			>
				<span
					className="text-[18px] font-light leading-none text-(--aksob-secondary)"
					style={{ fontFamily: "var(--font-display)" }}
				>
					{card.number}
				</span>

				<div className="mt-auto min-h-0 pt-10">
					<Icon className="mb-6 h-9 w-9 text-white" strokeWidth={1.5} />

					<h3
						className="text-[22px] font-light leading-tight tracking-[-0.03em] text-white"
						style={{ fontFamily: "var(--font-display)" }}
					>
						{card.title}
					</h3>

					<p
						className="mt-4 text-[14px] leading-[1.35] text-white/42"
						style={{ fontFamily: "var(--font-display)" }}
					>
						{card.description}
					</p>
				</div>
			</div>
		</article>
	);
}

export function ChooseUs() {
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
			{ threshold: 0.12 },
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<section ref={sectionRef} className="relative z-10 py-16 md:py-24">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="relative overflow-hidden rounded-[20px] bg-[#0f1110] md:rounded-[22px] lg:min-h-[900px]">
					<div className="pointer-events-none absolute inset-0 hidden lg:block">
						{[18, 34, 77, 93].map((pos) => (
							<div
								key={pos}
								className="absolute top-0 bottom-0 w-px bg-white/[0.075]"
								style={{ left: `${pos}%` }}
							/>
						))}
					</div>

					{/* Desktop composition: intentionally absolute to match the reference. */}
					<div className="relative hidden min-h-[900px] lg:block">
						<div className="absolute top-11 left-[3%] xl:left-[2.8%]">
							<span
								className={`text-[15px] font-light italic leading-none text-white ${isVisible ? "animate-editorial-fade" : "opacity-0"}`}
								style={{
									fontFamily: "var(--font-display)",
									animationDelay: "0.1s",
								}}
							>
								Why Choose us
							</span>

							<h2
								className={`mt-6 max-w-[680px] text-[60px] font-light leading-[0.98] tracking-[-0.055em] text-white xl:text-[64px] ${isVisible ? "animate-editorial-reveal" : "opacity-0"}`}
								style={{
									fontFamily: "var(--font-display)",
									animationDelay: "0.2s",
								}}
							>
								A Legacy of Excellence, a Future of Possibility
							</h2>
						</div>

						<p
							className={`absolute top-[32%] left-[18.2%] max-w-[360px] text-[15px] leading-[1.2] text-white/38 ${isVisible ? "animate-editorial-slide-up" : "opacity-0"}`}
							style={{
								fontFamily: "var(--font-display)",
								animationDelay: "0.36s",
							}}
						>
							From world-renowned academics to a powerful global alumni network,
							discover what sets the AKSOB Alumni community apart — and why it's the
							first choice for professionals, entrepreneurs, and leaders from around
							the globe.
						</p>

						<ValueCard
							card={CARDS[2]}
							className="absolute top-[30%] left-[54%] h-[280px] w-[24%]"
							delay="0.5s"
							featured
							isVisible={isVisible}
						/>
						<ValueCard
							card={CARDS[0]}
							className="absolute bottom-[3%] left-[2%] h-[280px] w-[24%]"
							delay="0.62s"
							isVisible={isVisible}
						/>
						<ValueCard
							card={CARDS[1]}
							className="absolute bottom-[3%] left-[30%] h-[280px] w-[24%]"
							delay="0.72s"
							isVisible={isVisible}
						/>
						<ValueCard
							card={CARDS[3]}
							className="absolute right-[2%] bottom-[3%] h-[280px] w-[24%]"
							delay="0.82s"
							isVisible={isVisible}
						/>
					</div>

					{/* Mobile/tablet fallback keeps the same visual language without cramped absolutes. */}
					<div className="relative p-7 sm:p-10 lg:hidden">
						<span
							className={`text-sm font-light italic text-white ${isVisible ? "animate-editorial-fade" : "opacity-0"}`}
							style={{
								fontFamily: "var(--font-display)",
								animationDelay: "0.1s",
							}}
						>
							Why Choose us
						</span>

						<h2
							className={`mt-5 text-4xl font-light leading-[1.02] tracking-[-0.055em] text-white sm:text-5xl ${isVisible ? "animate-editorial-reveal" : "opacity-0"}`}
							style={{
								fontFamily: "var(--font-display)",
								animationDelay: "0.2s",
							}}
						>
							A Legacy of Excellence, a Future of Possibility
						</h2>

						<p
							className={`mt-10 max-w-lg text-sm leading-relaxed text-white/45 ${isVisible ? "animate-editorial-slide-up" : "opacity-0"}`}
							style={{
								fontFamily: "var(--font-display)",
								animationDelay: "0.35s",
							}}
						>
							From world-renowned academics to a powerful global alumni network,
							discover what sets the AKSOB Alumni community apart — and why it's the
							first choice for professionals, entrepreneurs, and leaders from around
							the globe.
						</p>

						<div className="mt-10 grid gap-5 sm:grid-cols-2">
							{CARDS.map((card, index) => (
								<ValueCard
									key={card.number}
									card={card}
									className="min-h-[300px]"
									delay={`${0.5 + index * 0.1}s`}
									featured={card.number === "03"}
									isVisible={isVisible}
								/>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
