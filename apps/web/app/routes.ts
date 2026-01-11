import { index, layout, type RouteConfig, route } from "@react-router/dev/routes";

export default [
	// Auth Routes (Login, Register, etc.) - No Navbar
	layout("routes/auth/layout.tsx", [
		route("auth/login", "routes/auth/login.tsx"),
		route("auth/register", "routes/auth/register.tsx"),
		route("auth/forgot-password", "routes/auth/forgot-password.tsx"),
		route("auth/reset-password", "routes/auth/reset-password.tsx"),
		route("auth/verify-email", "routes/auth/verify-email.tsx"),
		route("auth/verify-email-sent", "routes/auth/verify-email-sent.tsx"),
	]),

	// Main App Routes - Wrapped with Navbar
	layout("routes/main-layout.tsx", [
		index("galaxy/galaxy.tsx"),
		route("profile", "routes/profile.tsx"),

		// Chat Routes - Nested Layout for split view
		layout("routes/chat/layout.tsx", [
			route("chat", "routes/chat/index.tsx"),
			route("chat/:conversationId", "routes/chat/$conversationId.tsx"),
		]),
	]),
] satisfies RouteConfig;
