import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { signOut, useSession } from "~/app/lib/auth";
import { createQueryClient } from "~/app/lib/query-client";
import { Navbar } from "~/components/layout/navbar";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export default function AppLayout() {
	const [queryClient] = useState(() => createQueryClient());
	const location = useLocation();
	const navigate = useNavigate();
	const { data: session, isPending } = useSession();
	const isHome = location.pathname === "/";
	const isGalaxy = location.pathname === "/galaxy";
	const isChat = location.pathname.startsWith("/chat");
	const isOnboarding = location.pathname === "/onboarding";
	const isEventManagementRoute =
		location.pathname === "/events/new" ||
		/^\/events\/[^/]+\/edit$/.test(location.pathname);
	const isProtectedRoute =
		location.pathname.startsWith("/chat") ||
		location.pathname === "/profile" ||
		isEventManagementRoute;
	const isPublicRoute = isHome || isGalaxy || isOnboarding;

	const onboarding = (session?.user as Record<string, unknown>)?.onboarding as
		| string
		| undefined;
	const showNudge =
		session?.user &&
		onboarding !== "complete" &&
		!isOnboarding &&
		session.user.createdAt &&
		Date.now() - new Date(session.user.createdAt).getTime() > SEVEN_DAYS_MS;

	useEffect(() => {
		if (isPending) return;

		if (isProtectedRoute && !session?.user) {
			const redirectTo = encodeURIComponent(location.pathname);
			navigate(`/auth/login?redirectTo=${redirectTo}`);
			return;
		}

		if (
			session?.user &&
			(session.user.onboarding as string) !== "complete" &&
			!isPublicRoute
		) {
			navigate("/onboarding");
		}
	}, [
		isPending,
		isProtectedRoute,
		isPublicRoute,
		location.pathname,
		navigate,
		session?.user,
	]);

	const handleLogout = async () => {
		await signOut({
			fetchOptions: {
				onSuccess: () => {
					navigate("/auth/login");
				},
			},
		});
	};

	const user = session?.user
		? {
				id: session.user.id,
				name: session.user.name || session.user.email || "User",
				avatar: session.user.image || undefined,
			}
		: undefined;

	if (isProtectedRoute && (isPending || !session?.user)) {
		return null;
	}

	if (isPending) {
		return null;
	}

	return (
		<QueryClientProvider client={queryClient}>
			<div className="min-h-screen bg-(--off-white)">
				<Navbar user={user} onLogout={handleLogout} />
				{showNudge && (
					<div className="bg-[var(--aksob-primary)] text-white px-4 py-2.5 flex items-center justify-center gap-3 text-sm">
						<span>
							Complete your profile to get better AI-powered connections.
						</span>
						<Link
							to="/onboarding"
							className="font-semibold underline underline-offset-2 hover:opacity-90 transition-opacity"
						>
							Finish Setup
						</Link>
					</div>
				)}
				<div
					className={`w-full ${
						isHome || isGalaxy
							? ""
							: isChat
								? "pt-20 h-screen overflow-hidden"
								: "pt-20 min-h-screen"
					}`}
				>
					<Outlet />
				</div>
			</div>
		</QueryClientProvider>
	);
}
