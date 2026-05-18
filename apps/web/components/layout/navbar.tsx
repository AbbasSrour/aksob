import { useQuery } from "@tanstack/react-query";
import { LogOut, Menu, MessageSquare, UserPlus, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { listConnections } from "~/app/lib/users";
import { NavbarSearch } from "~/components/layout/navbar-search";
import { Avatar } from "~/components/ui/avatar";

interface NavbarProps {
	user?: {
		id: string;
		name: string;
		avatar?: string;
	};
	onLogout?: () => void;
}

const NAV_LINKS = [
	{ label: "Home", path: "/" },
	{ label: "Galaxy", path: "/galaxy" },
	{ label: "Events", path: "/events" },
	{ label: "News", path: "/news" },
	{ label: "Stories", path: "/stories" },
	{ label: "Series", path: "/series" },
] as const;

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
	const location = useLocation();
	const isAuthenticated = Boolean(user);
	const userId = user?.id;
	const userName = user?.name?.trim() ? user.name : "User";
	const userAvatar = user?.avatar;
	const { data: pendingConnections } = useQuery({
		queryKey: ["connections", "pending", "navbar"],
		queryFn: () => listConnections("pending").then((r) => r.data),
		enabled: Boolean(userId),
	});
	const hasIncomingConnectionRequest = Boolean(
		pendingConnections?.some(
			(connection) => connection.matchedUserId === userId,
		),
	);

	const isGalaxy = location.pathname === "/galaxy";
	const isDark = isGalaxy;

	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		function onScroll() {
			setScrolled(window.scrollY > 10);
		}
		window.addEventListener("scroll", onScroll, { passive: true });
		onScroll();
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	useEffect(() => {
		setMobileMenuOpen(false);
	}, [location.pathname]);

	const isActive = (path: string) => {
		if (path === "/") return location.pathname === "/";
		return (
			location.pathname === path || location.pathname.startsWith(`${path}/`)
		);
	};

	/* ── Theme tokens ── */
	const navText = isDark
		? "text-white/70 hover:text-white"
		: "text-[var(--gray-500)] hover:text-(--aksob-darkest)";

	const navActive = "text-(--aksob-primary)";

	const borderColor = isDark ? "border-white/20" : "border-[var(--gray-200)]";

	const pillBase = `rounded-full border transition-all duration-300 ${borderColor}`;

	const logoFill = scrolled
		? isDark
			? "bg-[#1a2e29]/80 backdrop-blur-md shadow-[0_0_24px_rgba(7,105,81,0.25)]"
			: "bg-white/90 backdrop-blur-md shadow-sm shadow-black/5"
		: isDark
			? "bg-white/5"
			: "bg-transparent";

	const pillFill = scrolled
		? isDark
			? "bg-[#1a2e29]/80 backdrop-blur-md shadow-md shadow-black/20"
			: "bg-white/90 backdrop-blur-md"
		: isDark
			? "bg-white/5"
			: "bg-transparent";

	const linkBase =
		"px-3 py-2 text-[15px] font-medium tracking-wide transition-colors duration-200 pointer-events-auto";

	return (
		<nav className="fixed top-0 left-0 right-0 z-(--z-fixed) h-20 transition-all duration-300 pointer-events-none">
			<div className="max-w-[1440px] mx-auto px-8 h-full flex items-center justify-between gap-6">
				{/* ── Logo ── */}
				<div
					className={`flex items-center px-3 py-1.5 rounded-full border transition-all duration-300 ${
						scrolled
							? `${borderColor} ${logoFill}`
							: "border-transparent bg-transparent"
					}`}
				>
					<Link
						to="/"
						className="pointer-events-auto shrink-0 transition-opacity duration-200 hover:opacity-80"
					>
						<img
							src="/common/aksob-logo-large.png"
							alt="LAU"
							className={`w-auto transition-all duration-300 ${
								scrolled ? "h-9" : "h-12"
							} ${isDark ? "brightness-0 invert" : ""}`}
						/>
					</Link>
				</div>

				{/* ── Center nav pill ── */}
				<div
					className={`hidden lg:flex items-center px-2 py-1 ${pillBase} ${pillFill}`}
				>
					{NAV_LINKS.map(({ label, path }, index) => (
						<Link
							key={path}
							to={path}
							className={`${linkBase} ${isActive(path) ? navActive : navText} ${index < NAV_LINKS.length - 1 ? `border-r ${borderColor}` : ""}`}
							style={{ fontFamily: "var(--font-display)" }}
						>
							{label}
						</Link>
					))}
				</div>

				{/* ── Right actions pill ── */}
				<div
					className={`hidden lg:flex items-center gap-0 pl-2 pr-1 py-1 ${pillBase} ${pillFill}`}
				>
					{/* Search */}
					<NavbarSearch isDark={isDark} navText={navText} />

					{isAuthenticated ? (
						<>
							{/* Chat */}
							<Link
								to="/chat"
								className={`p-2.5 rounded-full transition-colors pointer-events-auto ${
									isActive("/chat") ? navActive : navText
								}`}
								title="Chat"
							>
								<MessageSquare size={20} strokeWidth={1.5} />
							</Link>

							{hasIncomingConnectionRequest && (
								<Link
									to="/profile"
									className={`relative p-2.5 rounded-full transition-colors pointer-events-auto ${navText}`}
									title="Connection request"
								>
									<UserPlus size={20} strokeWidth={1.5} />
									<span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-(--aksob-primary)" />
								</Link>
							)}

							{/* Profile — direct link */}
							<Link
								to="/profile"
								className={`p-1.5 rounded-full transition-colors pointer-events-auto ${isDark ? "hover:bg-white/10" : "hover:bg-[var(--gray-100)]"}`}
							>
								<Avatar name={userName} src={userAvatar} size="sm" />
							</Link>
						</>
					) : (
						<div className="flex items-center rounded-full transition-all duration-300">
							<Link
								to="/auth/login"
								className={`pl-4 pr-2 py-2 text-[15px] font-medium tracking-wide transition-colors pointer-events-auto ${
									isDark
										? "text-white/70 hover:text-white"
										: "text-[var(--gray-500)] hover:text-(--aksob-darkest)"
								}`}
								style={{ fontFamily: "var(--font-display)" }}
							>
								Login
							</Link>
							<Link
								to="/auth/register"
								className={`px-5 py-2 rounded-full text-[15px] font-medium tracking-wide transition-colors pointer-events-auto ${
									isDark
										? "bg-white/90 text-(--aksob-darkest) hover:bg-white"
										: "bg-(--aksob-primary) text-white hover:bg-(--aksob-secondary)"
								}`}
								style={{ fontFamily: "var(--font-display)" }}
							>
								Join
							</Link>
						</div>
					)}
				</div>

				{/* ── Mobile toggle ── */}
				<button
					type="button"
					className={`lg:hidden p-2.5 rounded-xl pointer-events-auto transition-colors ${navText}`}
					onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
				>
					{mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
				</button>
			</div>

			{/* ── Mobile menu ── */}
			{mobileMenuOpen && (
				<div
					className={`lg:hidden absolute top-20 left-0 right-0 border-b shadow-lg animate-slide-up ${borderColor} ${isDark ? "bg-[#1a2e29]/98 backdrop-blur-md" : "bg-(--off-white)"}`}
				>
					<div className="px-8 py-6 space-y-1">
						{NAV_LINKS.map(({ label, path }) => (
							<Link
								key={path}
								to={path}
								className={`block px-4 py-3 rounded-xl text-[15px] font-medium transition-colors ${
									isActive(path)
										? isDark
											? "bg-white/10 text-white"
											: "bg-[var(--pale-mint)] text-(--aksob-primary)"
										: isDark
											? "text-white/70 hover:bg-white/5 hover:text-white"
											: "text-[var(--gray-500)] hover:bg-[var(--gray-100)] hover:text-(--aksob-darkest)"
								}`}
								style={{ fontFamily: "var(--font-display)" }}
							>
								{label}
							</Link>
						))}

						{/* Mobile auth */}
						<div className="pt-4 mt-3 border-t border-[var(--gray-200)]">
							{isAuthenticated ? (
								<div className="space-y-1">
									<Link
										to="/chat"
										className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium transition-colors ${
											isDark
												? "text-white/70 hover:bg-white/5 hover:text-white"
												: "text-[var(--gray-500)] hover:bg-[var(--gray-100)] hover:text-(--aksob-darkest)"
										}`}
										style={{ fontFamily: "var(--font-display)" }}
									>
										<MessageSquare size={18} />
										Chat
									</Link>
									<Link
										to="/profile"
										className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium transition-colors ${
											isDark
												? "text-white/70 hover:bg-white/5 hover:text-white"
												: "text-[var(--gray-500)] hover:bg-[var(--gray-100)] hover:text-(--aksob-darkest)"
										}`}
										style={{ fontFamily: "var(--font-display)" }}
									>
										<Avatar name={userName} src={userAvatar} size="sm" />
										Profile
									</Link>
									<button
										type="button"
										onClick={onLogout}
										className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium transition-colors cursor-pointer ${
											isDark
												? "text-white/70 hover:bg-white/5 hover:text-white"
												: "text-[var(--gray-500)] hover:bg-[var(--gray-100)] hover:text-(--aksob-darkest)"
										}`}
										style={{ fontFamily: "var(--font-display)" }}
									>
										<LogOut size={18} />
										Logout
									</button>
								</div>
							) : (
								<div className="space-y-1">
									<Link
										to="/auth/login"
										className={`block px-4 py-3 rounded-xl text-[15px] font-medium transition-colors ${
											isDark
												? "text-white/70 hover:bg-white/5 hover:text-white"
												: "text-[var(--gray-500)] hover:bg-[var(--gray-100)] hover:text-(--aksob-darkest)"
										}`}
										style={{ fontFamily: "var(--font-display)" }}
									>
										Login
									</Link>
									<Link
										to="/auth/register"
										className={`block px-4 py-3 rounded-xl text-[15px] font-medium transition-colors text-center ${
											isDark
												? "bg-white/90 text-(--aksob-darkest) hover:bg-white"
												: "bg-(--aksob-primary) text-white hover:bg-(--aksob-secondary)"
										}`}
										style={{ fontFamily: "var(--font-display)" }}
									>
										Join
									</Link>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</nav>
	);
};
