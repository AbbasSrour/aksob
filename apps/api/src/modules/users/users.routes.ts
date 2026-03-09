import { AKSOB_MAJORS } from "@aksob/shared";
import { desc, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db, schema } from "@/db";
import { auth } from "@/lib/auth";

type UserType = "alumni" | "faculty" | "student";

const usersIdParamSchema = t.Object({
	id: t.String(),
});

const usersOpenApiDetail = {
	tags: ["Users"],
};

const normalizeUserType = (userType: string): UserType => {
	if (
		userType === "alumni" ||
		userType === "faculty" ||
		userType === "student"
	) {
		return userType;
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

			const currentUser = await db.query.user.findFirst({
				where: eq(schema.user.id, session.user.id),
			});

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
					userType: normalizeUserType(currentUser.userType),
					major: AKSOB_MAJORS.includes(
						currentUser.major as (typeof AKSOB_MAJORS)[number],
					)
						? (currentUser.major as (typeof AKSOB_MAJORS)[number])
						: AKSOB_MAJORS[0],
					company: currentUser.company,
					title: currentUser.title,
					image: currentUser.image,
					createdAt: currentUser.createdAt,
				},
			};
		},
		{
			detail: { ...usersOpenApiDetail, summary: "Get current user" },
		},
	)
	.get(
		"/",
		async () => {
			const users = await db.query.user.findMany({
				orderBy: [desc(schema.user.createdAt)],
			});

			return {
				status: "ok",
				data: users.map((currentUser) => ({
					id: currentUser.id,
					name: currentUser.name,
					email: currentUser.email,
					userType: normalizeUserType(currentUser.userType),
					major: AKSOB_MAJORS.includes(
						currentUser.major as (typeof AKSOB_MAJORS)[number],
					)
						? (currentUser.major as (typeof AKSOB_MAJORS)[number])
						: AKSOB_MAJORS[0],
					company: currentUser.company,
					title: currentUser.title,
					image: currentUser.image,
					createdAt: currentUser.createdAt,
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
			const currentUser = await db.query.user.findFirst({
				where: eq(schema.user.id, params.id),
			});

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
					userType: normalizeUserType(currentUser.userType),
					major: AKSOB_MAJORS.includes(
						currentUser.major as (typeof AKSOB_MAJORS)[number],
					)
						? (currentUser.major as (typeof AKSOB_MAJORS)[number])
						: AKSOB_MAJORS[0],
					company: currentUser.company,
					title: currentUser.title,
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
