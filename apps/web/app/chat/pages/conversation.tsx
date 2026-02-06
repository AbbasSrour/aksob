import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ChatHeader } from "~/app/chat/components/chat-header";
import {
	MessageBubble,
	type MessageProps,
} from "~/app/chat/components/message-bubble";
import { MessageInput } from "~/app/chat/components/message-input";
import {
	type ChatConversation,
	listConversations,
	listMessages,
	sendMessage,
} from "~/app/chat/lib/chat";
import { getCurrentUser } from "~/app/lib/users";

const formatMessageTime = (timestamp: string) => {
	return new Date(timestamp).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
};

export default function ChatConversationPage() {
	const { conversationId } = useParams();
	const navigate = useNavigate();
	const scrollRef = useRef<HTMLDivElement>(null);
	const [messages, setMessages] = useState<MessageProps[]>([]);
	const [activeConversation, setActiveConversation] =
		useState<ChatConversation | null>(null);
	const [currentUserId, setCurrentUserId] = useState<string | null>(null);
	const [isSending, setIsSending] = useState(false);

	useEffect(() => {
		if (!conversationId) {
			return;
		}

		let isMounted = true;

		const loadConversationMeta = async () => {
			try {
				const [meResponse, conversationsResponse] = await Promise.all([
					getCurrentUser(),
					listConversations(),
				]);

				if (!isMounted) {
					return;
				}

				setCurrentUserId(meResponse.data.id);
				setActiveConversation(
					conversationsResponse.data.find(
						(conversation) => conversation.id === conversationId,
					) ?? null,
				);
			} catch {
				if (!isMounted) {
					return;
				}
				navigate("/chat");
			}
		};

		void loadConversationMeta();

		return () => {
			isMounted = false;
		};
	}, [conversationId, navigate]);

	useEffect(() => {
		if (!conversationId || !currentUserId) {
			return;
		}

		let isMounted = true;

		const loadMessages = async () => {
			try {
				const response = await listMessages(conversationId);
				if (!isMounted) {
					return;
				}

				setMessages(
					response.data.map((message) => ({
						id: message.id,
						senderId: message.senderId,
						senderName: message.senderName,
						content: message.content,
						timestamp: formatMessageTime(message.createdAt),
						isOwn: message.senderId === currentUserId,
						status: message.senderId === currentUserId ? "sent" : "read",
					})),
				);
			} catch {
				if (!isMounted) {
					return;
				}
				navigate("/chat");
			}
		};

		void loadMessages();
		const interval = window.setInterval(loadMessages, 3000);

		return () => {
			isMounted = false;
			window.clearInterval(interval);
		};
	}, [conversationId, currentUserId, navigate]);

	useEffect(() => {
		if (!scrollRef.current) {
			return;
		}
		scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
	}, [messages]);

	const handleSendMessage = async (text: string) => {
		if (!conversationId || isSending) {
			return;
		}

		setIsSending(true);
		try {
			const response = await sendMessage(conversationId, text);
			setMessages((previousMessages) => [
				...previousMessages,
				{
					id: response.data.id,
					senderId: response.data.senderId,
					senderName: response.data.senderName,
					content: response.data.content,
					timestamp: formatMessageTime(response.data.createdAt),
					isOwn: true,
					status: "sent",
				},
			]);
		} finally {
			setIsSending(false);
		}
	};

	const headerName = useMemo(() => {
		if (!activeConversation) {
			return "Conversation";
		}
		return activeConversation.otherUser.name;
	}, [activeConversation]);

	return (
		<div className="flex h-full w-full flex-col bg-[#f8fafc] dark:bg-[#0a0a0a]">
			<ChatHeader
				name={headerName}
				avatarSrc={activeConversation?.otherUser.image ?? undefined}
				email={activeConversation?.otherUser.email}
				isOnline={false}
				statusText={activeConversation?.otherUser.major ?? ""}
				showBack={true}
				onBack={() => navigate("/chat")}
			/>

			<div
				className="custom-scrollbar flex-1 space-y-2 overflow-y-auto p-4"
				ref={scrollRef}
			>
				{messages.length === 0 ? (
					<div className="flex h-full items-center justify-center text-sm text-gray-400">
						No messages yet. Say hello!
					</div>
				) : (
					messages.map((message) => (
						<MessageBubble key={message.id} {...message} />
					))
				)}
			</div>

			<MessageInput onSendMessage={handleSendMessage} isSending={isSending} />
		</div>
	);
}
