import { Value } from "@sinclair/typebox/value";
import { t } from "elysia";
import { describe, expect, it } from "vitest";
import { COMMON_ERRORS } from "@/constant/common-errors.constant";
import { STORIES_ERRORS } from "@/modules/stories/constant/stories-errors.constant";
import {
	storyCategories,
	storyCategoryEnum,
} from "@/modules/stories/constant/story-categories.constant";
import { listStoriesQuery } from "@/modules/stories/schema/stories-params.schema";
import { rejectStoryBody } from "@/modules/stories/schema/stories-reject.schema";
import {
	storiesListResponse,
	storyResponseSchema,
} from "@/modules/stories/schema/stories-response.schema";
import { updateStoryBody } from "@/modules/stories/schema/stories-update.schema";
import { toStoryDto } from "@/modules/stories/utils/stories.mapper";
import { USER_ERRORS } from "@/modules/users/constant/user-errors.constant";
import {
	paginate,
	paginatedListResponse,
	paginationMeta,
} from "@/utils/paginate";

describe("paginate", () => {
	it("uses defaults when no input given", () => {
		const result = paginate({});
		expect(result.page).toBe(1);
		expect(result.limit).toBe(10);
		expect(result.offset).toBe(0);
	});

	it("clamps page to minimum 1", () => {
		const result = paginate({ page: -5 });
		expect(result.page).toBe(1);
		expect(result.offset).toBe(0);
	});

	it("clamps page 0 to 1", () => {
		const result = paginate({ page: 0 });
		expect(result.page).toBe(1);
		expect(result.offset).toBe(0);
	});

	it("clamps limit below 1 and verifies offset uses clamped value", () => {
		const result = paginate({ page: 3, limit: -1 });
		expect(result.limit).toBe(1);
		expect(result.offset).toBe(2);
	});

	it("clamps limit above 50 and verifies offset uses clamped value", () => {
		const result = paginate({ page: 2, limit: 999 });
		expect(result.limit).toBe(50);
		expect(result.offset).toBe(50);
	});

	it("handles both page and limit out-of-range", () => {
		const result = paginate({ page: -5, limit: -1 });
		expect(result.page).toBe(1);
		expect(result.limit).toBe(1);
		expect(result.offset).toBe(0);
	});

	it("accepts limit at exact boundary 1", () => {
		const result = paginate({ page: 5, limit: 1 });
		expect(result.limit).toBe(1);
		expect(result.offset).toBe(4);
	});

	it("accepts limit at exact boundary 50", () => {
		const result = paginate({ page: 1, limit: 50 });
		expect(result.limit).toBe(50);
		expect(result.offset).toBe(0);
	});

	it("calculates correct offset", () => {
		const result = paginate({ page: 3, limit: 20 });
		expect(result.page).toBe(3);
		expect(result.limit).toBe(20);
		expect(result.offset).toBe(40);
	});

	it("handles floating-point page and computes offset from raw page", () => {
		const result = paginate({ page: 1.5, limit: 10 });
		expect(result.page).toBe(1.5);
		expect(result.offset).toBe(5);
	});

	it("handles floating-point limit", () => {
		const result = paginate({ page: 1, limit: 3.7 });
		expect(result.limit).toBe(3.7);
		expect(result.offset).toBe(0);
	});

	it("meta returns correct pagination info", () => {
		const result = paginate({ page: 2, limit: 15 });
		const meta = result.meta(47);
		expect(meta.total).toBe(47);
		expect(meta.page).toBe(2);
		expect(meta.limit).toBe(15);
		expect(meta.totalPages).toBe(4);
	});

	it("meta with zero total", () => {
		const result = paginate({});
		const meta = result.meta(0);
		expect(meta.total).toBe(0);
		expect(meta.totalPages).toBe(0);
	});

	it("meta with fewer items than one page", () => {
		const result = paginate({});
		const meta = result.meta(5);
		expect(meta.total).toBe(5);
		expect(meta.totalPages).toBe(1);
	});

	it("meta with exact division", () => {
		const result = paginate({ limit: 10 });
		const meta = result.meta(30);
		expect(meta.totalPages).toBe(3);
	});
});

