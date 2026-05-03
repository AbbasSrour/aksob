import { t } from "elysia";

interface PaginateInput {
	page?: number;
	limit?: number;
}

export const paginate = ({ page = 1, limit = 10 }: PaginateInput) => {
	const safePage = Math.max(page, 1);
	const safeLimit = Math.min(Math.max(limit, 1), 50);

	return {
		page: safePage,
		limit: safeLimit,
		offset: (safePage - 1) * safeLimit,
		meta: (total: number) => ({
			total,
			page: safePage,
			limit: safeLimit,
			totalPages: Math.ceil(total / safeLimit),
		}),
	};
};

export const paginationMeta = t.Object({
	total: t.Number(),
	page: t.Number(),
	limit: t.Number(),
	totalPages: t.Number(),
});

export const paginatedListResponse = <T extends t.TSchema>(item: T) =>
	t.Object({
		status: t.String(),
		data: t.Array(item),
		meta: paginationMeta,
	});
