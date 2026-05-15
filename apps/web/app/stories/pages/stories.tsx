export default function StoriesPage() {
	return (
		<main className="min-h-screen bg-(--off-white) pt-20">
			<div className="max-w-7xl mx-auto px-6 py-16">
				<div className="text-center">
					<h1
						className="text-4xl md:text-5xl font-light text-(--aksob-darkest) tracking-[-0.01em]"
						style={{ fontFamily: "var(--font-display)" }}
					>
						Stories
					</h1>
					<p className="mt-4 text-lg text-[var(--gray-500)] max-w-2xl mx-auto">
						Read inspiring success stories and achievements from our alumni
						community.
					</p>
				</div>

				<div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="rounded-2xl border border-[var(--gray-200)] bg-white p-6 hover:shadow-md transition-shadow"
						>
							<div className="h-48 bg-[var(--pale-mint)] rounded-xl mb-4" />
							<span className="text-xs font-medium text-(--aksob-primary)">
								Career
							</span>
							<h3 className="mt-2 text-xl font-medium text-(--aksob-darkest)">
								Alumni Story {i}
							</h3>
							<p className="mt-2 text-sm text-[var(--gray-500)]">
								Coming soon — alumni stories will appear here.
							</p>
						</div>
					))}
				</div>
			</div>
		</main>
	);
}
