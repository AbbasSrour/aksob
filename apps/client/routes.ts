import {
	index,
	physical,
	rootRoute,
	route,
} from "@tanstack/virtual-file-routes";

export const routes = rootRoute("__root.tsx", [
	index("index.tsx"),
	route("/maintenance", "maintenance.tsx"),

	// Auth Routes
	route("/auth", "auth/layout.tsx", [
		route("/login", "auth/pages/login.tsx"),
		route("/forgot-password", "auth/pages/forgot-password.tsx"),
		route("/reset-password", "auth/pages/reset-password.tsx"),
	]),

	// Admin Routes
	route("admin", "admin.route.tsx", [
		route("/dashboard", "dashboard/pages/admin-dashboard.tsx"),
		route("/profile", "profile/pages/index.tsx"),

		route("/users", "users/layout.tsx", [
			index("users/pages/list.tsx"),
			route("/create", "users/pages/create.tsx"),
			route("/$userId/edit", "users/pages/userId-edit.tsx"),
		]),

		route("/news", "news/layout.tsx", [
			index("news/pages/list.tsx"),
			route("/create", "news/pages/create.tsx"),
			route("/$newsId/edit", "news/pages/edit.tsx"),
		]),

		route("/stories", "stories/layout.tsx", [
			index("stories/pages/list.tsx"),
			route("/create", "stories/pages/create.tsx"),
			route("/$storyId/edit", "stories/pages/edit.tsx"),
		]),

		route("/members", "members/layout.tsx", [
			index("members/pages/list.tsx"),
			route("/create", "members/pages/create.tsx"),
			route("/$memberId/edit", "members/pages/memberId-edit.tsx"),
		]),

		route("/programs", "programs/layout.tsx", [
			index("programs/pages/list.tsx"),
			route("/create", "programs/pages/create.tsx"),
			route("/$programId/edit", "programs/pages/programId-edit.tsx"),
		]),

		route("/opportunities", "opportunities/layout.tsx", [
			index("opportunities/pages/list.tsx"),
			route("/create", "opportunities/pages/create.tsx"),
			route("/$opportunityId/edit", "opportunities/pages/edit.tsx"),
		]),

		route("/research", "research/layout.tsx", [
			index("research/pages/list.tsx"),
			route("/create", "research/pages/create.tsx"),
			route("/$researchId/edit", "research/pages/$researchId-edit.tsx"),
		]),

		route("/events", "events/layout.tsx", [
			index("events/pages/list.tsx"),
			route("/create", "events/pages/create.tsx"),
			route("/$eventId", "events/pages/$eventId-index.tsx"),
			route("/$eventId/edit", "events/pages/eventId-edit.tsx"),
		]),
	]),

	// API routes
	physical("/api", "api"),
]);
