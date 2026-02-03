import { ArrowLeft, LogIn, LogOut, MessageSquare, UserPlus } from "lucide-react";
import type React from "react";
import { Link, useLocation } from "react-router";
import { Avatar } from "~/components/ui/avatar";

interface NavbarProps {
	user?: {
		name: string;
		avatar?: string;
	};
	onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
	const location = useLocation();
	const isAuthenticated = Boolean(user);
	const userName = user?.name?.trim() ? user.name : "User";
	const userAvatar = user?.avatar;

	// Determine if we need a transparent background (overlay) for Galaxy view
	const isGalaxy = location.pathname === "/";
	// If Galaxy, remove bar background entirely (floating elements). Else, typical glass header.
	const bgClass = isGalaxy
		? "bg-transparent pointer-events-none"
		: "bg-white/80 backdrop-blur-md text-[var(--aksob-darkest)] shadow-sm pointer-events-auto";

	// Standard styling for non-galaxy mode
	const normalBtnClass =
		"p-2 rounded-full transition-colors border hover:bg-[var(--gray-100)] text-[var(--gray-500)] hover:text-[var(--aksob-primary)] border-[var(--gray-200)] pointer-events-auto";

	return (
		<nav
			className={`fixed top-0 left-0 right-0 z-(--z-fixed) h-20 transition-all duration-300 ${bgClass}`}
		>
			<div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
				{/* Left Side - Brand or Back Button */}
				<div className="flex items-center gap-4">
					{!isGalaxy && (
						<Link
							to="/"
							className="flex items-center gap-2 text-sm text-gray-500 hover:text-(--aksob-primary) transition-colors pointer-events-auto"
						>
							<ArrowLeft size={18} />
							<span className="hidden sm:inline">Back to Galaxy</span>
						</Link>
					)}

					{isGalaxy && (
						<Link
							to="/"
							id="navbar-logo"
							className="flex items-center gap-2 pointer-events-auto transition-transform duration-500 hover:scale-105"
						>
							<div className="font-bold text-xl tracking-tight text-white drop-shadow-md">
								AKSOB<span className="font-light opacity-80">Alumni</span>
							</div>
						</Link>
					)}
				</div>

				<div className="flex items-center gap-4">
					{/* Desktop Actions */}
					<div
						className={
							isGalaxy
								? "hud-capsule pointer-events-auto"
								: "flex items-center gap-3"
						}
					>
						{isAuthenticated ? (
							<>
								{/* Chat Icon */}
								<Link
									to="/chat"
									className={isGalaxy ? "hud-btn has-dot" : normalBtnClass}
									title="Chat"
									data-label="Network"
								>
									<MessageSquare size={20} />
								</Link>

								{isGalaxy && <div className="hud-separator" />}

								{/* Profile (Avatar) */}
								<Link
									to="/profile"
									className={isGalaxy ? "hud-btn" : "block pointer-events-auto"}
									title="Profile"
									data-label="Profile"
								>
									<Avatar
										name={userName}
										src={userAvatar}
										size="sm"
										className={isGalaxy ? "" : "transition-all cursor-pointer"}
									/>
								</Link>

								{isGalaxy && <div className="hud-separator" />}

								{/* Logout */}
								<button
									type="button"
									onClick={onLogout}
									className={`${isGalaxy ? "hud-btn" : normalBtnClass} cursor-pointer`}
									title="Logout"
									data-label="Logout"
								>
									<LogOut size={18} />
								</button>
							</>
						) : (
							<>
								{/* Sign In */}
								<Link
									to="/auth/login"
									className={isGalaxy ? "hud-btn" : normalBtnClass}
									title="Sign In"
									data-label="Sign In"
								>
									<LogIn size={18} />
								</Link>

								{isGalaxy && <div className="hud-separator" />}

								{/* Join */}
								<Link
									to="/auth/register"
									className={isGalaxy ? "hud-btn" : normalBtnClass}
									title="Join"
									data-label="Join"
								>
									<UserPlus size={18} />
								</Link>
							</>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
};
