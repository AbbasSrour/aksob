import { Link } from "react-router";

export default function ChatIndex() {
	return (
		<div className="flex flex-col items-center justify-center h-full w-full text-center p-8 bg-(--off-white)">
			<div className="w-20 h-20 bg-(--pale-mint) rounded-full flex items-center justify-center mb-5">
				<svg
					className="w-9 h-9 text-(--aksob-primary)"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					role="img"
					aria-label="Chat bubble"
				>
					<title>Chat bubble</title>
					<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
				</svg>
			</div>
			<h2
				className="text-xl font-semibold text-(--aksob-darkest) mb-2"
				style={{ fontFamily: "var(--font-display)" }}
			>
				Select a Conversation
			</h2>
			<p className="text-(--gray-500) max-w-xs text-sm mb-6">
				Choose a chat from the sidebar or explore the Galaxy to connect with
				alumni.
			</p>
			<Link
				to="/galaxy"
				className="px-6 py-2.5 rounded-full bg-[var(--aksob-primary)] text-white text-sm font-medium hover:bg-[var(--aksob-secondary)] transition-colors"
			>
				Explore the Galaxy
			</Link>
		</div>
	);
}
