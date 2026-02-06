import { apiFetch } from "~/app/lib/api";

export interface ChatConversation {
	id: string;
	otherUser: {
		id: string;
		name: string;
		email: string;
		major: string;
		image: string | null;
	};
	lastMessage: {
		id: string;
		content: string;
		senderId: string;
		createdAt: string;
	} | null;
}

export interface ChatMessage {
	id: string;
	conversationId: string;
	senderId: string;
	senderName: string;
	content: string;
	createdAt: string;
}

export async function listConversations() {
	return apiFetch<{ status: "ok"; data: ChatConversation[] }>(
		"/chat/conversations",
	);
}

export async function listMessages(conversationId: string, limit = 150) {
	return apiFetch<{ status: "ok"; data: ChatMessage[] }>(
		`/chat/${conversationId}/messages?limit=${limit}`,
	);
}

export async function sendMessage(conversationId: string, content: string) {
	return apiFetch<{ status: "ok"; data: ChatMessage }>(
		`/chat/${conversationId}/messages`,
		{
			method: "POST",
			body: JSON.stringify({ content }),
		},
	);
}

export async function createOrGetDm(userId: string) {
	return apiFetch<{ status: "ok"; data: { conversationId: string } }>(
		"/chat/dm",
		{
			method: "POST",
			body: JSON.stringify({ userId }),
		},
	);
}
