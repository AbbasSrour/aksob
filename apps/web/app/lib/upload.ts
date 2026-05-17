import { generateReactHelpers } from "@uploadthing/react";

// Minimal type matching the API's mediaRouter for UploadThing helpers
interface MediaRouter {
	storyImage: {
		input: undefined;
		output: { mediaUrl: string; uploadedBy: string };
	};
	media: {
		input: undefined;
		output: { mediaUrl: string; uploadedBy: string };
	};
}

const { useUploadThing, uploadFiles } = generateReactHelpers<MediaRouter>({
	url: "/api/media",
});

export const useMediaUpload = useUploadThing;

/**
 * Upload files to UploadThing via the API's /api/media endpoint.
 * @param endpoint - "storyImage" (8MB) or "media" (4MB)
 * @param options - { files: File[] }
 * @returns Array of upload results with serverData.mediaUrl
 */
export async function uploadStoryImages(files: File[]) {
	if (files.length === 0) return [];

	const results = await uploadFiles("storyImage", { files });
	return results;
}
