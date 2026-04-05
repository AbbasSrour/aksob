import type { MediaRouter } from "@aksob/api";
import { generateReactHelpers } from "@uploadthing/react";

const { useUploadThing, uploadFiles } = generateReactHelpers<MediaRouter>({
	url: "/api/media",
});

export const useMediaUpload = useUploadThing;
export const uploadMediaFiles = uploadFiles;
