import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { signOut, useSession } from "~/app/lib/auth";
import { Navbar } from "~/components/layout/navbar";

export default function AppLayout() {
	const location = useLocation();
	const navigate = useNavigate();
	const { data: session, isPending } = useSession();
	const isHome = location.pathname === "/";
	const isGalaxy = location.pathname === "/galaxy";
	const isChat = location.pathname.startsWith("/chat");
	const isProtectedRoute =
		location.pathname.startsWith("/chat") || location.pathname === "/profile";

	useEffect(() => {
		if (isPending) return;
		if (isProtectedRoute && !session?.user) {
			const redirectTo = encodeURIComponent(location.pathname);
			navigate(`/auth/login?redirectTo=${redirectTo}`);
		}
	}, [isPending, isProtectedRoute, location.pathname, navigate, session?.user]);

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
				name: session.user.name || session.user.email || "User",
				avatar: session.user.image || undefined,
			}
		: undefined;

	if (isProtectedRoute && (isPending || !session?.user)) {
		return null;
	}

	return (
		<div className="min-h-screen bg-(--off-white)">
			<Navbar user={user} onLogout={handleLogout} />
			<div
				className={`w-full ${
					isHome || isGalaxy
						? ""
						: isChat
							? "pt-20 h-[calc(100vh-5rem)]"
							: "pt-20 min-h-screen"
					}`}
			>
				<Outlet />
			</div>
		</div>
	);
}
