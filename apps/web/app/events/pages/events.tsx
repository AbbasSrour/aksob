import { Link } from "react-router";

export default function EventsPage() {
	return (
		<main className="min-h-screen bg-(--off-white) pt-20">
			<div className="max-w-7xl mx-auto px-6 py-16">
				<div className="text-center">
					<h1
						className="text-4xl md:text-5xl font-light text-(--aksob-darkest) tracking-[-0.01em]"
						style={{ fontFamily: "var(--font-display)" }}
					>
						Events
					</h1>
					<p className="mt-4 text-lg text-[var(--gray-500)] max-w-2xl mx-auto">
						Discover upcoming alumni events, workshops, and networking
						opportunities.
					</p>
				</div>

				<div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="rounded-2xl border border-[var(--gray-200)] bg-white p-6 hover:shadow-md transition-shadow"
						>
							<div className="h-48 bg-[var(--pale-mint)] rounded-xl mb-4" />
							<h3 className="text-xl font-medium text-(--aksob-darkest)">
								Event {i}
							</h3>
							<p className="mt-2 text-sm text-[var(--gray-500)]">
								Coming soon — event details will appear here.
							</p>
						</div>
					))}
				</div>
			</div>
		</main>
	);
}
