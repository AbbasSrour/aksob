import { Value } from "@sinclair/typebox/value";
import { describe, expect, it } from "vitest";
import { NEWS_ERRORS } from "@/modules/news/constant/news-errors.constant";
import { createNewsCategoryBody } from "@/modules/news/schema/news-category.schema";
import { createNewsBody } from "@/modules/news/schema/news-create.schema";
import { listNewsQuery } from "@/modules/news/schema/news-params.schema";
import {
	newsCategoryResponseSchema,
	newsListResponse,
	newsResponseSchema,
} from "@/modules/news/schema/news-response.schema";
import { updateNewsBody } from "@/modules/news/schema/news-update.schema";
import { toNewsDto } from "@/modules/news/utils/news.mapper";

// ---------------------------------------------------------------------------
// Error constants
// ---------------------------------------------------------------------------

describe("NEWS_ERRORS", () => {
	const errors = NEWS_ERRORS;

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

	it("NEWS_NOT_FOUND has correct values", () => {
		expect(errors.NEWS_NOT_FOUND).toEqual({
			code: "NEWS_NOT_FOUND",
			httpStatus: 404,
			message: "News article not found",
		});
	});

	it("NEWS_CATEGORY_NOT_FOUND has correct values", () => {
		expect(errors.NEWS_CATEGORY_NOT_FOUND).toEqual({
			code: "NEWS_CATEGORY_NOT_FOUND",
			httpStatus: 404,
			message: "News category not found",
		});
	});

	it("NEWS_CATEGORY_ALREADY_EXISTS has correct values", () => {
		expect(errors.NEWS_CATEGORY_ALREADY_EXISTS).toEqual({
			code: "NEWS_CATEGORY_ALREADY_EXISTS",
			httpStatus: 409,
			message: "A news category with that name already exists",
		});
	});

	it("each code matches its key name", () => {
		for (const [key, entry] of Object.entries(errors)) {
			expect(entry.code).toBe(key);
		}
	});
});

// ---------------------------------------------------------------------------
// news-params.schema
// ---------------------------------------------------------------------------

describe("listNewsQuery", () => {
	it("accepts empty query", () => {
		expect(Value.Check(listNewsQuery, {})).toBe(true);
	});

	it("accepts search string", () => {
		expect(Value.Check(listNewsQuery, { search: "alumni" })).toBe(true);
	});

	it("accepts valid status values", () => {
		expect(Value.Check(listNewsQuery, { status: "draft" })).toBe(true);
		expect(Value.Check(listNewsQuery, { status: "published" })).toBe(true);
	});

	it("rejects invalid status", () => {
		expect(Value.Check(listNewsQuery, { status: "archived" })).toBe(false);
	});

	it("accepts category as string", () => {
		expect(Value.Check(listNewsQuery, { category: "cat-123" })).toBe(true);
	});

	it("rejects non-string category", () => {
		expect(Value.Check(listNewsQuery, { category: 123 })).toBe(false);
	});

	it("accepts valid page as string", () => {
		expect(Value.Check(listNewsQuery, { page: "3" })).toBe(true);
	});

	it("rejects page zero as number", () => {
		expect(Value.Check(listNewsQuery, { page: 0 })).toBe(false);
	});

	it("rejects negative page as number", () => {
		expect(Value.Check(listNewsQuery, { page: -1 })).toBe(false);
	});

	it("accepts limit at boundary 1", () => {
		expect(Value.Check(listNewsQuery, { limit: "1" })).toBe(true);
	});

	it("accepts limit at boundary 50", () => {
		expect(Value.Check(listNewsQuery, { limit: "50" })).toBe(true);
	});

	it("rejects limit above 50 as number", () => {
		expect(Value.Check(listNewsQuery, { limit: 51 })).toBe(false);
	});

	it("rejects limit below 1 as number", () => {
		expect(Value.Check(listNewsQuery, { limit: 0 })).toBe(false);
	});

	it("all params compose together", () => {
		expect(
			Value.Check(listNewsQuery, {
				search: "rankings",
				status: "published",
				category: "cat-42",
				page: "1",
				limit: "20",
			}),
		).toBe(true);
	});
});

// ---------------------------------------------------------------------------
// newsResponseSchema
// ---------------------------------------------------------------------------

