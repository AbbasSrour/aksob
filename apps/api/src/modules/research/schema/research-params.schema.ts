import { t } from "elysia";
import { researchTypeEnum } from "@/modules/research/constant/research-types.constant";
import { researchStatusEnum } from "@/modules/research/schema/research-response.schema";

export const researchFilters = t.Object({
	researchType: t.Optional(t.Enum(researchTypeEnum)),
});

const researchPageOptions = t.Object({
	page: t.Optional(t.Numeric({ minimum: 1 })),
	limit: t.Optional(t.Numeric({ minimum: 1, maximum: 50 })),
});

const researchListOptions = t.Object({
	authorId: t.Optional(t.String()),
	status: t.Optional(researchStatusEnum),
	search: t.Optional(t.String()),
});

export const listResearchQuery = t.Composite([
	researchFilters,
	researchPageOptions,
	researchListOptions,
]);
