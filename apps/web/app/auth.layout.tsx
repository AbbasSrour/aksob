import { Link, Outlet } from "react-router";

export default function AuthLayout() {
	return (
		<div className="relative min-h-screen w-full overflow-hidden bg-linear-to-b from-(--pale-mint) via-(--off-white) to-white">
			<div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-(--aksob-primary)/12 blur-3xl" />
			<div className="pointer-events-none absolute right-8 top-8 h-56 w-56 rounded-full border border-(--aksob-primary)/15" />
			<div className="pointer-events-none absolute right-14 top-14 h-44 w-44 rounded-full border border-(--aksob-primary)/10" />
			<div className="pointer-events-none absolute right-24 top-24 h-2 w-2 rounded-full bg-(--aksob-primary)/60" />
			<div className="pointer-events-none absolute -left-32 top-56 h-72 w-72 rounded-full border border-(--aksob-primary)/20" />
			<div className="pointer-events-none absolute -bottom-28 right-[18%] h-72 w-72 rounded-full bg-(--aksob-muted)/12 blur-3xl" />
			<div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-linear-to-b from-white/45 to-transparent" />

			<div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-6 sm:px-8 sm:py-8">
				<main className="mx-auto flex w-full flex-1 items-center py-8 sm:py-10">
					<div className="w-full max-w-xl">
						<Outlet />
					</div>
				</main>

				<footer className="flex flex-wrap items-center justify-center gap-3 text-center text-xs text-(--gray-500)">
					<Link to="#" className="hover:text-(--aksob-primary) hover:underline">
						Help
					</Link>
					<span>•</span>
					<Link to="#" className="hover:text-(--aksob-primary) hover:underline">
						Privacy
					</Link>
					<span>•</span>
					<Link to="#" className="hover:text-(--aksob-primary) hover:underline">
						Terms
					</Link>
					<span className="hidden sm:inline">•</span>
					<span>© {new Date().getFullYear()} AKSOB Alumni Network</span>
				</footer>
			</div>
		</div>
	);
}