describe("newsResponseSchema", () => {
	const validArticle = {
		status: "ok" as const,
		data: {
			id: "news-1",
			title: "Alumni Network Reaches 4,200 Members",
			excerpt: "A record milestone for the alumni network.",
			content: "<p>Full article content here.</p>",
			coverImage: "https://example.com/cover.jpg",
			thumbnailImage: "https://example.com/thumb.jpg",
			readTime: 5,
			status: "published" as const,
			publishedAt: "2025-06-01T10:00:00.000Z",
			date: "2025-06-01T10:00:00.000Z",
			author: {
				id: "user-1",
				name: "Alice Admin",
				image: "https://example.com/alice.jpg",
			},
			category: {
				id: "cat-1",
				name: "Alumni News",
			},
			createdAt: "2025-06-01T10:00:00.000Z",
			updatedAt: "2025-06-01T10:00:00.000Z",
		},
	};

	it("accepts valid article with all fields", () => {
		expect(Value.Check(newsResponseSchema, validArticle)).toBe(true);
	});

	it("accepts article with null coverImage", () => {
		expect(
			Value.Check(newsResponseSchema, {
				...validArticle,
				data: { ...validArticle.data, coverImage: null },
			}),
		).toBe(true);
	});

	it("accepts article with null thumbnailImage", () => {
		expect(
			Value.Check(newsResponseSchema, {
				...validArticle,
				data: { ...validArticle.data, thumbnailImage: null },
			}),
		).toBe(true);
	});

	it("accepts article with null readTime", () => {
		expect(
			Value.Check(newsResponseSchema, {
				...validArticle,
				data: { ...validArticle.data, readTime: null },
			}),
		).toBe(true);
	});

	it("accepts article with null category", () => {
		expect(
			Value.Check(newsResponseSchema, {
				...validArticle,
				data: { ...validArticle.data, category: null },
			}),
		).toBe(true);
	});

	it("accepts article with status draft", () => {
		expect(
			Value.Check(newsResponseSchema, {
				...validArticle,
				data: { ...validArticle.data, status: "draft" as const },
			}),
		).toBe(true);
	});

	it("rejects invalid status", () => {
		expect(
			Value.Check(newsResponseSchema, {
				...validArticle,
				data: { ...validArticle.data, status: "archived" },
			}),
		).toBe(false);
	});

	it("rejects missing required fields", () => {
		expect(
			Value.Check(newsResponseSchema, {
				status: "ok",
				data: { id: "news-1", title: "Missing fields" },
			}),
		).toBe(false);
	});

	it("rejects partial author object", () => {
		expect(
			Value.Check(newsResponseSchema, {
				...validArticle,
				data: { ...validArticle.data, author: { id: "user-1" } },
			}),
		).toBe(false);
	});

	it("accepts author with null image", () => {
		expect(
			Value.Check(newsResponseSchema, {
				...validArticle,
				data: {
					...validArticle.data,
					author: { ...validArticle.data.author, image: null },
				},
			}),
		).toBe(true);
	});
});

// ---------------------------------------------------------------------------
// newsCategoryResponseSchema
// ---------------------------------------------------------------------------

describe("newsCategoryResponseSchema", () => {
	const validCategory = {
		status: "ok" as const,
		data: {
			id: "cat-1",
			name: "Alumni News",
			createdAt: "2025-06-01T10:00:00.000Z",
			updatedAt: "2025-06-01T10:00:00.000Z",
		},
	};

	it("accepts valid category", () => {
		expect(Value.Check(newsCategoryResponseSchema, validCategory)).toBe(true);
	});

	it("rejects missing id", () => {
		expect(
			Value.Check(newsCategoryResponseSchema, {
				...validCategory,
				data: { ...validCategory.data, id: undefined },
			}),
		).toBe(false);
	});

	it("rejects missing name", () => {
		expect(
			Value.Check(newsCategoryResponseSchema, {
				...validCategory,
				data: { ...validCategory.data, name: undefined },
			}),
		).toBe(false);
	});
});

// ---------------------------------------------------------------------------
// newsListResponse
// ---------------------------------------------------------------------------

