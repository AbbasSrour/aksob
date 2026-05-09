import { ArrowRight } from "lucide-react";

export function Hero() {
	return (
		<section className="relative z-20 pt-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
			{/* Geometric orbit — massive circle bleeding off right edge */}
			<div className="absolute top-1/2 left-[55%] -translate-y-1/2 pointer-events-none z-0">
				<svg
					width="1100"
					height="1100"
					viewBox="0 0 1100 1100"
					fill="none"
					className="animate-orbit-drift"
				>
					<circle
						cx="550"
						cy="550"
						r="548"
						stroke="#076951"
						strokeWidth="1"
						className="animate-orbit-reveal"
						style={{ animationDelay: "0.4s" }}
					/>
					<circle
						cx="550"
						cy="550"
						r="460"
						stroke="#076951"
						strokeWidth="1"
						className="animate-orbit-reveal"
						style={{ animationDelay: "0.6s" }}
					/>
					<circle
						cx="550"
						cy="550"
						r="370"
						stroke="#076951"
						strokeWidth="1"
						className="animate-orbit-reveal"
						style={{ animationDelay: "0.8s" }}
					/>
				</svg>
			</div>

			{/* Diagonal construction line */}
			<div
				className="absolute top-0 left-[30%] w-px pointer-events-none z-0 bg-(--aksob-primary)/[0.12] origin-top -rotate-[25deg] animate-diagonal-grow"
				style={{ animationDelay: "0.2s", height: "120%" }}
			/>

			<div className="max-w-7xl mx-auto relative">
				<div className="grid grid-cols-1 lg:grid-cols-5 gap-0 min-h-[85vh] items-end">
					{/* Left column — text, spans 2 grid columns */}
					<div className="lg:col-span-2 flex flex-col justify-between py-12 lg:py-16 lg:pr-6 relative">
						{/* Giant watermark */}
						<div
							className="absolute -top-8 -left-4 text-(--aksob-darkest)/[0.025] text-[10rem] md:text-[14rem] font-semibold leading-none select-none pointer-events-none z-0"
							style={{ fontFamily: "var(--font-display)" }}
						>
							AKSOB ALUMNI
						</div>

						<div className="relative z-10">
							<span
								className="text-[var(--aksob-secondary)] text-[10px] tracking-[0.3em] uppercase block animate-editorial-fade lg:pl-3"
								style={{
									fontFamily: "var(--font-display)",
									animationDelay: "0.2s",
								}}
							>
								Adnan Kassar School of Business
							</span>

							<div
								className="w-12 h-px bg-(--gray-300) mt-6 mb-10 animate-line-draw"
								style={{ animationDelay: "0.35s" }}
							/>

							<h1
								className="text-(--aksob-darkest) text-4xl md:text-5xl lg:text-6xl font-light leading-[1.05] tracking-tight lg:pl-3"
								style={{ fontFamily: "var(--font-display)" }}
							>
								<span
									className="block animate-editorial-reveal"
									style={{ animationDelay: "0.5s" }}
								>
									Where Ambition
								</span>
								<span
									className="block animate-editorial-reveal"
									style={{ animationDelay: "0.65s" }}
								>
									Meets Excellence
								</span>
							</h1>

							<p
								className="text-(--gray-500) text-base md:text-lg mt-10 max-w-sm leading-relaxed animate-editorial-slide-up lg:pl-3"
								style={{
									fontFamily: "var(--font-display)",
									animationDelay: "0.8s",
								}}
							>
								The AKSOB Alumni Network — a constellation of graduates, mentors,
								and industry leaders connected across the world.
							</p>
						</div>

						<div className="relative z-10 flex items-center gap-6 mt-16 lg:pl-3">
							<button
								type="button"
								className="group flex items-center gap-3 px-6 py-3 bg-(--aksob-primary) text-white text-xs tracking-[0.15em] uppercase font-medium rounded-full hover:bg-(--aksob-secondary) transition-colors cursor-pointer animate-editorial-slide-up"
								style={{ animationDelay: "1.0s" }}
							>
								Explore
								<ArrowRight
									size={14}
									className="group-hover:translate-x-1 transition-transform"
								/>
							</button>

							<span
								className="text-(--gray-400) text-[10px] tracking-[0.2em] uppercase animate-editorial-fade"
								style={{
									fontFamily: "var(--font-display)",
									animationDelay: "1.15s",
								}}
							>
								Scroll to discover
							</span>
						</div>
					</div>

					{/* Right image area — spans 3 columns, starting at 3rd grid line */}
					<div className="lg:col-span-3 relative h-[50vh] lg:h-[85vh] lg:-mr-8">
						<div className="absolute inset-0 rounded-[28px] overflow-hidden">
							<img
								src="/home/hero/hero-1.png"
								alt="AKSOB Campus"
								className="absolute inset-0 w-full h-full object-cover animate-ken-burns"
							/>
						</div>

						{/* Index number */}
						<div
							className="absolute top-8 right-8 z-10 animate-editorial-fade"
							style={{ animationDelay: "0.6s" }}
						>
							<span
								className="text-white/10 text-6xl md:text-7xl font-extralight leading-none select-none"
								style={{ fontFamily: "var(--font-display)" }}
							>
								01
							</span>
						</div>

						{/* Overlapping detail image */}
						<div
							className="absolute bottom-12 left-8 lg:-left-20 w-32 h-40 md:w-40 md:h-48 rounded-2xl overflow-hidden shadow-xl border-4 border-white z-10 animate-editorial-slide-up"
							style={{ animationDelay: "1.2s" }}
						>
							<img
								src="/home/hero/hero-2.jpg"
								alt="Community"
								className="w-full h-full object-cover"
							/>
						</div>

						{/* Bottom text bar */}
						<div
							className="absolute bottom-0 left-0 right-0 z-10 px-8 py-6 animate-editorial-slide-up"
							style={{ animationDelay: "1.4s" }}
						>
							<div className="flex items-end justify-between gap-6">
								<div className="flex flex-col gap-1">
									<span
										className="text-white/50 text-[10px] tracking-[0.2em] uppercase"
										style={{ fontFamily: "var(--font-display)" }}
									>
										2025
									</span>
									<span
										className="text-white/30 text-[10px] tracking-[0.25em] uppercase"
										style={{ fontFamily: "var(--font-display)" }}
									>
										Campus
									</span>
								</div>

								<div className="flex-1 flex flex-col items-center px-4">
									<h3
										className="text-white text-sm md:text-base font-light text-center max-w-lg leading-relaxed tracking-wide"
										style={{ fontFamily: "var(--font-display)" }}
									>
										World-class facilities designed to inspire
									</h3>
									<p
										className="text-white/50 text-xs text-center max-w-md mt-1 leading-relaxed"
										style={{ fontFamily: "var(--font-display)" }}
									>
										Innovation and academic growth across every discipline
									</p>
								</div>

								<div className="flex items-center gap-3">
									<button
										type="button"
										className="w-9 h-9 rounded-full border border-white/30 text-white/70 flex items-center justify-center hover:bg-white hover:text-(--aksob-darkest) hover:border-white transition-all cursor-pointer"
										aria-label="Previous"
									>
										<svg
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<path d="m15 18-6-6 6-6" />
										</svg>
									</button>
									<button
										type="button"
										className="w-9 h-9 rounded-full border border-white/30 text-white/70 flex items-center justify-center hover:bg-white hover:text-(--aksob-darkest) hover:border-white transition-all cursor-pointer"
										aria-label="Next"
									>
										<svg
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<path d="m9 18 6-6-6-6" />
										</svg>
									</button>
								</div>
							</div>
						</div>

						{/* Image caption */}
						<div
							className="absolute bottom-8 left-8 lg:left-auto lg:right-8 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 hidden lg:block animate-editorial-fade"
							style={{ animationDelay: "1.0s" }}
						>
							<span
								className="text-white/30 text-[9px] tracking-[0.15em] uppercase [writing-mode:vertical-rl] rotate-180"
								style={{ fontFamily: "var(--font-display)" }}
							>
								AKSOB Campus — Byblos
							</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
