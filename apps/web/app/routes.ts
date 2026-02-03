import {
	index,
	layout,
	type RouteConfig,
	route,
} from "@react-router/dev/routes";

export default [
	layout("auth.layout.tsx", [
		route("auth/login", "auth/pages/login.tsx"),
		route("auth/register", "auth/pages/register.tsx"),
		route("auth/forgot-password", "auth/pages/forgot-password.tsx"),
		route("auth/reset-password", "auth/pages/reset-password.tsx"),
		route("auth/verify-email", "auth/pages/verify-email.tsx"),
		route("auth/verify-email-sent", "auth/pages/verify-email-sent.tsx"),
	]),

	layout("layout.tsx", [
		index("galaxy/pages/galaxy.tsx", {
			id: "home",
		}),

		route("galaxy", "galaxy/pages/galaxy.tsx"),
		route("profile", "profile/pages/index.tsx"),

		layout("chat/pages/layout.tsx", [
			route("chat", "chat/pages/index.tsx"),
			route("chat/:conversationId", "chat/pages/conversation.tsx"),
		]),
	]),
] satisfies RouteConfig;
