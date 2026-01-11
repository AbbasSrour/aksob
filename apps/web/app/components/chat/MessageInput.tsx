import { Image as ImageIcon, Paperclip, Send, Smile } from "lucide-react";
import type React from "react";
import { useState } from "react";

interface MessageInputProps {
	onSendMessage: (text: string) => void;
	isSending?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isSending }) => {
	const [message, setMessage] = useState("");

	const handleSubmit = (e?: React.FormEvent) => {
		e?.preventDefault();
		if (message.trim() && !isSending) {
			onSendMessage(message);
			setMessage("");
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	};

	return (
		<div className="p-4 bg-white border-t border-[var(--gray-200)] sticky bottom-0 z-[var(--z-sticky)]">
			<form onSubmit={handleSubmit} className="flex items-end gap-2 max-w-5xl mx-auto">
				<div className="flex gap-1 pb-2 text-[var(--gray-400)]">
					<button
						type="button"
						className="p-2 hover:bg-[var(--gray-100)] rounded-full transition-colors hover:text-[var(--aksob-darkest)]"
					>
						<Paperclip size={20} />
					</button>
					<button
						type="button"
						className="p-2 hover:bg-[var(--gray-100)] rounded-full transition-colors hover:text-[var(--aksob-darkest)]"
					>
						<ImageIcon size={20} />
					</button>
				</div>

				<div className="flex-1 bg-[var(--gray-50)] rounded-[24px] border border-[var(--gray-200)] focus-within:ring-2 focus-within:ring-[var(--aksob-primary)] focus-within:border-transparent transition-shadow flex items-center min-h-[48px] px-4 py-2">
					<textarea
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Type a message..."
						className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-[120px] text-[var(--aksob-darkest)] placeholder-[var(--gray-400)] py-1.5"
						rows={1}
						style={{ minHeight: "24px" }}
					/>
					<button
						type="button"
						className="ml-2 text-[var(--gray-400)] hover:text-[var(--aksob-primary)] p-1"
					>
						<Smile size={20} />
					</button>
				</div>

				<button
					type="submit"
					disabled={!message.trim() || isSending}
					className={`
                p-3 rounded-full flex-shrink-0 transition-all duration-200
                ${
									message.trim() && !isSending
										? "bg-[var(--aksob-primary)] text-white hover:bg-[var(--aksob-secondary)] shadow-sm hover:shadow-md transform hover:scale-105"
										: "bg-[var(--gray-100)] text-[var(--gray-400)] cursor-not-allowed"
								}
            `}
				>
					<Send size={20} className={message.trim() ? "ml-0.5" : ""} />
				</button>
			</form>
		</div>
	);
};
