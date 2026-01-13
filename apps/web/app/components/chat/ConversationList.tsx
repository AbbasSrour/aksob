import { Search } from "lucide-react";
import type React from "react";

interface ConversationListProps {
	children: React.ReactNode;
	onSearch?: (query: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
	children,
	onSearch,
}) => {
	return (
		<div className="flex flex-col w-full h-full bg-white shadow-[4px_0_16px_rgba(0,0,0,0.08)]">
			{/* Header */}
			<div className="px-4 pt-8 pb-4 space-y-4 flex-shrink-0">
				<h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Messages</h2>

				{/* Search */}
				<div className="relative">
					<Search
						className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
						size={18}
					/>
					<input
						type="text"
						placeholder="Search conversations..."
						className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--aksob-primary)]/30 focus:bg-white transition-all text-gray-900 placeholder-gray-400"
						onChange={(e) => onSearch?.(e.target.value)}
					/>
				</div>
			</div>

			{/* Conversations */}
			<div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
				{children}
			</div>
		</div>
	);
};
