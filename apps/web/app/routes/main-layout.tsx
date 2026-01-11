import { Outlet, useLocation } from "react-router";
import { Navbar } from "~/components/layout/Navbar";

export default function MainLayout() {
	const location = useLocation();
	const isGalaxy = location.pathname === "/";
	// If Galaxy, content goes under the transparent navbar (so full height).
	// If not Galaxy, content should have top padding to account for fixed navbar (h-16 = 4rem = 64px).

	// Actually, for Chat, we also want full height management often because of the sidebar.
	// The ChatLayout uses `h-screen`. If we add `pt-16`, we need to change ChatLayout to `h-[calc(100vh-64px)]`.
	// Or: Make MainLayout `flex flex-col h-screen` and Navbar static?
	// But Galaxy needs Navbar overlay.
	// Strategy: Navbar is always `fixed`.
	// Content wrapper has `pt-16` unless it's Galaxy (where we want overlap) or configured otherwise.

	// Chat handles its own layout well, but if we push it down 64px, we need to reduce its height.
	// Let's us `pt-16` generally, and `min-h-screen`.
	// For Chat, we might need a specific override class.

	return (
		<div className="min-h-screen bg-[var(--off-white)]">
			<Navbar />

			<div
				className={`w-full ${isGalaxy ? "" : "pt-16 h-screen"}`} // h-screen on non-galaxy ensures full height for chat
				// Note: setting h-screen here restricts global scroll. That's good for Chat, maybe bad for Profile if it's long.
				// Profile is usually scrollable.
				// Best: For Chat routes, use fixed height container. For Profile, use min-h-screen.
			>
				<Outlet />
			</div>
		</div>
	);
}
