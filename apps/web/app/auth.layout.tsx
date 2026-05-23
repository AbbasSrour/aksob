import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Link, Outlet } from "react-router";
import { Toaster } from "sonner";
import { LoginGalaxyBackground } from "~/app/auth/components/login-galaxy-background";
import { LoginGlobElement } from "~/app/auth/components/login-glob-element";
import { LoginPathElement } from "~/app/auth/components/login-path-element";
import { createQueryClient } from "~/app/lib/query-client";

export default function AuthLayout() {
	const [queryClient] = useState(() => createQueryClient());

	return (
		<QueryClientProvider client={queryClient}>
			<div className="relative min-h-screen w-full overflow-hidden bg-linear-to-b from-(--pale-mint) via-(--off-white) to-white">
				<LoginGalaxyBackground />
				<LoginGlobElement />
				<LoginPathElement />

				<div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-6 sm:px-8 sm:py-8">
					<main className="mx-auto flex w-full flex-1 items-center py-8 sm:py-10">
						<div className="w-full max-w-xl">
							<Outlet />
						</div>
					</main>

					<footer className="flex flex-wrap items-center justify-center gap-3 text-center text-xs text-(--gray-500)">
						<Link
							to="#"
							className="hover:text-(--aksob-primary) hover:underline"
						>
							Help
						</Link>
						<span>•</span>
						<Link
							to="#"
							className="hover:text-(--aksob-primary) hover:underline"
						>
							Privacy
						</Link>
						<span>•</span>
						<Link
							to="#"
							className="hover:text-(--aksob-primary) hover:underline"
						>
							Terms
						</Link>
						<span className="hidden sm:inline">•</span>
						<span>© {new Date().getFullYear()} AKSOB Alumni Network</span>
					</footer>
				</div>
			</div>
			<Toaster richColors closeButton />
		</QueryClientProvider>
	);
}
