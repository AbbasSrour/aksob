import { count, sql } from "drizzle-orm";
import { Elysia } from "elysia";
import { db, schema } from "@/db";
import { authContext } from "@/plugins/auth";

export const statsModule = new Elysia({ prefix: "/api/stats" })
	.use(authContext)
	.get(
		"/",
		async () => {
			const [
				totalUsers,
				usersByType,
				totalOpportunities,
				opportunitiesByStatus,
				opportunitiesByType,
				totalStories,
				storiesByStatus,
				storiesByCategory,
				totalResearch,
				researchByStatus,
				researchByType,
				usersByMajor,
			] = await Promise.all([
				db.select({ count: count() }).from(schema.user),

				db
					.select({
						userType: schema.user.userType,
						count: count(),
					})
					.from(schema.user)
					.groupBy(schema.user.userType),

				db.select({ count: count() }).from(schema.opportunity),

				db
					.select({
						status: schema.opportunity.status,
						count: count(),
					})
					.from(schema.opportunity)
					.groupBy(schema.opportunity.status),

				db
					.select({
						type: schema.opportunity.type,
						count: count(),
					})
					.from(schema.opportunity)
					.groupBy(schema.opportunity.type),

				db.select({ count: count() }).from(schema.story),

				db
					.select({
						status: schema.story.status,
						count: count(),
					})
					.from(schema.story)
					.groupBy(schema.story.status),

				db
					.select({
						category: schema.story.category,
						count: count(),
					})
					.from(schema.story)
					.groupBy(schema.story.category),

				db.select({ count: count() }).from(schema.research),

				db
					.select({
						status: schema.research.status,
						count: count(),
					})
					.from(schema.research)
					.groupBy(schema.research.status),

				db
					.select({
						researchType: schema.research.researchType,
						count: count(),
					})
					.from(schema.research)
					.groupBy(schema.research.researchType),

				db
					.select({
						major: schema.user.major,
						count: count(),
					})
					.from(schema.user)
					.groupBy(schema.user.major),
			]);

			const recentUsers = await db.query.user.findMany({
				orderBy: sql`${schema.user.createdAt} DESC`,
				limit: 5,
				columns: {
					id: true,
					name: true,
					email: true,
					userType: true,
					major: true,
					image: true,
					createdAt: true,
				},
			});

			const recentOpportunities = await db.query.opportunity.findMany({
				orderBy: sql`${schema.opportunity.createdAt} DESC`,
				limit: 5,
				columns: {
					id: true,
					type: true,
					company: true,
					status: true,
					createdAt: true,
				},
				with: {
					author: {
						columns: {
							id: true,
							name: true,
							image: true,
						},
					},
				},
			});

			const recentStories = await db.query.story.findMany({
				orderBy: sql`${schema.story.createdAt} DESC`,
				limit: 5,
				columns: {
					id: true,
					title: true,
					category: true,
					status: true,
					createdAt: true,
				},
				with: {
					author: {
						columns: {
							id: true,
							name: true,
							image: true,
						},
					},
				},
			});

			return {
				status: "ok",
				data: {
					users: {
						total: totalUsers[0]?.count ?? 0,
						byType: Object.fromEntries(
							usersByType.map((r) => [r.userType, r.count]),
						),
						byMajor: Object.fromEntries(
							usersByMajor
								.filter((r) => r.major !== null)
								.map((r) => [r.major, r.count]),
						),
					},
					opportunities: {
						total: totalOpportunities[0]?.count ?? 0,
						byStatus: Object.fromEntries(
							opportunitiesByStatus.map((r) => [r.status, r.count]),
						),
						byType: Object.fromEntries(
							opportunitiesByType.map((r) => [r.type, r.count]),
						),
					},
					stories: {
						total: totalStories[0]?.count ?? 0,
						byStatus: Object.fromEntries(
							storiesByStatus.map((r) => [r.status, r.count]),
						),
						byCategory: Object.fromEntries(
							storiesByCategory.map((r) => [r.category, r.count]),
						),
					},
					research: {
						total: totalResearch[0]?.count ?? 0,
						byStatus: Object.fromEntries(
							researchByStatus.map((r) => [r.status, r.count]),
						),
						byType: Object.fromEntries(
							researchByType.map((r) => [r.researchType, r.count]),
						),
					},
					recent: {
						users: recentUsers.map((u) => ({
							id: u.id,
							name: u.name,
							email: u.email,
							userType: u.userType,
							major: u.major,
							image: u.image,
							createdAt: u.createdAt?.toISOString() ?? null,
						})),
						opportunities: recentOpportunities.map((o) => ({
							id: o.id,
							type: o.type,
							company: o.company,
							status: o.status,
							author: o.author
								? {
										id: o.author.id,
										name: o.author.name,
										image: o.author.image,
									}
								: null,
							createdAt: o.createdAt?.toISOString() ?? null,
						})),
						stories: recentStories.map((s) => ({
							id: s.id,
							title: s.title,
							category: s.category,
							status: s.status,
							author: s.author
								? {
										id: s.author.id,
										name: s.author.name,
										image: s.author.image,
									}
								: null,
							createdAt: s.createdAt?.toISOString() ?? null,
						})),
					},
				},
			};
		},
		{
			auth: true,
			detail: {
				tags: ["Stats"],
				summary: "Get application statistics",
			},
		},
	);
