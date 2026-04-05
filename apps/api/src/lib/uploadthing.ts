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

function extractUploadThingFileKey(imageUrl: string): string | null {
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
} satisfies FileRouter;

export type MediaRouter = typeof mediaRouter;
