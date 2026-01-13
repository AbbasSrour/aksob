import { Paperclip, Send, Smile } from "lucide-react";
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

	const hasText = message.trim().length > 0;

	return (
		<div className="bg-white border-t border-gray-100">
			<form onSubmit={handleSubmit} className="flex items-end gap-2 px-3 py-3">
				{/* Attachment Button */}
				<button
					type="button"
					className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
				>
					<Paperclip size={20} />
				</button>

				{/* Input Container */}
				<div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-[var(--aksob-primary)] focus-within:ring-2 focus-within:ring-[var(--aksob-primary)]/20 transition-all flex items-center min-h-[44px] px-4">
					<textarea
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Type a message..."
						className="w-full bg-transparent border-none focus:ring-0 focus:outline-none resize-none max-h-[120px] text-gray-900 placeholder-gray-400 py-3 text-[15px] leading-relaxed"
						rows={1}
					/>
					<button
						type="button"
						className="ml-2 text-gray-400 hover:text-gray-600 p-1.5 transition-colors flex-shrink-0"
					>
						<Smile size={22} />
					</button>
				</div>

				{/* Send Button */}
				<button
					type="submit"
					disabled={!hasText || isSending}
					className={`
						p-3 rounded-xl flex-shrink-0 transition-all duration-200
						${hasText && !isSending
							? "bg-[var(--aksob-primary)] text-white hover:bg-[var(--aksob-secondary)]"
							: "bg-gray-100 text-gray-300 cursor-not-allowed"
						}
					`}
				>
					<Send size={20} />
				</button>
			</form>
		</div>
	);
};
