import { Outlet, useLocation } from "react-router";
import { Navbar } from "~/components/layout/navbar";

export default function AppLayout() {
	const location = useLocation();
	const isGalaxy = location.pathname === "/" || location.pathname === "/galaxy";
	const isChat = location.pathname.startsWith("/chat");

	return (
		<div className="min-h-screen bg-(--off-white)">
			<Navbar />
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
