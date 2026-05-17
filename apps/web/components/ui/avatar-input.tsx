import { Camera, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMediaUpload } from "~/app/lib/upload";

function getInitials(name: string) {
	return name
		.split(" ")
		.map((n) => n[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();
}

interface AvatarInputProps {
	/** Current avatar URL (from session/user data) */
	currentUrl?: string | null;
	/** User display name (for initials fallback) */
	name: string;
	/** Called with the new URL after successful upload */
	onSuccess?: (url: string) => void;
	/** Called with error message on failure */
	onError?: (message: string) => void;
}

export function AvatarInput({
	currentUrl,
	name,
	onSuccess,
	onError,
}: AvatarInputProps) {
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [uploading, setUploading] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const { startUpload } = useMediaUpload("media");

	// Clean up object URLs on unmount
	useEffect(() => {
		return () => {
			if (previewUrl?.startsWith("blob:")) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	}, [previewUrl]);

	const displaySrc = useMemo(() => {
		return previewUrl ?? currentUrl ?? undefined;
	}, [previewUrl, currentUrl]);

	const handleFileSelect = useCallback(
		async (file: File) => {
			setUploading(true);

			// Show local preview immediately
			const localUrl = URL.createObjectURL(file);
			setPreviewUrl(localUrl);

			try {
				const result = await startUpload([file]);
				const mediaUrl = result?.[0]?.serverData?.mediaUrl;

				if (!mediaUrl) {
					throw new Error("No URL returned from upload");
				}

				setPreviewUrl(null); // Clear blob URL, server URL takes over
				onSuccess?.(mediaUrl);
			} catch (err) {
				setPreviewUrl(currentUrl ?? null); // Revert on error
				const message =
					err instanceof Error ? err.message : "Failed to upload image";
				onError?.(message);
			} finally {
				setUploading(false);
			}
		},
		[startUpload, currentUrl, onSuccess, onError],
	);

	const handleClick = () => {
		inputRef.current?.click();
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			handleFileSelect(file);
		}
		// Reset input so same file can be selected again
		e.target.value = "";
	};

	return (
		<div className="relative inline-block group">
			{/* Rotating compass ring (matches profile hero style) */}
			<div className="absolute -inset-1.5 rounded-full border border-dashed border-[var(--aksob-primary)]/20 animate-compass-spin-slow pointer-events-none" />

			{/* Avatar */}
			<button
				type="button"
				onClick={handleClick}
				disabled={uploading}
				className="relative w-20 h-20 rounded-full overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--aksob-primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed bg-(--gray-100) border-2 border-(--gray-200) text-(--aksob-darkest) font-semibold select-none text-2xl flex items-center justify-center"
			>
				{displaySrc ? (
					<img
						src={displaySrc}
						alt={name}
						className="absolute inset-0 w-full h-full object-cover"
					/>
				) : (
					<span>{getInitials(name)}</span>
				)}

				{/* Hover overlay */}
				<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
					{uploading ? (
						<Loader2 className="w-6 h-6 text-white animate-spin" />
					) : (
						<Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
					)}
				</div>
			</button>

			{/* Hidden file input */}
			<input
				ref={inputRef}
				type="file"
				accept="image/*"
				onChange={handleChange}
				className="hidden"
				tabIndex={-1}
			/>
		</div>
	);
}
