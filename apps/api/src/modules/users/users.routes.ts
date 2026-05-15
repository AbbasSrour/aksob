import { and, desc, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db, schema } from "@/db";
import { CONNECTION_TYPES } from "@/modules/connections/constant/connection-types.constant";
import { auth } from "@/lib/auth";
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
					program: schema.program.name,
					bio: schema.user.bio,
					image: schema.user.image,
					createdAt: schema.user.createdAt,
					alumniCompany: schema.alumniProfile.company,
					alumniTitle: schema.alumniProfile.title,
					facultyTitle: schema.facultyProfile.title,
					isVisibleInGalaxy: schema.userSettings.isVisibleInGalaxy,
					emailVisible: schema.userSettings.emailVisible,
					phoneNumberVisible: schema.userSettings.phoneNumberVisible,
				})
				.from(schema.user)
				.leftJoin(
					schema.alumniProfile,
					eq(schema.user.id, schema.alumniProfile.userId),
				)
				.leftJoin(
					schema.facultyProfile,
					eq(schema.user.id, schema.facultyProfile.userId),
				)
				.leftJoin(
					schema.userSettings,
					eq(schema.user.id, schema.userSettings.userId),
				)
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
				.where(eq(schema.user.id, session.user.id));

			if (!currentUser) {
				set.status = 404;
				return { status: "error", error: "User not found" };
			}

			const connectionPrefs = await db
				.select({ type: schema.userConnectionPreference.type })
				.from(schema.userConnectionPreference)
				.where(
					eq(
						schema.userConnectionPreference.userId,
						session.user.id!,
					),
				);

			return {
				status: "ok",
				data: {
					id: currentUser.id,
					name: currentUser.name,
					email: currentUser.email,
					type: normalizeUserType(currentUser.type),
					program: currentUser.program ?? null,
					bio: currentUser.bio,
					company: currentUser.alumniCompany ?? null,
					title: currentUser.alumniTitle ?? currentUser.facultyTitle ?? null,
					image: currentUser.image,
					createdAt: currentUser.createdAt,
					isVisibleInGalaxy: currentUser.isVisibleInGalaxy ?? true,
					emailVisible: currentUser.emailVisible ?? false,
					phoneNumberVisible: currentUser.phoneNumberVisible ?? false,
					connectionTypes: connectionPrefs.map((p) => p.type),
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

			const whereClauses = [];

			if (userType && ["alumni", "faculty", "student"].includes(userType)) {
				whereClauses.push(eq(schema.user.type, userType));
			}

			if (connectionType) {
				// Filter to users open to this connection type and visible in galaxy
				const ct = connectionType as typeof CONNECTION_TYPES[number];
				const users = await db
					.select({
						id: schema.user.id,
						name: schema.user.name,
						email: schema.user.email,
						type: schema.user.type,
						program: schema.program.name,
						bio: schema.user.bio,
						image: schema.user.image,
						createdAt: schema.user.createdAt,
						alumniCompany: schema.alumniProfile.company,
						alumniTitle: schema.alumniProfile.title,
						facultyTitle: schema.facultyProfile.title,
					})
					.from(schema.user)
					.innerJoin(
						schema.userConnectionPreference,
						eq(
							schema.user.id,
							schema.userConnectionPreference.userId,
						),
					)
					.leftJoin(
						schema.userSettings,
						eq(schema.user.id, schema.userSettings.userId),
					)
					.leftJoin(
						schema.alumniProfile,
						eq(schema.user.id, schema.alumniProfile.userId),
					)
					.leftJoin(
						schema.facultyProfile,
						eq(schema.user.id, schema.facultyProfile.userId),
					)
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
					.where(
						and(
							eq(
								schema.userConnectionPreference.type,
								ct,
							),
							eq(
								schema.userSettings.isVisibleInGalaxy,
								true,
							),
							...whereClauses,
						),
					)
					.orderBy(desc(schema.user.createdAt));

				return {
					status: "ok",
					data: users.map((user) => ({
						id: user.id,
						name: user.name,
						email: user.email,
						type: normalizeUserType(user.type),
						program: user.program ?? null,
						bio: user.bio,
						company: user.alumniCompany ?? null,
						title: user.alumniTitle ?? user.facultyTitle ?? null,
						image: user.image,
						createdAt: user.createdAt,
					})),
				};
			}

			const users = await db
				.select({
					id: schema.user.id,
					name: schema.user.name,
					email: schema.user.email,
					type: schema.user.type,
					program: schema.program.name,
					bio: schema.user.bio,
					image: schema.user.image,
					createdAt: schema.user.createdAt,
					alumniCompany: schema.alumniProfile.company,
					alumniTitle: schema.alumniProfile.title,
					facultyTitle: schema.facultyProfile.title,
				})
				.from(schema.user)
				.leftJoin(
					schema.alumniProfile,
					eq(schema.user.id, schema.alumniProfile.userId),
				)
				.leftJoin(
					schema.facultyProfile,
					eq(schema.user.id, schema.facultyProfile.userId),
				)
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
				.where(and(...whereClauses))
				.orderBy(desc(schema.user.createdAt));

			return {
				status: "ok",
				data: users.map((user) => ({
					id: user.id,
					name: user.name,
					email: user.email,
					type: normalizeUserType(user.type),
					program: user.program ?? null,
					bio: user.bio,
					company: user.alumniCompany ?? null,
					title: user.alumniTitle ?? user.facultyTitle ?? null,
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
					program: schema.program.name,
					bio: schema.user.bio,
					image: schema.user.image,
					createdAt: schema.user.createdAt,
					alumniCompany: schema.alumniProfile.company,
					alumniTitle: schema.alumniProfile.title,
					facultyTitle: schema.facultyProfile.title,
				})
				.from(schema.user)
				.leftJoin(
					schema.alumniProfile,
					eq(schema.user.id, schema.alumniProfile.userId),
				)
				.leftJoin(
					schema.facultyProfile,
					eq(schema.user.id, schema.facultyProfile.userId),
				)
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
					program: currentUser.program ?? null,
					bio: currentUser.bio,
					company: currentUser.alumniCompany ?? null,
					title: currentUser.alumniTitle ?? currentUser.facultyTitle ?? null,
					image: currentUser.image,
					createdAt: currentUser.createdAt,
				},
			};
		},
		{
			params: usersIdParamSchema,
			detail: usersOpenApiDetail,
		},
	);
