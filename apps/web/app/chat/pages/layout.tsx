import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { ConversationItem } from "~/app/chat/components/conversation-item";
import { ConversationList } from "~/app/chat/components/conversation-list";

// Mock Data
const MOCK_CONVERSATIONS = [
	{
		id: "1",
		name: "John Doe",
		lastMessage: "Hey, how are you doing today?",
		time: "2m",
		unreadCount: 3,
		isOnline: true,
	},
	{
		id: "2",
		name: "Jane Smith",
		lastMessage: "See you tomorrow at the event!",
		time: "1h",
		unreadCount: 0,
		isOnline: false,
	},
	{
		id: "3",
		name: "Study Group",
		lastMessage: "Meeting at 3pm in the library.",
		time: "3h",
		unreadCount: 0,
		isOnline: false,
	},
	{
		id: "4",
		name: "Alumni Association",
		lastMessage: "Don't forget to register for the gala.",
		time: "1d",
		unreadCount: 1,
		isOnline: true,
	},
];

export default function ChatLayout() {
	const location = useLocation();
	const navigate = useNavigate();
	const [conversations] = useState(MOCK_CONVERSATIONS);

	const isConversationActive =
		location.pathname.startsWith("/chat/") && location.pathname !== "/chat";

	return (
		<div className="flex h-full w-full bg-white overflow-hidden">
			{/* Sidebar */}
			<div
				className={`
					w-full lg:w-85 h-full shrink-0 z-20 
					${isConversationActive ? "hidden lg:block" : "block"}
				`}
			>
				<ConversationList onSearch={(q) => console.log("Search", q)}>
					{conversations.map((conv) => (
						<ConversationItem
							key={conv.id}
							{...conv}
							isActive={location.pathname === `/chat/${conv.id}`}
							onClick={() => navigate(`/chat/${conv.id}`)}
						/>
					))}
				</ConversationList>
			</div>

			{/* Main Content Area */}
			<div
				className={`
					flex-1 h-full relative flex flex-col min-w-0 bg-white
					${isConversationActive ? "flex" : "hidden lg:flex"}
				`}
			>
				<Outlet />
			</div>
		</div>
	);
}
