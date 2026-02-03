import { Check, CheckCheck } from "lucide-react";
import type React from "react";
import { Avatar } from "~/components/ui/avatar";

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
	showAvatar?: boolean;
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
	const bubbleStyles = isOwn
		? "bg-[var(--aksob-primary)] text-white rounded-3xl rounded-br-lg"
		: "bg-gray-100 text-gray-900 rounded-3xl rounded-bl-lg";

	return (
		<div
			className={`flex w-full mb-2 ${isOwn ? "justify-end" : "justify-start"}`}
		>
			{!isOwn && (
				<div
					className={`mr-2.5 flex-shrink-0 self-end ${!showAvatar ? "invisible" : ""}`}
				>
					<Avatar name={senderName} src={senderAvatar} size="sm" />
				</div>
			)}

			<div className="relative max-w-[75%] lg:max-w-[65%]">
				{!isOwn && showAvatar && (
					<span className="text-[11px] text-gray-400 ml-3 mb-1 block font-medium">
						{senderName}
					</span>
				)}

				<div className={`px-4 py-2.5 ${bubbleStyles}`}>
					<p className="whitespace-pre-wrap text-[15px] leading-relaxed break-words">
						{content}
					</p>
					<div className="flex items-center justify-end gap-1.5 mt-1 -mb-0.5">
						<span
							className={`text-[11px] ${
								isOwn ? "text-white/60" : "text-gray-400"
							}`}
						>
							{timestamp}
						</span>
						{isOwn && (
							<span
								className={`${status === "read" ? "text-emerald-300" : "text-white/50"}`}
							>
								{status === "sending" ? (
									<div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
								) : status === "sent" ? (
									<Check size={14} strokeWidth={2.5} />
								) : (
									<CheckCheck size={14} strokeWidth={2.5} />
								)}
							</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
