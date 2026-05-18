import { generateReactHelpers } from "@uploadthing/react";

interface MediaRouter {
	storyImage: {
		input: undefined;
		output: { mediaUrl: string; uploadedBy: string };
	};
	eventCoverImage: {
		input: undefined;
		output: { mediaUrl: string };
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

export async function uploadStoryImages(files: File[]) {
	if (files.length === 0) return [];

	const results = await uploadFiles("storyImage", { files });
	return results;
}

export async function uploadEventCoverImage(file: File) {
	const results = await uploadFiles("eventCoverImage", { files: [file] });
	return results?.[0]?.serverData?.mediaUrl;
}