describe("toStoryDto", () => {
	const baseStory = {
		id: "story-1",
		title: "My Journey",
		description: "From student to leader",
		content: "<p>A long journey</p>",
		category: "career_advancement" as const,
		status: "approved" as const,
		authorId: "user-1",
		reviewedBy: null,
		reviewNotes: null,
		reviewedAt: null,
	};

	const author = {
		id: "user-1",
		name: "Alice",
		image: "https://example.com/alice.jpg",
		program: "BS in Business",
		email: "alice@example.com",
		emailVerified: false,
		type: "alumni" as const,
		company: null,
		title: null,
		role: null,
		banned: false,
		banReason: null,
		banExpires: null,
		phoneNumber: null,
		phoneNumberVerified: null,
	};

	const reviewer = {
		id: "user-2",
		name: "Bob",
		email: "bob@example.com",
		emailVerified: false,
		type: "faculty" as const,
		program: "BS in Economics",
		company: null,
		title: null,
		image: null,
		role: "admin" as const,
		banned: false,
		banReason: null,
		banExpires: null,
		phoneNumber: null,
		phoneNumberVerified: null,
	};

	const makeDate = (isoString: string) => new Date(isoString);
	const created = makeDate("2025-01-15T10:00:00.000Z");
	const updated = makeDate("2025-01-16T12:30:00.000Z");

	it("maps a story with author and no reviewer", () => {
		const dto = toStoryDto({
			...baseStory,
			storyDate: makeDate("2024-06-01T00:00:00.000Z"),
			createdAt: created,
			updatedAt: updated,
			author,
		});

		expect(dto.id).toBe("story-1");
		expect(dto.title).toBe("My Journey");
		expect(dto.description).toBe("From student to leader");
		expect(dto.content).toBe("<p>A long journey</p>");
		expect(dto.category).toBe("career_advancement");
		expect(dto.storyDate).toBe("2024-06-01T00:00:00.000Z");
		expect(dto.status).toBe("approved");
		expect(dto.author).toEqual({
			id: "user-1",
			name: "Alice",
			image: "https://example.com/alice.jpg",
			program: "BS in Business",
		});
		expect(dto.reviewedBy).toBeNull();
		expect(dto.reviewNotes).toBeNull();
		expect(dto.reviewedAt).toBeNull();
		expect(dto.createdAt).toBe("2025-01-15T10:00:00.000Z");
		expect(dto.updatedAt).toBe("2025-01-16T12:30:00.000Z");
	});

	it("maps a story with reviewer", () => {
		const reviewDate = makeDate("2025-01-17T09:00:00.000Z");

		const dto = toStoryDto({
			...baseStory,
			storyDate: null,
			createdAt: created,
			updatedAt: updated,
			author,
			reviewer,
			reviewNotes: "Looks great",
			reviewedAt: reviewDate,
		});

		expect(dto.storyDate).toBeNull();
		expect(dto.reviewedBy).toEqual({ id: "user-2", name: "Bob" });
		expect(dto.reviewNotes).toBe("Looks great");
		expect(dto.reviewedAt).toBe("2025-01-17T09:00:00.000Z");
	});

	it("throws when author is null", () => {
		expect(() =>
			toStoryDto({
				...baseStory,
				storyDate: null,
				createdAt: created,
				updatedAt: updated,
				author: null,
			}),
		).toThrow("Story story-1 is missing an author");
	});

	it("maps author with null image", () => {
		const dto = toStoryDto({
			...baseStory,
			storyDate: null,
			createdAt: created,
			updatedAt: updated,
			author: { ...author, image: null },
		});

		expect(dto.author.image).toBeNull();
	});

	it("maps reviewedBy as null when reviewer is null", () => {
		const dto = toStoryDto({
			...baseStory,
			storyDate: null,
			createdAt: created,
			updatedAt: updated,
			author,
			reviewer: null,
		});

		expect(dto.reviewedBy).toBeNull();
	});

	it("includes all required fields with correct types in output", () => {
		const dto = toStoryDto({
			...baseStory,
			storyDate: makeDate("2025-03-01T00:00:00.000Z"),
			reviewNotes: "Well written",
			reviewedAt: makeDate("2025-03-02T00:00:00.000Z"),
			createdAt: created,
			updatedAt: updated,
			author,
			reviewer,
		});

		const keys = Object.keys(dto).sort();
		expect(keys).toEqual([
			"author",
			"category",
			"content",
			"createdAt",
			"description",
			"id",
			"reviewNotes",
			"reviewedAt",
			"reviewedBy",
			"status",
			"storyDate",
			"title",
			"updatedAt",
		]);

		// Verify key value types are correct
		expect(typeof dto.id).toBe("string");
		expect(typeof dto.createdAt).toBe("string");
		expect(dto.author).not.toHaveProperty("email");
		expect(dto.reviewedBy).not.toHaveProperty("email");
	});
});

