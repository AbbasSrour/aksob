import { count, desc, eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { db, schema } from "@/db";
import { DONOR_ERRORS } from "@/modules/donors/constant/donor-errors.constant";
import { createDonorBody } from "@/modules/donors/schema/donor-create.schema";
import { listDonorsQuery } from "@/modules/donors/schema/donor-params.schema";
import {
	donorResponse,
	donorsListResponse,
} from "@/modules/donors/schema/donor-response.schema";
import { toDonorDto } from "@/modules/donors/utils/donor.mapper";
import { authContext } from "@/plugins/auth";
import { paginate } from "@/utils/paginate";

export const donorsModule = new Elysia({ prefix: "/donors" })
	.use(authContext)
	.get(
		"/",
		async ({ query }) => {
			const page = paginate(query);

			const [countResult] = await db
				.select({ count: count() })
				.from(schema.donor);

			const donors = await db.query.donor.findMany({
				orderBy: [desc(schema.donor.createdAt)],
				limit: page.limit,
				offset: page.offset,
			});

			return {
				status: "ok",
				data: donors.map(toDonorDto),
				meta: page.meta(countResult?.count ?? 0),
			};
		},
		{
			auth: "optional",
			query: listDonorsQuery,
			response: donorsListResponse,
			detail: {
				tags: ["Donors"],
				summary: "List donors",
				description: "Returns all donors (public).",
			},
		},
	)
	.get(
		"/:id",
		async ({ params, set }) => {
			const donor = await db.query.donor.findFirst({
				where: eq(schema.donor.id, params.id),
			});

			if (!donor) {
				set.status = DONOR_ERRORS.DONOR_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: DONOR_ERRORS.DONOR_NOT_FOUND.code,
					error: DONOR_ERRORS.DONOR_NOT_FOUND.message,
				};
			}

			return { status: "ok", data: toDonorDto(donor) };
		},
		{
			auth: "optional",
			detail: {
				tags: ["Donors"],
				summary: "Get a donor by id",
			},
		},
	)
	.post(
		"/",
		async ({ body }) => {
			const now = new Date();
			const donorId = crypto.randomUUID();

			await db.insert(schema.donor).values({
				id: donorId,
				name: body.name,
				position: body.position,
				company: body.company,
				donationAmount: body.donationAmount ?? null,
				message: body.message ?? null,
				image: body.image ?? null,
				createdAt: now,
				updatedAt: now,
			});

			return {
				status: "ok",
				data: {
					id: donorId,
					name: body.name,
					position: body.position,
					company: body.company,
					donationAmount: body.donationAmount ?? null,
					message: body.message ?? null,
					image: body.image ?? null,
					createdAt: now.toISOString(),
					updatedAt: now.toISOString(),
				},
			};
		},
		{
			auth: true,
			role: "admin",
			body: createDonorBody,
			response: donorResponse,
			detail: {
				tags: ["Donors"],
				summary: "Create a donor",
				description: "Admin only.",
			},
		},
	)
	.put(
		"/:id",
		async ({ params, body, set }) => {
			const donor = await db.query.donor.findFirst({
				where: eq(schema.donor.id, params.id),
			});

			if (!donor) {
				set.status = DONOR_ERRORS.DONOR_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: DONOR_ERRORS.DONOR_NOT_FOUND.code,
					error: DONOR_ERRORS.DONOR_NOT_FOUND.message,
				};
			}

			const now = new Date();

			await db
				.update(schema.donor)
				.set({
					name: body.name,
					position: body.position,
					company: body.company,
					donationAmount: body.donationAmount ?? null,
					message: body.message ?? null,
					image: body.image ?? donor.image,
					updatedAt: now,
				})
				.where(eq(schema.donor.id, params.id));

			const updated = await db.query.donor.findFirst({
				where: eq(schema.donor.id, params.id),
			});

			return { status: "ok", data: toDonorDto(updated!) };
		},
		{
			auth: true,
			role: "admin",
			body: createDonorBody,
			response: donorResponse,
			detail: {
				tags: ["Donors"],
				summary: "Update a donor",
				description: "Admin only.",
			},
		},
	)
	.delete(
		"/:id",
		async ({ params, set }) => {
			const donor = await db.query.donor.findFirst({
				where: eq(schema.donor.id, params.id),
			});

			if (!donor) {
				set.status = DONOR_ERRORS.DONOR_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: DONOR_ERRORS.DONOR_NOT_FOUND.code,
					error: DONOR_ERRORS.DONOR_NOT_FOUND.message,
				};
			}

			await db.delete(schema.donor).where(eq(schema.donor.id, params.id));

			return { status: "ok" };
		},
		{
			auth: true,
			role: "admin",
			detail: {
				tags: ["Donors"],
				summary: "Delete a donor",
				description: "Admin only.",
			},
		},
	);
