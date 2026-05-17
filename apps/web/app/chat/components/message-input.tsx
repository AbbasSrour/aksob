import { Paperclip, Send, Smile } from "lucide-react";
import type React from "react";
import { useState } from "react";

interface MessageInputProps {
	onSendMessage: (text: string) => Promise<boolean>;
	isSending?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
	onSendMessage,
	isSending,
}) => {
	const [message, setMessage] = useState("");

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!message.trim() || isSending) {
			return;
		}
		const text = message;
		const sent = await onSendMessage(text);
		if (sent) {
			setMessage("");
		}
	};

	const handleKeyDown = async (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			await handleSubmit();
		}
	};

	const hasText = message.trim().length > 0;

	return (
		<div className="bg-(--off-white) border-t border-(--gray-200)">
			<form onSubmit={handleSubmit} className="flex items-end gap-2 px-4 py-3">
				{/* Attachment Button */}
				<button
					type="button"
					disabled
					title="Coming soon"
					aria-label="Attach file"
					className="p-2 text-(--gray-300) cursor-not-allowed rounded-lg flex-shrink-0"
				>
					<Paperclip size={18} />
				</button>

				{/* Input Container */}
				<div className="flex-1 bg-white/80 backdrop-blur-sm rounded-xl border border-(--gray-200) focus-within:border-[var(--aksob-primary)]/50 focus-within:ring-2 focus-within:ring-[var(--aksob-primary)]/20 transition-all flex items-center min-h-[44px] px-4 shadow-sm">
					<textarea
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Type a message..."
						className="w-full bg-transparent border-none focus:ring-0 focus:outline-none resize-none max-h-[120px] text-(--aksob-darkest) placeholder-(--gray-400) py-3 text-[15px] leading-relaxed"
						rows={1}
					/>
					<button
						type="button"
						disabled
						title="Coming soon"
						aria-label="Insert emoji"
						className="ml-2 text-(--gray-300) cursor-not-allowed p-1.5 flex-shrink-0"
					>
						<Smile size={20} />
					</button>
				</div>

				{/* Send Button */}
				<button
					type="submit"
					disabled={!hasText || isSending}
					aria-label="Send message"
					className={`
						p-3 rounded-xl flex-shrink-0 transition-all duration-200
						${
							hasText && !isSending
								? "bg-[var(--aksob-primary)] text-white hover:bg-[var(--aksob-secondary)] shadow-sm"
								: "bg-(--gray-100) text-(--gray-300) cursor-not-allowed"
						}
					`}
				>
					<Send size={18} />
				</button>
			</form>
		</div>
	);
};
