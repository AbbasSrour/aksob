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

		route("/stories", "stories/layout.tsx", [
			index("stories/pages/list.tsx"),
			route("/create", "stories/pages/create.tsx"),
			route("/$storyId/edit", "stories/pages/edit.tsx"),
		]),
	]),

	// API routes
	physical("/api", "api"),
]);