describe("stories-params.schema", () => {
	it("accepts empty query", () => {
		expect(Value.Check(listStoriesQuery, {})).toBe(true);
	});

	it("accepts valid category", () => {
		expect(
			Value.Check(listStoriesQuery, { category: "entrepreneurship" }),
		).toBe(true);
	});

	it("rejects invalid category", () => {
		expect(Value.Check(listStoriesQuery, { category: "invalid" })).toBe(false);
	});

	it("accepts valid page as string", () => {
		expect(Value.Check(listStoriesQuery, { page: "3" })).toBe(true);
	});

	it("rejects page zero as number", () => {
		expect(Value.Check(listStoriesQuery, { page: 0 })).toBe(false);
	});

	it("rejects negative page as number", () => {
		expect(Value.Check(listStoriesQuery, { page: -1 })).toBe(false);
	});

	it("accepts limit at boundary 1", () => {
		expect(Value.Check(listStoriesQuery, { limit: "1" })).toBe(true);
	});

	it("accepts limit at boundary 50", () => {
		expect(Value.Check(listStoriesQuery, { limit: "50" })).toBe(true);
	});

	it("rejects limit above 50 as number", () => {
		expect(Value.Check(listStoriesQuery, { limit: 51 })).toBe(false);
	});

	it("rejects limit below 1 as number", () => {
		expect(Value.Check(listStoriesQuery, { limit: 0 })).toBe(false);
	});

	it("filters and page options are composable", () => {
		expect(
			Value.Check(listStoriesQuery, {
				category: "social_impact",
				page: "2",
				limit: "25",
			}),
		).toBe(true);
	});

	it("accepts valid authorId", () => {
		expect(Value.Check(listStoriesQuery, { authorId: "user-abc-123" })).toBe(
			true,
		);
	});

	it("rejects non-string authorId", () => {
		expect(Value.Check(listStoriesQuery, { authorId: 123 })).toBe(false);
	});

	it("accepts valid status values", () => {
		expect(Value.Check(listStoriesQuery, { status: "pending" })).toBe(true);
		expect(Value.Check(listStoriesQuery, { status: "approved" })).toBe(true);
		expect(Value.Check(listStoriesQuery, { status: "rejected" })).toBe(true);
	});

	it("rejects invalid status", () => {
		expect(Value.Check(listStoriesQuery, { status: "archived" })).toBe(false);
	});

	it("all params compose together", () => {
		expect(
			Value.Check(listStoriesQuery, {
				category: "career_advancement",
				page: "1",
				limit: "20",
				authorId: "user-42",
				status: "pending",
			}),
		).toBe(true);
	});
});

