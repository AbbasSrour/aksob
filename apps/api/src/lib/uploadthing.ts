import { eq } from "drizzle-orm";
import {
	createUploadthing,
	type FileRouter,
	UploadThingError,
	UTApi,
} from "uploadthing/server";
import { env } from "@/config/env";
import { db, schema } from "@/db";
import { auth } from "@/lib/auth";
import { logger } from "@/utils/logger";

const f = createUploadthing();

let uploadThingApi: UTApi | null | undefined;

function getUploadThingApi(): UTApi | null {
	if (uploadThingApi !== undefined) {
		return uploadThingApi;
	}

	if (!env.UPLOADTHING_TOKEN) {
		uploadThingApi = null;
		return uploadThingApi;
	}

	uploadThingApi = new UTApi({ token: env.UPLOADTHING_TOKEN });
	return uploadThingApi;
}

export function extractUploadThingFileKey(imageUrl: string): string | null {
	try {
		const trimmed = imageUrl.trim();
		if (!trimmed) {
			return null;
		}

		const url = new URL(trimmed);
		const path = url.pathname.replace(/\/+$/, "");
		const fPath = /^\/f\/(.+)$/.exec(path);
		if (fPath?.[1]) {
			return decodeURIComponent(fPath[1]);
		}

		const aPath = /^\/a\/[^/]+\/(.+)$/.exec(path);
		if (aPath?.[1]) {
			return decodeURIComponent(aPath[1]);
		}

		return null;
	} catch {
		return null;
	}
}

/**
 * Extract all image src URLs from an HTML string.
 */
export function extractImageUrlsFromHtml(html: string): string[] {
	const matches = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)];
	return matches.map((m) => m[1]).filter(Boolean);
}

/**
 * Delete UploadThing files by their URLs.
 * Silently skips non-UploadThing URLs and failed deletions.
 */
export async function deleteUploadThingFiles(urls: string[]): Promise<void> {
	const utApi = getUploadThingApi();
	if (!utApi || urls.length === 0) return;

	const keys = urls
		.map((url) => extractUploadThingFileKey(url))
		.filter((key): key is string => key !== null);

	if (keys.length === 0) return;

	try {
		await utApi.deleteFiles(keys);
	} catch (error) {
		logger.warn("Failed to delete UploadThing files", { keys, error });
	}
}

export const mediaRouter = {
	media: f({
		image: {
			maxFileSize: "4MB",
			maxFileCount: 1,
		},
	})
		.middleware(async ({ req }) => {
			const session = await auth.api.getSession({
				headers: req.headers,
			});
			const user = session?.user;

			if (!user) {
				throw new UploadThingError("Unauthorized");
			}

			return {
				userId: user.id,
			};
		})
		.onUploadComplete(async ({ file, metadata }) => {
			const existingUser = await db.query.user.findFirst({
				columns: { image: true },
				where: eq(schema.user.id, metadata.userId),
			});

			const previousKey =
				existingUser?.image != null
					? extractUploadThingFileKey(existingUser.image)
					: null;

			if (previousKey && previousKey !== file.key) {
				const utApi = getUploadThingApi();
				if (utApi) {
					try {
						await utApi.deleteFiles(previousKey);
					} catch (error) {
						logger.warn("Failed to delete previous UploadThing file", {
							userId: metadata.userId,
							previousKey,
							error,
						});
					}
				}
			}

			return {
				mediaUrl: file.ufsUrl,
				uploadedBy: metadata.userId,
			};
		}),
	storyImage: f({
		image: {
			maxFileSize: "8MB",
			maxFileCount: 1,
		},
	})
		.middleware(async ({ req }) => {
			const session = await auth.api.getSession({
				headers: req.headers,
			});
			const user = session?.user;

			if (!user) {
				throw new UploadThingError("Unauthorized");
			}

			return {
				userId: user.id,
			};
		})
		.onUploadComplete(async ({ file, metadata }) => {
			return {
				mediaUrl: file.ufsUrl,
				uploadedBy: metadata.userId,
			};
		}),
} satisfies FileRouter;

export type MediaRouter = typeof mediaRouter;
