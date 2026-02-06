import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { ConversationItem } from "~/app/chat/components/conversation-item";
import { ConversationList } from "~/app/chat/components/conversation-list";
import { type ChatConversation, listConversations } from "~/app/chat/lib/chat";

const formatMessageTime = (timestamp: string | null | undefined) => {
	if (!timestamp) return "";
	const date = new Date(timestamp);
	const now = Date.now();
	const diffMinutes = Math.floor((now - date.getTime()) / 60000);
	if (diffMinutes < 1) return "now";
	if (diffMinutes < 60) return `${diffMinutes}m`;
	const diffHours = Math.floor(diffMinutes / 60);
	if (diffHours < 24) return `${diffHours}h`;
	const diffDays = Math.floor(diffHours / 24);
	return `${diffDays}d`;
};

export default function ChatLayout() {
	const location = useLocation();
	const navigate = useNavigate();
	const [query, setQuery] = useState("");
	const [conversations, setConversations] = useState<ChatConversation[]>([]);

	const isConversationActive =
		location.pathname.startsWith("/chat/") && location.pathname !== "/chat";

	useEffect(() => {
		let isMounted = true;

		const loadConversations = async () => {
			try {
				const response = await listConversations();
				if (!isMounted) return;
				setConversations(response.data);
			} catch {
				if (!isMounted) return;
				setConversations([]);
			}
		};

		void loadConversations();
		const interval = window.setInterval(loadConversations, 5000);

		return () => {
			isMounted = false;
			window.clearInterval(interval);
		};
	}, []);

	const filteredConversations = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();
		if (!normalizedQuery) return conversations;
		return conversations.filter((conversation) =>
			conversation.otherUser.name.toLowerCase().includes(normalizedQuery),
		);
	}, [conversations, query]);

	return (
		<div className="flex h-full w-full overflow-hidden bg-white">
			<div
				className={`w-full shrink-0 lg:w-85 ${isConversationActive ? "hidden lg:block" : "block"}`}
			>
				<ConversationList onSearch={setQuery}>
					{filteredConversations.map((conversation) => (
						<ConversationItem
							key={conversation.id}
							id={conversation.id}
							name={conversation.otherUser.name}
							avatarSrc={conversation.otherUser.image ?? undefined}
							lastMessage={
								conversation.lastMessage?.content ?? "No messages yet"
							}
							time={formatMessageTime(conversation.lastMessage?.createdAt)}
							isActive={location.pathname === `/chat/${conversation.id}`}
							onClick={() => navigate(`/chat/${conversation.id}`)}
						/>
					))}
				</ConversationList>
			</div>

			<div
				className={`relative flex h-full min-w-0 flex-1 flex-col bg-white ${
					isConversationActive ? "flex" : "hidden lg:flex"
				}`}
			>
				<Outlet />
			</div>
		</div>
	);
}