describe("storyResponseSchema", () => {
	const validStory = {
		id: "story-1",
		title: "A Story",
		description: "Desc",
		content: "<p>Content</p>",
		category: "innovation",
		storyDate: "2025-01-01T00:00:00.000Z",
		status: "approved",
		author: {
			id: "user-1",
			name: "Alice",
			image: "https://example.com/alice.jpg",
			program: "BS in Business",
		},
		reviewedBy: null,
		reviewNotes: null,
		reviewedAt: null,
		createdAt: "2025-01-15T10:00:00.000Z",
		updatedAt: "2025-01-15T10:00:00.000Z",
	};

	it("accepts valid story with all fields", () => {
		expect(Value.Check(storyResponseSchema, validStory)).toBe(true);
	});

	it("accepts story with status pending", () => {
		expect(
			Value.Check(storyResponseSchema, {
				...validStory,
				status: "pending",
			}),
		).toBe(true);
	});

	it("accepts story with status rejected", () => {
		expect(
			Value.Check(storyResponseSchema, {
				...validStory,
				status: "rejected",
			}),
		).toBe(true);
	});

	it("accepts story with null storyDate", () => {
		expect(
			Value.Check(storyResponseSchema, {
				...validStory,
				storyDate: null,
			}),
		).toBe(true);
	});

	it("accepts story with reviewer", () => {
		expect(
			Value.Check(storyResponseSchema, {
				...validStory,
				reviewedBy: { id: "user-2", name: "Bob" },
				reviewNotes: "Approved",
				reviewedAt: "2025-01-16T00:00:00.000Z",
			}),
		).toBe(true);
	});

	it("rejects missing required fields", () => {
		expect(
			Value.Check(storyResponseSchema, {
				id: "story-1",
				title: "Missing fields",
			}),
		).toBe(false);
	});

	it("rejects invalid status", () => {
		expect(
			Value.Check(storyResponseSchema, {
				...validStory,
				status: "archived",
			}),
		).toBe(false);
	});

	it("rejects invalid category", () => {
		expect(
			Value.Check(storyResponseSchema, {
				...validStory,
				category: "not_a_category",
			}),
		).toBe(false);
	});

	it("rejects partial author object", () => {
		expect(
			Value.Check(storyResponseSchema, {
				...validStory,
				author: { id: "user-1" },
			}),
		).toBe(false);
	});

	it("accepts author with null image", () => {
		expect(
			Value.Check(storyResponseSchema, {
				...validStory,
				author: { ...validStory.author, image: null },
			}),
		).toBe(true);
	});
});

describe("updateStoryBody", () => {
	it("accepts valid body with all required fields", () => {
		expect(
			Value.Check(updateStoryBody, {
				title: "Updated Title",
				description: "Updated description",
				content: "<p>Updated content</p>",
				category: "innovation",
			}),
		).toBe(true);
	});

	it("accepts valid body with optional storyDate", () => {
		expect(
			Value.Check(updateStoryBody, {
				title: "T",
				description: "D",
				content: "C",
				category: "career_advancement",
				storyDate: "2025-06-01T00:00:00.000Z",
			}),
		).toBe(true);
	});

	it("rejects body missing title", () => {
		expect(
			Value.Check(updateStoryBody, {
				description: "D",
				content: "C",
				category: "entrepreneurship",
			}),
		).toBe(false);
	});

	it("rejects body missing category", () => {
		expect(
			Value.Check(updateStoryBody, {
				title: "T",
				description: "D",
				content: "C",
			}),
		).toBe(false);
	});

	it("rejects empty title", () => {
		expect(
			Value.Check(updateStoryBody, {
				title: "",
				description: "D",
				content: "C",
				category: "social_impact",
			}),
		).toBe(false);
	});

	it("rejects invalid category", () => {
		expect(
			Value.Check(updateStoryBody, {
				title: "T",
				description: "D",
				content: "C",
				category: "not_a_category",
			}),
		).toBe(false);
	});
});

describe("rejectStoryBody", () => {
	it("accepts valid reject body", () => {
		expect(
			Value.Check(rejectStoryBody, {
				reviewNotes: "This story needs more detail before publishing.",
			}),
		).toBe(true);
	});

	it("rejects empty reviewNotes", () => {
		expect(
			Value.Check(rejectStoryBody, {
				reviewNotes: "",
			}),
		).toBe(false);
	});

	it("rejects missing reviewNotes", () => {
		expect(Value.Check(rejectStoryBody, {})).toBe(false);
	});
});

