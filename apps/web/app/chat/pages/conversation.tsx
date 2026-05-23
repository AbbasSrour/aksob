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
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const hasLoadedMessages = useRef(false);

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
				setLoadError("Failed to load conversation.");
			}
		};

		void loadConversationMeta();

		return () => {
			isMounted = false;
		};
	}, [conversationId]);

	useEffect(() => {
		if (!conversationId || !currentUserId) {
			return;
		}

		// Reset state when switching conversations
		setMessages([]);
		setIsLoading(true);
		setLoadError(null);
		hasLoadedMessages.current = false;

		let isMounted = true;

		const loadMessages = async () => {
			try {
				const response = await listMessages(conversationId);
				if (!isMounted) {
					return;
				}

				const mappedMessages = response.data.map((message) => ({
					id: message.id,
					senderId: message.senderId,
					senderName: message.senderName,
					content: message.content,
					timestamp: formatMessageTime(message.createdAt),
					isOwn: message.senderId === currentUserId,
					status: message.senderId === currentUserId ? "sent" : "read",
				}));

				// Merge: keep locally-sent messages that may not yet be in the server response
				setMessages((previousMessages) => {
					const existingIds = new Set(mappedMessages.map((m) => m.id));
					const localOnly = previousMessages.filter(
						(m) => !existingIds.has(m.id),
					);
					return [...mappedMessages, ...localOnly];
				});
				hasLoadedMessages.current = true;
				setIsLoading(false);
				setLoadError(null);
			} catch {
				if (!isMounted) {
					return;
				}
				if (!hasLoadedMessages.current) {
					setLoadError("Failed to load messages.");
				}
				setIsLoading(false);
			}
		};

		void loadMessages();
		const interval = window.setInterval(loadMessages, 3000);

		return () => {
			isMounted = false;
			window.clearInterval(interval);
		};
	}, [conversationId, currentUserId]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: scroll when messages change
	useEffect(() => {
		if (!scrollRef.current) {
			return;
		}
		scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
	}, [messages]);

	const handleSendMessage = async (text: string): Promise<boolean> => {
		if (!conversationId || isSending) {
			return false;
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
			return true;
		} catch {
			return false;
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

	if (loadError && messages.length === 0) {
		return (
			<div className="flex h-full w-full flex-col items-center justify-center bg-(--off-white) text-center">
				<p className="text-(--gray-500) mb-4">{loadError}</p>
				<button
					type="button"
					onClick={() => navigate("/chat")}
					className="px-5 py-2 rounded-full bg-[var(--aksob-primary)] text-white text-sm font-medium hover:bg-[var(--aksob-secondary)] transition-colors"
				>
					Back to Chats
				</button>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex h-full w-full flex-col items-center justify-center bg-(--off-white)">
				<div className="w-8 h-8 border-2 border-(--aksob-primary) border-t-transparent rounded-full animate-spin" />
			</div>
		);
	}

	return (
		<div className="flex h-full w-full flex-col bg-(--off-white)">
			<ChatHeader
				name={headerName}
				avatarSrc={activeConversation?.otherUser.image ?? undefined}
				isOnline={false}
				statusText={activeConversation?.otherUser.program ?? ""}
				showBack={true}
				onBack={() => navigate("/chat")}
			/>

			<div
				className="custom-scrollbar flex-1 space-y-2 overflow-y-auto p-4"
				ref={scrollRef}
			>
				{messages.length === 0 ? (
					<div className="flex h-full items-center justify-center text-sm text-(--gray-400)">
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