describe("newsListResponse", () => {
	const validArticle = {
		id: "news-1",
		title: "Alumni Network Reaches 4,200 Members",
		excerpt: "A record milestone.",
		content: "<p>Full article.</p>",
		coverImage: null,
		thumbnailImage: null,
		readTime: null,
		status: "published",
		publishedAt: null,
		date: null,
		author: {
			id: "user-1",
			name: "Alice Admin",
			image: null,
		},
		category: null,
		createdAt: "2025-06-01T10:00:00.000Z",
		updatedAt: "2025-06-01T10:00:00.000Z",
	};

	it("accepts valid list response", () => {
		expect(
			Value.Check(newsListResponse, {
				status: "ok",
				data: [validArticle],
				meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
			}),
		).toBe(true);
	});

	it("accepts empty list", () => {
		expect(
			Value.Check(newsListResponse, {
				status: "ok",
				data: [],
				meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
			}),
		).toBe(true);
	});
});

// ---------------------------------------------------------------------------
// toNewsDto mapper
// ---------------------------------------------------------------------------

describe("toNewsDto", () => {
	const baseArticle = {
		id: "news-1",
		title: "Alumni Network Reaches 4,200 Members",
		excerpt: "A record milestone.",
		content: "<p>Full article content here.</p>",
		coverImage: "https://example.com/cover.jpg",
		readTime: 5,
		status: "published" as const,
		publishedAt: null as Date | null,
		date: null as Date | null,
		authorId: "user-1",
		categoryId: "cat-1",
	};

	const author = {
		id: "user-1",
		name: "Alice Admin",
		email: "alice@example.com",
		emailVerified: false,
		userType: "faculty" as const,
		major: "BS in Business",
		company: null,
		title: null,
		image: "https://example.com/alice.jpg",
		role: "admin" as const,
		banned: false,
		banReason: null,
		banExpires: null,
		phoneNumber: null,
		phoneNumberVerified: null,
	};

	const category = {
		id: "cat-1",
		name: "Alumni News",
	};

	const created = new Date("2025-06-01T10:00:00.000Z");
	const updated = new Date("2025-06-02T12:00:00.000Z");

	it("maps an article with author and category", () => {
		const dto = toNewsDto({
			...baseArticle,
			createdAt: created,
			updatedAt: updated,
			author,
			category: { ...category, createdAt: created, updatedAt: updated },
		});

		expect(dto.id).toBe("news-1");
		expect(dto.title).toBe("Alumni Network Reaches 4,200 Members");
		expect(dto.excerpt).toBe("A record milestone.");
		expect(dto.content).toBe("<p>Full article content here.</p>");
		expect(dto.coverImage).toBe("https://example.com/cover.jpg");
		expect(dto.readTime).toBe(5);
		expect(dto.status).toBe("published");
		expect(dto.author).toEqual({
			id: "user-1",
			name: "Alice Admin",
			image: "https://example.com/alice.jpg",
		});
		expect(dto.category).toEqual({
			id: "cat-1",
			name: "Alumni News",
		});
		expect(dto.createdAt).toBe("2025-06-01T10:00:00.000Z");
		expect(dto.updatedAt).toBe("2025-06-02T12:00:00.000Z");
	});

	it("maps null coverImage and readTime correctly", () => {
		const dto = toNewsDto({
			...baseArticle,
			coverImage: null,
			readTime: null,
			createdAt: created,
			updatedAt: updated,
			author,
			category: null,
		});

		expect(dto.coverImage).toBeNull();
		expect(dto.readTime).toBeNull();
		expect(dto.category).toBeNull();
	});

	it("throws when author is null", () => {
		expect(() =>
			toNewsDto({
				...baseArticle,
				createdAt: created,
				updatedAt: updated,
				author: null,
				category: null,
			}),
		).toThrow("is missing an author");
	});

	it("includes all required fields with correct types in output", () => {
		const dto = toNewsDto({
			...baseArticle,
			createdAt: created,
			updatedAt: updated,
			author,
			category: null,
		});

		const keys = Object.keys(dto).sort();
		expect(keys).toEqual([
			"author",
			"category",
			"content",
			"coverImage",
			"createdAt",
			"date",
			"excerpt",
			"id",
			"publishedAt",
			"readTime",
			"status",
			"thumbnailImage",
			"title",
			"updatedAt",
		]);

		expect(typeof dto.id).toBe("string");
		expect(typeof dto.createdAt).toBe("string");
		expect(dto.author).not.toHaveProperty("email");
	});
});

