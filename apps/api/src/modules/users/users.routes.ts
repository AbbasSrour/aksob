import { and, desc, eq, inArray, or, sql } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db, schema } from "@/db";
import { CONNECTION_TYPES } from "@/modules/connections/constant/connection-types.constant";
import { auth } from "@/lib/auth";
import { authContext } from "@/plugins/auth";
import { generateAndStoreEmbedding } from "@/modules/ai/ai-embedding";
import type { UserType } from "@/modules/users/constant/user-types";

const usersIdParamSchema = t.Object({
	id: t.String(),
});

const usersOpenApiDetail = {
	tags: ["Users"],
};

const normalizeUserType = (type: string): UserType => {
	if (
		type === "alumni" ||
		type === "faculty" ||
		type === "student"
	) {
		return type;
	}
	return "student";
};

export const usersModule = new Elysia({ prefix: "/users" })
	.get(
		"/me",
		async ({ request, set }) => {
			const session = await auth.api.getSession({ headers: request.headers });

			if (!session?.user) {
				set.status = 401;
				return { status: "error", error: "Not authenticated" };
			}

			const [currentUser] = await db
				.select({
					id: schema.user.id,
					name: schema.user.name,
					email: schema.user.email,
					type: schema.user.type,
					bio: schema.user.bio,
					image: schema.user.image,
					createdAt: schema.user.createdAt,
					facultyTitle: schema.facultyProfile.title,
					isVisibleInGalaxy: schema.userSettings.isVisibleInGalaxy,
					emailVisible: schema.userSettings.emailVisible,
					phoneNumberVisible: schema.userSettings.phoneNumberVisible,
				})
				.from(schema.user)
				.leftJoin(
					schema.facultyProfile,
					eq(schema.user.id, schema.facultyProfile.userId),
				)
				.leftJoin(
					schema.userSettings,
					eq(schema.user.id, schema.userSettings.userId),
				)
				.where(eq(schema.user.id, session.user.id));

			if (!currentUser) {
				set.status = 404;
				return { status: "error", error: "User not found" };
			}

			// Fetch all education entries for this user
			const educationRows = await db
				.select({
					programId: schema.userEducation.programId,
					programName: schema.program.name,
					graduationYear: schema.userEducation.graduationYear,
					isPrimary: schema.userEducation.isPrimary,
				})
				.from(schema.userEducation)
				.innerJoin(
					schema.program,
					eq(schema.userEducation.programId, schema.program.id),
				)
				.where(eq(schema.userEducation.userId, session.user.id!));

			const connectionPrefs = await db
				.select({ type: schema.userConnectionPreference.type })
				.from(schema.userConnectionPreference)
				.where(
					eq(
						schema.userConnectionPreference.userId,
						session.user.id!,
					),
				);

			// Fetch all experience entries for this user
			const experienceRows = await db
				.select({
					id: schema.experience.id,
					type: schema.experience.type,
					title: schema.experience.title,
					company: schema.experience.company,
					startDate: schema.experience.startDate,
					endDate: schema.experience.endDate,
					isCurrent: schema.experience.isCurrent,
				})
				.from(schema.experience)
				.where(eq(schema.experience.userId, session.user.id!));

			// Fetch all tags for this user
			const tagRows = await db
				.select({
					category: schema.userTag.category,
					value: schema.userTag.value,
				})
				.from(schema.userTag)
				.where(eq(schema.userTag.userId, session.user.id!));

			const tags = {
				skills: tagRows
					.filter((t) => t.category === "skill")
					.map((t) => t.value),
				goals: tagRows
					.filter((t) => t.category === "goal")
					.map((t) => t.value),
				hobbies: tagRows
					.filter((t) => t.category === "hobby")
					.map((t) => t.value),
			};

			// Fetch all links for this user
			const linkRows = await db
				.select({
					id: schema.links.id,
					platform: schema.links.platform,
					url: schema.links.url,
				})
				.from(schema.links)
				.where(eq(schema.links.userId, session.user.id!));

			return {
				status: "ok",
				data: {
					id: currentUser.id,
					name: currentUser.name,
					email: currentUser.email,
					type: normalizeUserType(currentUser.type),
					majors: educationRows.map((row) => ({
						programId: row.programId,
						name: row.programName,
						graduationYear: row.graduationYear ?? null,
						isPrimary: row.isPrimary ?? false,
					})),
					bio: currentUser.bio,
					company: null,
					title: currentUser.facultyTitle ?? null,
					image: currentUser.image,
					createdAt: currentUser.createdAt,
					isVisibleInGalaxy: currentUser.isVisibleInGalaxy ?? true,
					emailVisible: currentUser.emailVisible ?? false,
					phoneNumberVisible: currentUser.phoneNumberVisible ?? false,
					connectionTypes: connectionPrefs.map((p) => p.type),
					experience: experienceRows,
					tags,
					links: linkRows,
				},
			};
		},
		{
			detail: { ...usersOpenApiDetail, summary: "Get current user" },
		},
	)
	.get(
		"/",
		async ({ query }) => {
			const userType = query.type as UserType | undefined;
			const connectionType = query.connectionType as string | undefined;

			const whereClauses = [
				or(
					eq(schema.userSettings.isVisibleInGalaxy, true),
					sql`${schema.userSettings.userId} IS NULL`,
				),
			];

			if (userType && ["alumni", "faculty", "student"].includes(userType)) {
				whereClauses.push(eq(schema.user.type, userType));
			}

			const baseSelect = {
				id: schema.user.id,
				name: schema.user.name,
				email: schema.user.email,
				type: schema.user.type,
				bio: schema.user.bio,
				image: schema.user.image,
				createdAt: schema.user.createdAt,
				facultyTitle: schema.facultyProfile.title,
			};

			let users: Array<typeof baseSelect & { id: string }>;

			if (connectionType) {
				const ct = connectionType as typeof CONNECTION_TYPES[number];
				users = await db
					.select(baseSelect)
					.from(schema.user)
					.innerJoin(
						schema.userConnectionPreference,
						eq(schema.user.id, schema.userConnectionPreference.userId),
					)
					.leftJoin(
						schema.userSettings,
						eq(schema.user.id, schema.userSettings.userId),
					)
					.leftJoin(
						schema.facultyProfile,
						eq(schema.user.id, schema.facultyProfile.userId),
					)
					.where(
						and(
							eq(schema.userConnectionPreference.type, ct),
							...whereClauses,
						),
					)
					.orderBy(desc(schema.user.createdAt));
			} else {
				users = await db
					.select(baseSelect)
					.from(schema.user)
					.leftJoin(
						schema.userSettings,
						eq(schema.user.id, schema.userSettings.userId),
					)
					.leftJoin(
						schema.facultyProfile,
						eq(schema.user.id, schema.facultyProfile.userId),
					)
					.where(and(...whereClauses))
					.orderBy(desc(schema.user.createdAt));
			}

			// Fetch all education entries for these users
			const userIds = users.map((u) => u.id);
			const educationRows =
				userIds.length > 0
					? await db
							.select({
								userId: schema.userEducation.userId,
								programName: schema.program.name,
								graduationYear: schema.userEducation.graduationYear,
							})
							.from(schema.userEducation)
							.innerJoin(
								schema.program,
								eq(schema.userEducation.programId, schema.program.id),
							)
							.where(inArray(schema.userEducation.userId, userIds))
					: [];

			// Group education entries by user
			const educationByUser = new Map<string, Array<{ name: string; graduationYear: number | null }>>();
			for (const row of educationRows) {
				if (!row.programName) continue;
				const list = educationByUser.get(row.userId) ?? [];
				list.push({ name: row.programName, graduationYear: row.graduationYear ?? null });
				educationByUser.set(row.userId, list);
			}

			return {
				status: "ok",
				data: users.map((user) => ({
					id: user.id,
					name: user.name,
					email: user.email,
					type: normalizeUserType(user.type),
					majors: educationByUser.get(user.id) ?? [],
					bio: user.bio,
					company: null,
					title: user.facultyTitle ?? null,
					image: user.image,
					createdAt: user.createdAt,
				})),
			};
		},
		{
			detail: usersOpenApiDetail,
		},
	)
	.get(
		"/:id",
		async ({ params, set }) => {
			const [currentUser] = await db
				.select({
					id: schema.user.id,
					name: schema.user.name,
					email: schema.user.email,
					type: schema.user.type,
					bio: schema.user.bio,
					image: schema.user.image,
					createdAt: schema.user.createdAt,
					programName: schema.program.name,
					graduationYear: schema.userEducation.graduationYear,
					facultyTitle: schema.facultyProfile.title,
				})
				.from(schema.user)
				.leftJoin(
					schema.userEducation,
					and(
						eq(schema.user.id, schema.userEducation.userId),
						eq(schema.userEducation.isPrimary, true),
					),
				)
				.leftJoin(
					schema.program,
					eq(schema.userEducation.programId, schema.program.id),
				)
				.leftJoin(
					schema.facultyProfile,
					eq(schema.user.id, schema.facultyProfile.userId),
				)
				.where(eq(schema.user.id, params.id));

			if (!currentUser) {
				set.status = 404;
				return { status: "error", error: "User not found" };
			}

			return {
				status: "ok",
				data: {
					id: currentUser.id,
					name: currentUser.name,
					email: currentUser.email,
					type: normalizeUserType(currentUser.type),
					major: currentUser.programName ?? null,
					graduationYear: currentUser.graduationYear ?? null,
					bio: currentUser.bio,
					company: null,
					title: currentUser.facultyTitle ?? null,
					image: currentUser.image,
					createdAt: currentUser.createdAt,
				},
			};
		},
		{
			params: usersIdParamSchema,
			detail: usersOpenApiDetail,
		},
	)
	.use(authContext)
	.put(
		"/me/education",
		async ({ body, user }) => {
			const userId = user!.id;

			await db
				.delete(schema.userEducation)
				.where(eq(schema.userEducation.userId, userId));

			if (body.entries.length > 0) {
				await db.insert(schema.userEducation).values(
					body.entries.map((entry) => ({
						id: crypto.randomUUID(),
						userId,
						programId: entry.programId,
						graduationYear: entry.graduationYear ?? null,
						isPrimary: entry.isPrimary ?? false,
					})),
				);
			}

			const updated = await db
				.select()
				.from(schema.userEducation)
				.where(eq(schema.userEducation.userId, userId));

			void generateAndStoreEmbedding(userId);

			return { status: "ok", data: updated };
		},
		{
			auth: true,
			body: t.Object({
				entries: t.Array(
					t.Object({
						programId: t.String(),
						graduationYear: t.Optional(t.Nullable(t.Number())),
						isPrimary: t.Optional(t.Boolean()),
					}),
				),
			}),
		},
	)
	.put(
		"/me/experience",
		async ({ body, user }) => {
			const userId = user!.id;

			await db
				.delete(schema.experience)
				.where(eq(schema.experience.userId, userId));

			if (body.entries.length > 0) {
				await db.insert(schema.experience).values(
					body.entries.map((entry) => ({
						id: crypto.randomUUID(),
						userId,
						type: entry.type,
						title: entry.title,
						company: entry.company,
						startDate: entry.startDate ?? null,
						endDate: entry.endDate ?? null,
						isCurrent: entry.isCurrent ?? false,
					})),
				);
			}

			const updated = await db
				.select()
				.from(schema.experience)
				.where(eq(schema.experience.userId, userId));

			void generateAndStoreEmbedding(userId);

			return { status: "ok", data: updated };
		},
		{
			auth: true,
			body: t.Object({
				entries: t.Array(
					t.Object({
						type: t.String(),
						title: t.String(),
						company: t.String(),
						startDate: t.Optional(t.Nullable(t.String())),
						endDate: t.Optional(t.Nullable(t.String())),
						isCurrent: t.Optional(t.Boolean()),
					}),
				),
			}),
		},
	)
	.put(
		"/me/tags",
		async ({ body, user }) => {
			const userId = user!.id;

			await db
				.delete(schema.userTag)
				.where(eq(schema.userTag.userId, userId));

			const tags: Array<{ id: string; userId: string; category: string; value: string }> = [];

			for (const skill of body.skills) {
				tags.push({ id: crypto.randomUUID(), userId, category: "skill", value: skill });
			}
			for (const goal of body.goals) {
				tags.push({ id: crypto.randomUUID(), userId, category: "goal", value: goal });
			}
			for (const hobby of body.hobbies) {
				tags.push({ id: crypto.randomUUID(), userId, category: "hobby", value: hobby });
			}

			if (tags.length > 0) {
				await db.insert(schema.userTag).values(tags);
			}

			const updated = await db
				.select()
				.from(schema.userTag)
				.where(eq(schema.userTag.userId, userId));

			void generateAndStoreEmbedding(userId);

			return { status: "ok", data: updated };
		},
		{
			auth: true,
			body: t.Object({
				skills: t.Array(t.String()),
				goals: t.Array(t.String()),
				hobbies: t.Array(t.String()),
			}),
		},
	)
	.put(
		"/me/links",
		async ({ body, user }) => {
			const userId = user!.id;

			await db
				.delete(schema.links)
				.where(eq(schema.links.userId, userId));

			if (body.entries.length > 0) {
				await db.insert(schema.links).values(
					body.entries.map((entry) => ({
						id: crypto.randomUUID(),
						userId,
						platform: entry.platform,
						url: entry.url,
					})),
				);
			}

			const updated = await db
				.select()
				.from(schema.links)
				.where(eq(schema.links.userId, userId));

			return { status: "ok", data: updated };
		},
		{
			auth: true,
			body: t.Object({
				entries: t.Array(
					t.Object({
						platform: t.String(),
						url: t.String(),
					}),
				),
			}),
		},
	);
