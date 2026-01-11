export default function ChatIndex() {
	return (
		<div className="flex flex-col items-center justify-center h-full w-full text-center p-8 bg-[var(--off-white)]">
			<div className="w-24 h-24 bg-[var(--pale-mint)] rounded-full flex items-center justify-center mb-6">
				<svg
					className="w-10 h-10 text-[var(--aksob-primary)]"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
				</svg>
			</div>
			<h2 className="text-2xl font-bold text-[var(--aksob-darkest)] mb-2">Select a Conversation</h2>
			<p className="text-[var(--gray-600)] max-w-xs">
				Choose a chat from the sidebar or start a new conversation to connect with alumni.
			</p>
		</div>
	);
}
