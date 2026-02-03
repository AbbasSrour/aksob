import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ChatHeader } from "~/app/chat/components/chat-header";
import { MessageBubble, type MessageProps } from "~/app/chat/components/message-bubble";
import { MessageInput } from "~/app/chat/components/message-input";

// Mock Messages Data
const MOCK_MESSAGES: Record<string, MessageProps[]> = {
	"1": [
		{
			id: "m1",
			senderId: "other",
			senderName: "John Doe",
			content: "Hey, how are you doing today?",
			timestamp: "2:32 PM",
			isOwn: false,
			status: "read",
		},
		{
			id: "m2",
			senderId: "me",
			senderName: "Me",
			content: "I'm doing great! Just finished my project.",
			timestamp: "2:34 PM",
			isOwn: true,
			status: "read",
		},
		{
			id: "m3",
			senderId: "other",
			senderName: "John Doe",
			content: "That's awesome to hear! Would love to see it sometime.",
			timestamp: "2:35 PM",
			isOwn: false,
			status: "read",
		},
	],
	"2": [
		{
			id: "m1",
			senderId: "other",
			senderName: "Jane Smith",
			content: "See you tomorrow at the event!",
			timestamp: "1:00 PM",
			isOwn: false,
			status: "read",
		},
	],
	"3": [],
	"4": [],
};

const MOCK_USERS: Record<
	string,
	{ name: string; isOnline: boolean; status: string }
> = {
	"1": { name: "John Doe", isOnline: true, status: "Online" },
	"2": { name: "Jane Smith", isOnline: false, status: "Last seen 1h ago" },
	"3": { name: "Study Group", isOnline: false, status: "" },
	"4": { name: "Alumni Association", isOnline: true, status: "Online" },
};

export default function ChatConversation() {
	const { conversationId } = useParams();
	const navigate = useNavigate();
	const [messages, setMessages] = useState<MessageProps[]>([]);
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (conversationId && MOCK_MESSAGES[conversationId]) {
			setMessages(MOCK_MESSAGES[conversationId]);
		} else {
			setMessages([]);
		}
	}, [conversationId]);

	// Auto scroll logic
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages]);

	const handleSendMessage = (text: string) => {
		const newMessage: MessageProps = {
			id: Date.now().toString(),
			senderId: "me",
			senderName: "Me",
			content: text,
			timestamp: new Date().toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			}),
			isOwn: true,
			status: "sending",
		};
		setMessages((prev) => [...prev, newMessage]);

		// Simulate sending success
		setTimeout(() => {
			setMessages((prev) =>
				prev.map((m) =>
					m.id === newMessage.id ? { ...m, status: "sent" } : m,
				),
			);
		}, 1000);
	};

	const user =
		conversationId && MOCK_USERS[conversationId]
			? MOCK_USERS[conversationId]
			: { name: "Unknown", isOnline: false, status: "" };

	return (
		<div className="flex flex-col h-full w-full bg-[#f8fafc] dark:bg-[#0a0a0a]">
			<ChatHeader
				name={user.name}
				isOnline={user.isOnline}
				statusText={user.status}
				showBack={true}
				onBack={() => navigate("/chat")}
			/>

			<div
				className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar"
				ref={scrollRef}
			>
				{messages.length === 0 ? (
					<div className="flex h-full items-center justify-center text-gray-400 text-sm">
						No messages yet. Say hello!
					</div>
				) : (
					<>
						<div className="flex items-center justify-center my-4">
							<div className="bg-gray-200 h-[1px] flex-1 max-w-[100px]"></div>
							<span className="mx-2 text-xs text-gray-500 font-medium">
								Today
							</span>
							<div className="bg-gray-200 h-[1px] flex-1 max-w-[100px]"></div>
						</div>
						{messages.map((msg, i) => {
							// Logic to show avatar only for last message in sequence from same sender?
							// Simplified for now: always show avatar for incoming
							return <MessageBubble key={msg.id} {...msg} />;
						})}
					</>
				)}
			</div>

			<MessageInput onSendMessage={handleSendMessage} />
		</div>
	);
}
