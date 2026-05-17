import { ArrowLeft } from "lucide-react";
import type React from "react";
import { Avatar } from "~/components/ui/avatar";

interface ChatHeaderProps {
	name: string;
	avatarSrc?: string;
	isOnline?: boolean;
	statusText?: string;
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
		<div className="flex items-center justify-between h-20 px-5 bg-(--off-white) border-b border-(--gray-200) flex-shrink-0">
			<div className="flex items-center gap-3">
				{showBack && (
					<button
						type="button"
						onClick={onBack}
						aria-label="Back to conversations"
						className="lg:hidden p-2 -ml-2 text-(--gray-500) hover:text-[var(--aksob-primary)] rounded-xl hover:bg-(--pale-mint)/40 transition-colors"
					>
						<ArrowLeft size={20} />
					</button>
				)}

				<div className="flex items-center gap-3">
					<Avatar
						name={name}
						src={avatarSrc}
						status={isOnline ? "online" : undefined}
						size="md"
					/>
					<div>
						<h3
							className="text-base font-semibold text-(--aksob-darkest) leading-tight"
							style={{ fontFamily: "var(--font-display)" }}
						>
							{name}
						</h3>
						{statusText && (
							<div className="flex items-center gap-1.5 mt-0.5">
								{isOnline && statusText !== "Typing..." && (
									<span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
								)}
								<span
									className={`text-xs ${
										statusText === "Typing..."
											? "text-[var(--aksob-primary)] font-medium"
											: isOnline
												? "text-[var(--success)]"
												: "text-(--gray-400)"
									}`}
								>
									{statusText}
								</span>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
