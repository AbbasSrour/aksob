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
		<div className="flex flex-col w-full h-full bg-(--off-white)">
			{/* Header */}
			<div className="px-5 pt-8 pb-4 space-y-4 border-b border-(--gray-200) flex-shrink-0">
				<h2
					className="text-[10px] tracking-[0.25em] uppercase font-semibold text-(--aksob-muted)"
					style={{ fontFamily: "var(--font-display)" }}
				>
					Messages
				</h2>

				{/* Search */}
				<div className="relative">
					<Search
						className="absolute left-4 top-1/2 -translate-y-1/2 text-(--gray-400)"
						size={16}
					/>
					<input
						type="text"
						placeholder="Search conversations..."
						className="w-full pl-11 pr-4 py-2.5 bg-(--pale-mint)/50 border border-transparent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--aksob-primary)]/20 focus:bg-white focus:border-[var(--gray-200)] transition-all text-(--aksob-darkest) placeholder-(--gray-400)"
						onChange={(e) => onSearch?.(e.target.value)}
					/>
				</div>
			</div>

			{/* Conversations */}
			<div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
				{children}
			</div>
		</div>
	);
};
