import { Plus, Search } from "lucide-react";
import type React from "react";

interface ConversationListProps {
	children: React.ReactNode;
	onSearch?: (query: string) => void;
	onNewChat?: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
	children,
	onSearch,
	onNewChat,
}) => {
	return (
		<div className="flex flex-col h-full bg-white border-r border-[var(--gray-200)]">
			<div className="p-4 space-y-3 flex-shrink-0">
				<h2 className="text-xl font-bold text-[var(--aksob-darkest)]">Messages</h2>

				<div className="relative">
					<Search
						className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gray-400)]"
						size={18}
					/>
					<input
						type="text"
						placeholder="Search conversations..."
						className="w-full pl-10 pr-4 py-2 bg-[var(--gray-50)] border border-[var(--gray-200)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--aksob-primary)] focus:bg-white transition-all text-[var(--aksob-darkest)] placeholder-[var(--gray-500)]"
						onChange={(e) => onSearch?.(e.target.value)}
					/>
				</div>

				<button
					onClick={onNewChat}
					className="w-full flex items-center justify-center gap-2 py-2 bg-[var(--aksob-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--aksob-secondary)] transition-colors shadow-sm"
				>
					<Plus size={18} />
					New Conversation
				</button>
			</div>

			<div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1 custom-scrollbar">{children}</div>
		</div>
	);
};
