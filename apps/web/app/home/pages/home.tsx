import { useEffect, useState } from "react";

import { ChooseUs } from "~/app/home/components/choose-us";
import { Contact } from "~/app/home/components/contact";
import { EventSpotlight } from "~/app/home/components/event-spotlight";
import { SuccessStories } from "~/app/home/components/success-stories";
import { Glance } from "~/app/home/components/glance";
import { Hero } from "~/app/home/components/hero";
import { News } from "~/app/home/components/news";
import { Programs } from "~/app/home/components/programs";

const LINE_DELAYS = ["0ms", "150ms", "300ms", "450ms", "600ms"];
const SCROLL_LINE_DELAY_MS = 180;
const PAGE_END_THRESHOLD = 80;
const GRID_LINE_POSITIONS = [0, 20, 40, 80];

export default function HomePage() {
	const [isAtPageEnd, setIsAtPageEnd] = useState(false);

	useEffect(() => {
		function onScroll() {
			const distanceFromEnd =
				document.documentElement.scrollHeight -
				(window.scrollY + window.innerHeight);

			setIsAtPageEnd(distanceFromEnd <= PAGE_END_THRESHOLD);
		}

		window.addEventListener("scroll", onScroll, { passive: true });
		onScroll();

		return () => {
			window.removeEventListener("scroll", onScroll);
		};
	}, []);

	return (
		<main className="relative min-h-screen bg-(--off-white)">
			{/* Editorial grid lines — fixed half-screen layer */}
			<div className="fixed inset-0 pointer-events-none z-[5]">
				<div className="mx-auto max-w-7xl h-full relative">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className={`absolute top-0 overflow-hidden transition-[height] duration-1000 ease-out ${
								isAtPageEnd ? "h-screen" : "h-[50vh]"
							}`}
							style={{ left: `${GRID_LINE_POSITIONS[i]}%` }}
						>
							<div
								className="w-0.5 h-full bg-[#e5e7eb] animate-grid-line"
								style={{
									animationDelay: `${SCROLL_LINE_DELAY_MS + i * 70}ms`,
								}}
							/>
						</div>
					))}
				</div>
			</div>

			<div className="fixed inset-0 pointer-events-none z-[15]">
				<div className="mx-auto max-w-7xl h-full relative">
					{[0, 4].map((i) => (
						<div
							key={i}
							className={`absolute top-0 overflow-hidden transition-[height] duration-1000 ease-out ${
								isAtPageEnd ? "h-screen" : "h-[50vh]"
							}`}
							style={{
								left: i === 0 ? 0 : undefined,
								right: i === 4 ? 0 : undefined,
							}}
						>
							<div
								className="w-0.5 h-full bg-[#e5e7eb] animate-grid-line"
								style={{
									animationDelay: `${SCROLL_LINE_DELAY_MS + i * 70}ms`,
								}}
							/>
						</div>
					))}
				</div>
			</div>

			<div className="relative">
				{/* Editorial grid lines — hero load layer */}
				<div className="absolute top-0 left-0 right-0 h-screen pointer-events-none z-[5]">
					<div className="mx-auto max-w-7xl h-full relative">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="absolute top-0 bottom-0 overflow-hidden"
								style={{ left: `${GRID_LINE_POSITIONS[i]}%` }}
							>
								<div
									className="w-0.5 h-full bg-[#e5e7eb] animate-grid-line"
									style={{ animationDelay: LINE_DELAYS[i] }}
								/>
							</div>
						))}
					</div>
				</div>

				<div className="absolute top-0 left-0 right-0 h-screen pointer-events-none z-[15]">
					<div className="mx-auto max-w-7xl h-full relative">
						{[0, 4].map((i) => (
							<div
								key={i}
								className="absolute top-0 bottom-0 overflow-hidden"
								style={{
									left: i === 0 ? 0 : undefined,
									right: i === 4 ? 0 : undefined,
								}}
							>
								<div
									className="w-0.5 h-full bg-[#e5e7eb] animate-grid-line"
									style={{ animationDelay: LINE_DELAYS[i] }}
								/>
							</div>
						))}
					</div>
				</div>

				<Hero />
			</div>
			<Glance />
			<SuccessStories />
			<div className="py-16 md:py-24" />
			<EventSpotlight />
			<div className="py-16 md:py-24" />
			<News />
			<Programs />
			<ChooseUs />
			<Contact />
		</main>
	);
}
