import type React from "react";
import { Avatar } from "~/components/ui";

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
        w-full text-left
        flex items-center p-3 gap-3 rounded-lg cursor-pointer transition-colors duration-200
        ${isActive ? "bg-[var(--pale-mint)] border-l-4 border-[var(--aksob-primary)] pl-2" : "hover:bg-[var(--gray-50)] border-l-4 border-transparent"}
      `}
		>
			<div className="relative flex-shrink-0">
				<Avatar name={name} src={avatarSrc} status={isOnline ? "online" : undefined} size="md" />
			</div>

			<div className="flex-1 min-w-0">
				<div className="flex justify-between items-baseline mb-0.5">
					<h4
						className={`text-sm truncate ${unreadCount > 0 ? "font-semibold text-[var(--aksob-darkest)]" : "font-semibold text-[var(--aksob-darkest)]"}`}
					>
						{name}
					</h4>
					<span className="text-xs text-[var(--gray-500)] flex-shrink-0 ml-2">{time}</span>
				</div>

				<div className="flex justify-between items-center">
					<p
						className={`text-xs truncate max-w-[180px] ${unreadCount > 0 ? "text-[var(--aksob-darkest)] font-medium" : "text-[var(--gray-600)]"}`}
					>
						{lastMessage}
					</p>
					<div className="flex items-center gap-1">
						{isMuted && (
							<span className="text-[var(--gray-400)]">
								<svg
									width="12"
									height="12"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									role="img"
									aria-label="Muted"
								>
									<title>Muted</title>
									<path d="M11 5 6 9H2v6h4l5 4V5Z" />
									<line x1="23" x2="1" y1="1" y2="23" />
								</svg>
							</span>
						)}
						{unreadCount > 0 && (
							<span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-[var(--aksob-primary)] text-white text-[10px] font-bold rounded-full">
								{unreadCount}
							</span>
						)}
					</div>
				</div>
			</div>
		</button>
	);
};
