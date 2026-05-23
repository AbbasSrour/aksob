import { t } from "elysia";

export const createDonorBody = t.Object({
	name: t.String({ minLength: 1, maxLength: 255 }),
	position: t.String({ minLength: 1, maxLength: 255 }),
	company: t.String({ minLength: 1, maxLength: 255 }),
	donationAmount: t.Optional(t.Number()),
	message: t.Optional(t.String()),
	image: t.Optional(t.String()),
});
