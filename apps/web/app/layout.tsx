import { Outlet, useLocation, useNavigate } from "react-router";
import { signOut, useSession } from "~/app/lib/auth";
import { Navbar } from "~/components/layout/navbar";

export default function AppLayout() {
	const location = useLocation();
	const navigate = useNavigate();
	const { data: session } = useSession();
	const isGalaxy = location.pathname === "/" || location.pathname === "/galaxy";
	const isChat = location.pathname.startsWith("/chat");

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

	return (
		<div className="min-h-screen bg-(--off-white)">
			<Navbar user={user} onLogout={handleLogout} />
			<div
				className={`w-full ${
					isGalaxy
						? ""
						: isChat
							? "pt-16 h-[calc(100vh-4rem)]"
							: "pt-16 min-h-screen"
				}`}
			>
				<Outlet />
			</div>
		</div>
	);
}
