import { t } from "elysia";
import { paginatedListResponse } from "@/utils/paginate";

const donorDtoSchema = t.Object({
	id: t.String(),
	name: t.String(),
	position: t.String(),
	company: t.String(),
	donationAmount: t.Union([t.Number(), t.Null()]),
	message: t.Union([t.String(), t.Null()]),
	image: t.Union([t.String(), t.Null()]),
	createdAt: t.String(),
	updatedAt: t.String(),
});

export const donorsListResponse = paginatedListResponse(donorDtoSchema);

export const donorResponse = t.Object({
	status: t.Literal("ok"),
	data: donorDtoSchema,
});
