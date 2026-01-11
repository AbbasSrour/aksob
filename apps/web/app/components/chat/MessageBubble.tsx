import { Check, CheckCheck } from "lucide-react";
import type React from "react";
import { Avatar } from "~/components/ui";

export interface MessageProps {
	id: string;
	content: string;
	senderId: string;
	senderName: string;
	senderAvatar?: string;
	timestamp: string;
	isOwn: boolean;
	status?: "sending" | "sent" | "delivered" | "read";
	type?: "text" | "image" | "file";
	showAvatar?: boolean; // For grouped messages
}

export const MessageBubble: React.FC<MessageProps> = ({
	content,
	senderName,
	senderAvatar,
	timestamp,
	isOwn,
	status,
	showAvatar = true,
}) => {
	const getStatusIcon = () => {
		if (!isOwn) return null;
		switch (status) {
			case "sending":
				return (
					<div className="w-3 h-3 border border-[var(--gray-400)] border-t-transparent rounded-full animate-spin" />
				);
			case "sent":
				return <Check size={14} className="text-[var(--gray-300)]" />;
			case "delivered":
				return <CheckCheck size={14} className="text-[var(--gray-300)]" />;
			case "read":
				return <CheckCheck size={14} className="text-[#86efac]" />; // Light green for read on dark bg, or adjust
			default:
				return null;
		}
	};

	// Adjust read color for primary background
	const readIconColor = isOwn ? "text-[#a7f3d0]" : "text-[var(--aksob-primary)]";

	const bubbleStyles = isOwn
		? "bg-[var(--aksob-primary)] text-white rounded-t-2xl rounded-l-2xl rounded-br-sm"
		: "bg-white text-[var(--aksob-darkest)] border border-[var(--gray-200)] rounded-t-2xl rounded-r-2xl rounded-bl-sm";

	return (
		<div className={`flex w-full mb-1 ${isOwn ? "justify-end" : "justify-start"}`}>
			{!isOwn && (
				<div className={`mr-2 flex-shrink-0 w-8 ${!showAvatar ? "invisible" : ""}`}>
					<Avatar name={senderName} src={senderAvatar} size="sm" />
				</div>
			)}

			<div className={`relative max-w-[70%] lg:max-w-[60%] group`}>
				{!isOwn && showAvatar && (
					<span className="text-xs text-[var(--gray-500)] ml-1 mb-1 block">{senderName}</span>
				)}

				<div className={`px-4 py-3 ${bubbleStyles} shadow-sm relative`}>
					<p className="whitespace-pre-wrap text-[15px] leading-relaxed break-words">{content}</p>
					<div className={`flex items-center justify-end gap-1 mt-1 select-none`}>
						<span
							className={`text-[11px] ${isOwn ? "text-[rgba(255,255,255,0.7)]" : "text-[var(--gray-400)]"}`}
						>
							{timestamp}
						</span>
						{isOwn && (
							<span
								className={status === "read" ? "text-[#a7f3d0]" : "text-[rgba(255,255,255,0.6)]"}
							>
								{status === "sending" ? (
									<div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
								) : status === "sent" ? (
									<Check size={14} strokeWidth={2} />
								) : (
									<CheckCheck size={14} strokeWidth={2} />
								)}
							</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