describe("paginationMeta", () => {
	it("accepts valid pagination meta", () => {
		expect(
			Value.Check(paginationMeta, {
				total: 100,
				page: 2,
				limit: 10,
				totalPages: 10,
			}),
		).toBe(true);
	});

	it("accepts zero total with zero pages", () => {
		expect(
			Value.Check(paginationMeta, {
				total: 0,
				page: 1,
				limit: 10,
				totalPages: 0,
			}),
		).toBe(true);
	});
});

describe("storiesListResponse", () => {
	const validStory = {
		id: "story-1",
		title: "A Story",
		description: "Desc",
		content: "<p>Content</p>",
		category: "innovation",
		storyDate: "2025-01-01T00:00:00.000Z",
		status: "approved",
		author: {
			id: "user-1",
			name: "Alice",
			image: "https://example.com/alice.jpg",
			program: "BS in Business",
		},
		reviewedBy: null,
		reviewNotes: null,
		reviewedAt: null,
		createdAt: "2025-01-15T10:00:00.000Z",
		updatedAt: "2025-01-15T10:00:00.000Z",
	};

	it("accepts valid list response", () => {
		expect(
			Value.Check(storiesListResponse, {
				status: "ok",
				data: [validStory],
				meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
			}),
		).toBe(true);
	});

	it("accepts empty list", () => {
		expect(
			Value.Check(storiesListResponse, {
				status: "ok",
				data: [],
				meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
			}),
		).toBe(true);
	});
});

describe("COMMON_ERRORS", () => {
	const errors = COMMON_ERRORS;

	it("has exactly 3 keys", () => {
		expect(Object.keys(errors)).toHaveLength(3);
	});

	it("each entry has code, httpStatus, and message with correct types", () => {
		for (const entry of Object.values(errors)) {
			expect(typeof entry.code).toBe("string");
			expect(typeof entry.httpStatus).toBe("number");
			expect(typeof entry.message).toBe("string");
		}
	});

	it("NOT_AUTHENTICATED has correct values", () => {
		expect(errors.NOT_AUTHENTICATED).toEqual({
			code: "NOT_AUTHENTICATED",
			httpStatus: 401,
			message: "Not authenticated",
		});
	});

	it("FORBIDDEN has correct values", () => {
		expect(errors.FORBIDDEN).toEqual({
			code: "FORBIDDEN",
			httpStatus: 403,
			message: "Forbidden",
		});
	});

	it("NOT_FOUND has correct values", () => {
		expect(errors.NOT_FOUND).toEqual({
			code: "NOT_FOUND",
			httpStatus: 404,
			message: "Resource not found",
		});
	});

	it("each code matches its key name", () => {
		for (const [key, entry] of Object.entries(errors)) {
			expect(entry.code).toBe(key);
		}
	});
});

describe("USER_ERRORS", () => {
	const errors = USER_ERRORS;

	it("has exactly 1 key", () => {
		expect(Object.keys(errors)).toHaveLength(1);
	});

	it("each entry has code, httpStatus, and message with correct types", () => {
		for (const entry of Object.values(errors)) {
			expect(typeof entry.code).toBe("string");
			expect(typeof entry.httpStatus).toBe("number");
			expect(typeof entry.message).toBe("string");
		}
	});

	it("USER_NOT_FOUND has correct values", () => {
		expect(errors.USER_NOT_FOUND).toEqual({
			code: "USER_NOT_FOUND",
			httpStatus: 404,
			message: "User not found",
		});
	});

	it("each code matches its key name", () => {
		for (const [key, entry] of Object.entries(errors)) {
			expect(entry.code).toBe(key);
		}
	});
});

