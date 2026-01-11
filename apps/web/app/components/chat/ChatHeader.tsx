import { ArrowLeft, MoreVertical } from "lucide-react";
import type React from "react";
import { Link } from "react-router";
import { Avatar } from "~/components/ui";

interface ChatHeaderProps {
	name: string;
	avatarSrc?: string;
	isOnline?: boolean;
	statusText?: string; // "Online", "Last seen...", "Typing..."
	onBack?: () => void;
	showBack?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
	name,
	avatarSrc,
	isOnline,
	statusText,
	onBack,
	showBack,
}) => {
	return (
		<div className="flex items-center justify-between h-16 px-4 bg-white/80 backdrop-blur-md border-b border-[var(--gray-200)] shadow-sm flex-shrink-0 z-[var(--z-sticky)]">
			<div className="flex items-center gap-3">
				{showBack && (
					<button
						onClick={onBack}
						className="md:hidden p-2 -ml-2 text-[var(--gray-600)] hover:text-[var(--aksob-primary)] rounded-full hover:bg-[var(--gray-50)]"
					>
						<ArrowLeft size={20} />
					</button>
				)}

				<div className="flex items-center gap-3">
					<Avatar name={name} src={avatarSrc} status={isOnline ? "online" : undefined} size="md" />
					<div>
						<h3 className="text-base font-semibold text-[var(--aksob-darkest)] leading-tight">
							{name}
						</h3>
						{statusText && (
							<div className="flex items-center gap-1.5">
								{isOnline && <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]"></span>}
								<span
									className={`text-xs ${statusText === "Typing..." ? "text-[var(--aksob-primary)] font-medium" : "text-[var(--gray-500)]"}`}
								>
									{statusText}
								</span>
							</div>
						)}
					</div>
				</div>
			</div>

			<button className="p-2 text-[var(--gray-500)] hover:text-[var(--aksob-primary)] rounded-full hover:bg-[var(--gray-50)] transition-colors">
				<MoreVertical size={20} />
			</button>
		</div>
	);
};