// ---------------------------------------------------------------------------
// createNewsBody
// ---------------------------------------------------------------------------

describe("createNewsBody", () => {
	it("accepts valid body with all required fields", () => {
		expect(
			Value.Check(createNewsBody, {
				title: "Alumni Network Hits 5,000 Members",
				excerpt: "A new milestone.",
				content: "<p>Full article here.</p>",
			}),
		).toBe(true);
	});

	it("accepts body with all optional fields", () => {
		expect(
			Value.Check(createNewsBody, {
				title: "Title",
				excerpt: "Excerpt",
				content: "<p>Content</p>",
				coverImage: "https://example.com/img.jpg",
				readTime: 5,
				categoryId: "cat-1",
			}),
		).toBe(true);
	});

	it("rejects body missing title", () => {
		expect(
			Value.Check(createNewsBody, {
				excerpt: "E",
				content: "C",
			}),
		).toBe(false);
	});

	it("rejects body missing excerpt", () => {
		expect(
			Value.Check(createNewsBody, {
				title: "T",
				content: "C",
			}),
		).toBe(false);
	});

	it("rejects body missing content", () => {
		expect(
			Value.Check(createNewsBody, {
				title: "T",
				excerpt: "E",
			}),
		).toBe(false);
	});

	it("rejects empty title", () => {
		expect(
			Value.Check(createNewsBody, {
				title: "",
				excerpt: "E",
				content: "C",
			}),
		).toBe(false);
	});

	it("rejects empty excerpt", () => {
		expect(
			Value.Check(createNewsBody, {
				title: "T",
				excerpt: "",
				content: "C",
			}),
		).toBe(false);
	});

	it("rejects empty content", () => {
		expect(
			Value.Check(createNewsBody, {
				title: "T",
				excerpt: "E",
				content: "",
			}),
		).toBe(false);
	});
});

// ---------------------------------------------------------------------------
// updateNewsBody
// ---------------------------------------------------------------------------

describe("updateNewsBody", () => {
	it("accepts valid body with all required fields", () => {
		expect(
			Value.Check(updateNewsBody, {
				title: "Updated Title",
				excerpt: "Updated excerpt",
				content: "<p>Updated content</p>",
			}),
		).toBe(true);
	});

	it("accepts body with all optional fields", () => {
		expect(
			Value.Check(updateNewsBody, {
				title: "Title",
				excerpt: "Excerpt",
				content: "<p>Content</p>",
				coverImage: "https://example.com/new.jpg",
				readTime: 7,
				categoryId: "cat-2",
			}),
		).toBe(true);
	});

	it("rejects body missing title", () => {
		expect(
			Value.Check(updateNewsBody, {
				excerpt: "E",
				content: "C",
			}),
		).toBe(false);
	});

	it("rejects body missing excerpt", () => {
		expect(
			Value.Check(updateNewsBody, {
				title: "T",
				content: "C",
			}),
		).toBe(false);
	});

	it("rejects body missing content", () => {
		expect(
			Value.Check(updateNewsBody, {
				title: "T",
				excerpt: "E",
			}),
		).toBe(false);
	});

	it("rejects empty title", () => {
		expect(
			Value.Check(updateNewsBody, {
				title: "",
				excerpt: "E",
				content: "C",
			}),
		).toBe(false);
	});

	it("rejects empty excerpt", () => {
		expect(
			Value.Check(updateNewsBody, {
				title: "T",
				excerpt: "",
				content: "C",
			}),
		).toBe(false);
	});

	it("rejects empty content", () => {
		expect(
			Value.Check(updateNewsBody, {
				title: "T",
				excerpt: "E",
				content: "",
			}),
		).toBe(false);
	});
});

// ---------------------------------------------------------------------------
// createNewsCategoryBody
// ---------------------------------------------------------------------------

describe("createNewsCategoryBody", () => {
	it("accepts valid body", () => {
		expect(
			Value.Check(createNewsCategoryBody, {
				name: "Alumni News",
			}),
		).toBe(true);
	});

	it("rejects empty name", () => {
		expect(
			Value.Check(createNewsCategoryBody, {
				name: "",
			}),
		).toBe(false);
	});

	it("rejects missing name", () => {
		expect(Value.Check(createNewsCategoryBody, {})).toBe(false);
	});
});
