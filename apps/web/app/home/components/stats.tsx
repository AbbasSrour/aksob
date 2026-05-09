import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const STATS = [
	{
		label: "Alumni",
		value: "4,200+",
		description: "Across undergraduate and postgraduate levels",
		shape: "circle" as const,
	},
	{
		label: "Countries",
		value: "38",
		description: "Worldwide reach and global impact",
		shape: "diamond" as const,
	},
	{
		label: "Donors",
		value: "520+",
		description: "Active contributors supporting students",
		shape: "triangle" as const,
	},
	{
		label: "Placement",
		value: "96%",
		description: "Career placement rate within six months",
		shape: "hexagon" as const,
	},
];

function GeometricLines({ shape }: { shape: string }) {
	const lineColor = "bg-(--aksob-primary)";
	const baseClass = `${lineColor} pointer-events-none`;

	switch (shape) {
		case "circle":
			// Alumni: three horizontal lines, right-aligned, architectural
			return (
				<div className="absolute bottom-8 right-0 pointer-events-none">
					<div className={`${baseClass} h-px w-32 opacity-[0.06] mb-3`} />
					<div className={`${baseClass} h-px w-24 opacity-[0.04] mb-3 ml-8`} />
					<div className={`${baseClass} h-px w-16 opacity-[0.03] ml-16`} />
				</div>
			);
		case "diamond":
			// Countries: two diagonal lines crossing
			return (
				<div className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none overflow-hidden">
					<div
						className={`${baseClass} h-px w-40 opacity-[0.05] absolute bottom-12 right-[-20px]`}
						style={{ transform: "rotate(-35deg)" }}
					/>
					<div
						className={`${baseClass} h-px w-40 opacity-[0.04] absolute bottom-8 right-[-20px]`}
						style={{ transform: "rotate(-35deg)" }}
					/>
				</div>
			);
		case "triangle":
			// Donors: vertical pillars + horizontal base
			return (
				<div className="absolute bottom-8 right-6 pointer-events-none">
					<div className="flex gap-4 items-end">
						<div className={`${baseClass} w-px h-16 opacity-[0.05]`} />
						<div className={`${baseClass} w-px h-10 opacity-[0.04]`} />
						<div className={`${baseClass} w-px h-14 opacity-[0.05]`} />
					</div>
					<div className={`${baseClass} h-px w-20 opacity-[0.04] mt-2`} />
				</div>
			);
		case "hexagon":
			// Placement: single strong diagonal
			return (
				<div className="absolute bottom-0 right-0 w-40 h-40 pointer-events-none overflow-hidden">
					<div
						className={`${baseClass} h-px w-56 opacity-[0.06] absolute bottom-10 right-[-30px]`}
						style={{ transform: "rotate(-30deg)" }}
					/>
				</div>
			);
		default:
			return null;
	}
}

const ANIM_OUT_MS = 250;
const SWAP_MS = 50;
const ANIM_IN_MS = 300;

