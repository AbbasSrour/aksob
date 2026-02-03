import type React from "react";
import { Avatar } from "~/components/ui/avatar";

interface ConversationItemProps {
	id: string;
	name: string;
	avatarSrc?: string;
	lastMessage: string;
	time: string;
	unreadCount?: number;
	isActive?: boolean;
	onClick?: () => void;
	isOnline?: boolean;
	isMuted?: boolean;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
	name,
	avatarSrc,
	lastMessage,
	time,
	unreadCount = 0,
	isActive = false,
	onClick,
	isOnline,
	isMuted,
}) => {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`
				w-full text-left flex items-center p-3 gap-3 rounded-2xl cursor-pointer 
				transition-all duration-200 group
				${
					isActive
						? "bg-[var(--aksob-primary)] shadow-lg shadow-[var(--aksob-primary)]/20"
						: "hover:bg-gray-50 active:bg-gray-100"
				}
			`}
		>
			<div className="relative flex-shrink-0">
				<Avatar
					name={name}
					src={avatarSrc}
					status={isOnline ? "online" : undefined}
					size="md"
				/>
			</div>

			<div className="flex-1 min-w-0">
				<div className="flex justify-between items-center mb-0.5">
					<h4
						className={`text-sm font-semibold truncate ${isActive ? "text-white" : "text-gray-900"}`}
					>
						{name}
					</h4>
					<span
						className={`text-xs flex-shrink-0 ml-2 ${isActive ? "text-white/70" : "text-gray-400"}`}
					>
						{time}
					</span>
				</div>

				<div className="flex justify-between items-center">
					<p
						className={`text-xs truncate pr-2 ${isActive ? "text-white/80" : unreadCount > 0 ? "text-gray-700 font-medium" : "text-gray-500"}`}
					>
						{lastMessage}
					</p>
					<div className="flex items-center gap-1.5 flex-shrink-0">
						{isMuted && !isActive && (
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="text-gray-300"
								role="img"
								aria-label="Muted"
							>
								<title>Muted</title>
								<path d="M11 5 6 9H2v6h4l5 4V5Z" />
								<line x1="22" x2="16" y1="9" y2="15" />
								<line x1="16" x2="22" y1="9" y2="15" />
							</svg>
						)}
						{unreadCount > 0 && !isActive && (
							<span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-[var(--aksob-primary)] text-white text-[11px] font-bold rounded-full">
								{unreadCount > 99 ? "99+" : unreadCount}
							</span>
						)}
					</div>
				</div>
			</div>
		</button>
	);
};
