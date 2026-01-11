import { MessageSquare } from "lucide-react";
import type React from "react";
import { Link, useLocation } from "react-router";
import { Avatar } from "~/components/ui";

interface NavbarProps {
	user?: {
		name: string;
		avatar?: string;
	};
}

export const Navbar: React.FC<NavbarProps> = ({ user = { name: "User", avatar: undefined } }) => {
	const location = useLocation();

	// Determine if we need a transparent background (overlay) for Galaxy view
	const isGalaxy = location.pathname === "/";
	// If Galaxy, use more transparency. Else, typical glass header.
	// Removed border-b as requested.
	const bgClass = isGalaxy
		? "bg-black/10 backdrop-blur-sm border-white/10 text-white"
		: "bg-white/80 backdrop-blur-md text-[var(--aksob-darkest)] shadow-sm";

	  const iconButtonClass = `p-2 rounded-full transition-colors border ${
      isGalaxy
      ? "hover:bg-white/10 text-white/90 border-white/20"
      : "hover:bg-[var(--gray-100)] text-[var(--gray-500)] hover:text-[var(--aksob-primary)] border-[var(--gray-200)]"
  }`;

	return (
		<nav
			className={`fixed top-0 left-0 right-0 z-[var(--z-fixed)] h-16 transition-all duration-300 ${bgClass}`}
		>
			<div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
				{/* Brand */}
				<Link to="/" className="flex items-center gap-2">
					<div
						className={`font-bold text-xl tracking-tight ${isGalaxy ? "text-white" : "text-[var(--aksob-darkest)]"}`}
					>
						AKSOB<span className="font-light opacity-80">Alumni</span>
					</div>
				</Link>

				<div className="flex items-center gap-2 md:gap-4">
					{/* Desktop Actions */}
					<div className="flex items-center gap-1 md:gap-2">
						{/* Chat Icon */}
						<Link to="/chat" className={iconButtonClass} title="Chat">
							<MessageSquare size={20} />
						</Link>

						{/* Profile (Avatar) */}
						<Link to="/profile" className="block" title="Profile">
							<Avatar
								name={user.name}
								src={user.avatar}
								size="sm"
								className="ring-2 ring-white/20 hover:ring-white/40 transition-all cursor-pointer"
							/>
						</Link>

						{/* Logout - Optional, keeping somewhat subtle or removing if clutter. User didn't explicit ask to remove, but "pressing user take me to profile" replaces standard dropdown. I'll keep a small logout for utility nearby or rely on Profile page having logout. I'll hide it to be minimal as requested "other TWO buttons" (Chat + Profile) implies only 2. */}
					</div>

					{/* Mobile Menu Button - Optional if we just have icons now? 
                If the desktop nav is gone, mobile menu might just be the same icons? 
                The user laid out a global change. I will assume the mobile menu is less critical or can also be simplified. 
                I'll leave the hamburger for now as a fallback for 'Logout' or 'Galaxy' navigation if needed, 
                but standardizing the top bar is the priority. 
            */}
				</div>
			</div>
		</nav>
	);
};