export function Stats() {
	const [currentPair, setCurrentPair] = useState(0);
	const [displayPair, setDisplayPair] = useState(0);
	const [phase, setPhase] = useState<"idle" | "out" | "swap" | "in">("idle");
	const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
	const totalPairs = Math.ceil(STATS.length / 2);

	const clearTimers = () => {
		if (timerRef.current) clearTimeout(timerRef.current);
	};

	const changePair = (newPair: number) => {
		if (phase !== "idle") return;
		setCurrentPair(newPair);
		setPhase("out");

		timerRef.current = setTimeout(() => {
			setPhase("swap");
			timerRef.current = setTimeout(() => {
				setDisplayPair(newPair);
				setPhase("in");
				timerRef.current = setTimeout(() => {
					setPhase("idle");
				}, ANIM_IN_MS);
			}, SWAP_MS);
		}, ANIM_OUT_MS);
	};

	useEffect(() => () => clearTimers(), []);

	const prevPair = () => {
		changePair(currentPair === 0 ? totalPairs - 1 : currentPair - 1);
	};

	const nextPair = () => {
		changePair(currentPair === totalPairs - 1 ? 0 : currentPair + 1);
	};

	const leftStat = STATS[displayPair * 2];
	const rightStat = STATS[displayPair * 2 + 1];

	const cardClass =
		phase === "out"
			? "opacity-0 translate-y-2"
			: phase === "swap"
				? "opacity-0 translate-y-2"
				: phase === "in"
					? "opacity-100 translate-y-0"
					: "opacity-100 translate-y-0";

	return (
		<section className="relative z-10 pt-8 md:pt-12 pb-24 md:pb-32">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Mobile heading */}
				<h2
					className="md:hidden text-3xl font-semibold tracking-tight text-(--aksob-darkest) mb-10"
					style={{ fontFamily: "var(--font-display)" }}
				>
					AKSOB Alumni at a<br />
					Glance
				</h2>

				<div className="flex">
					{/* Left — heading on the first line */}
					<div className="hidden md:block w-[40%] shrink-0 -ml-4 sm:-ml-6 lg:-ml-8">
						<h2
							className="text-4xl font-semibold tracking-tight text-(--aksob-darkest) leading-[1.1]"
							style={{ fontFamily: "var(--font-display)" }}
						>
							AKSOB at a<br />
							Glance
						</h2>
					</div>

					{/* Right — cards starting at 3rd line */}
					<div className="flex-1 md:pl-1">
						<div className="flex gap-5 items-start">
							{/* Left card */}
							<div
								className={`relative flex-1 min-h-[300px] flex flex-col bg-(--pale-mint) rounded-2xl overflow-hidden transition-all duration-300 ${cardClass}`}
							>
								<GeometricLines shape={leftStat.shape} />
								<div className="relative z-10 p-10 flex flex-col h-full">
									<span
										className="text-[10px] tracking-[0.25em] uppercase font-medium text-(--aksob-primary)"
										style={{ fontFamily: "var(--font-display)" }}
									>
										{leftStat.label}
									</span>
									<div className="mt-5 mb-8 w-full h-px bg-(--gray-200)" />
									<div
										className="text-6xl font-extralight tracking-tight text-(--aksob-darkest) leading-[0.9]"
										style={{ fontFamily: "var(--font-display)" }}
									>
										{leftStat.value}
									</div>
									<p className="mt-auto pt-8 text-[13px] text-(--gray-500) leading-relaxed">
										{leftStat.description}
									</p>
								</div>
							</div>

							{/* Right column */}
							<div className="w-[45%] flex flex-col gap-5">
								<div
									className={`relative min-h-[210px] flex flex-col bg-(--pale-mint) rounded-2xl overflow-hidden transition-all duration-300 ${cardClass}`}
								>
									<GeometricLines shape={rightStat.shape} />
									<div className="relative z-10 p-10 flex flex-col h-full">
										<span
											className="text-[10px] tracking-[0.25em] uppercase font-medium text-(--aksob-primary)"
											style={{ fontFamily: "var(--font-display)" }}
										>
											{rightStat.label}
										</span>
										<div className="mt-5 mb-8 w-full h-px bg-(--gray-200)" />
										<div
											className="text-6xl font-extralight tracking-tight text-(--aksob-darkest) leading-[0.9]"
											style={{ fontFamily: "var(--font-display)" }}
										>
											{rightStat.value}
										</div>
									</div>
								</div>

								<div className="flex gap-3">
									<button
										type="button"
										onClick={prevPair}
										className="flex items-center justify-center w-10 h-10 text-(--gray-400) hover:text-(--aksob-darkest) transition-colors duration-200 cursor-pointer"
									>
										<ChevronLeft className="w-5 h-5" />
									</button>
									<button
										type="button"
										onClick={nextPair}
										className="flex items-center justify-center w-10 h-10 text-(--gray-400) hover:text-(--aksob-darkest) transition-colors duration-200 cursor-pointer"
									>
										<ChevronRight className="w-5 h-5" />
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