describe("STORIES_ERRORS", () => {
	const errors = STORIES_ERRORS;

	it("has exactly 3 keys", () => {
		expect(Object.keys(errors)).toHaveLength(3);
	});

	it("each entry has code, httpStatus, and message with correct types", () => {
		for (const entry of Object.values(errors)) {
			expect(typeof entry.code).toBe("string");
			expect(typeof entry.httpStatus).toBe("number");
			expect(typeof entry.message).toBe("string");
		}
	});

	it("STORY_NOT_FOUND has correct values", () => {
		expect(errors.STORY_NOT_FOUND).toEqual({
			code: "STORY_NOT_FOUND",
			httpStatus: 404,
			message: "Story not found",
		});
	});

	it("NOT_AUTHOR has correct values", () => {
		expect(errors.NOT_AUTHOR).toEqual({
			code: "NOT_AUTHOR",
			httpStatus: 403,
			message: "Only the author can perform this action",
		});
	});

	it("CANNOT_ASSIGN has correct values", () => {
		expect(errors.CANNOT_ASSIGN).toEqual({
			code: "CANNOT_ASSIGN",
			httpStatus: 403,
			message: "Only admins can assign stories to other users",
		});
	});

	it("each code matches its key name", () => {
		for (const [key, entry] of Object.entries(errors)) {
			expect(entry.code).toBe(key);
		}
	});
});

describe("paginatedListResponse schema", () => {
	const stringItem = t.String();
	const schema = paginatedListResponse(stringItem);

	it("accepts valid paginated response with string items", () => {
		expect(
			Value.Check(schema, {
				status: "ok",
				data: ["a", "b", "c"],
				meta: { total: 3, page: 1, limit: 10, totalPages: 1 },
			}),
		).toBe(true);
	});

	it("accepts empty data array", () => {
		expect(
			Value.Check(schema, {
				status: "ok",
				data: [],
				meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
			}),
		).toBe(true);
	});

	it("rejects missing status", () => {
		expect(
			Value.Check(schema, {
				data: ["a"],
				meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
			}),
		).toBe(false);
	});

	it("rejects missing data", () => {
		expect(
			Value.Check(schema, {
				status: "ok",
				meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
			}),
		).toBe(false);
	});

	it("rejects missing meta", () => {
		expect(
			Value.Check(schema, {
				status: "ok",
				data: ["a"],
			}),
		).toBe(false);
	});

	it("rejects data with wrong item type", () => {
		expect(
			Value.Check(schema, {
				status: "ok",
				data: [1, 2, 3],
				meta: { total: 3, page: 1, limit: 10, totalPages: 1 },
			}),
		).toBe(false);
	});

	it("accepts meta with numeric total (schema does not enforce non-negative)", () => {
		expect(
			Value.Check(schema, {
				status: "ok",
				data: ["a"],
				meta: { total: -1, page: 1, limit: 10, totalPages: 0 },
			}),
		).toBe(true);
	});

	it("rejects meta with missing totalPages", () => {
		expect(
			Value.Check(schema, {
				status: "ok",
				data: ["a"],
				meta: { total: 1, page: 1, limit: 10 },
			}),
		).toBe(false);
	});

	it("wraps an object item schema correctly", () => {
		const itemSchema = t.Object({
			id: t.String(),
			name: t.String(),
		});
		const objSchema = paginatedListResponse(itemSchema);

		expect(
			Value.Check(objSchema, {
				status: "ok",
				data: [{ id: "1", name: "Alice" }],
				meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
			}),
		).toBe(true);
	});

	it("rejects object items missing required fields", () => {
		const itemSchema = t.Object({
			id: t.String(),
			name: t.String(),
		});
		const objSchema = paginatedListResponse(itemSchema);

		expect(
			Value.Check(objSchema, {
				status: "ok",
				data: [{ id: "1" }],
				meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
			}),
		).toBe(false);
	});
});

describe("storyCategories constant", () => {
	it("contains exactly 9 categories", () => {
		expect(storyCategories).toHaveLength(9);
	});

	it("has all expected values in order", () => {
		expect(storyCategories).toEqual([
			"career_advancement",
			"entrepreneurship",
			"industry_recognition",
			"social_impact",
			"academic_achievement",
			"innovation",
			"leadership",
			"community_service",
			"other",
		]);
	});

	it("storyCategoryEnum maps each category to itself", () => {
		for (const category of storyCategories) {
			expect(storyCategoryEnum[category]).toBe(category);
		}
	});
});
