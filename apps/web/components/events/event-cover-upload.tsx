import { ImagePlus, Loader2, X } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { uploadEventCoverImage } from "~/app/lib/upload";

interface EventCoverUploadProps {
	value: string;
	onChange: (url: string) => void;
}

export function EventCoverUpload({ value, onChange }: EventCoverUploadProps) {
	const [uploading, setUploading] = useState(false);

	const handleFileSelect = useCallback(
		async (file: File) => {
			setUploading(true);
			try {
				const url = await uploadEventCoverImage(file);
				if (url) {
					onChange(url);
				} else {
					toast.error("Failed to upload cover image");
				}
			} catch (error) {
				toast.error(error instanceof Error ? error.message : "Upload failed");
			} finally {
				setUploading(false);
			}
		},
		[onChange],
	);

	const handleRemove = useCallback(() => {
		onChange("");
	}, [onChange]);

	if (value) {
		return (
			<div className="group relative overflow-hidden rounded-xl">
				<img
					src={value}
					alt="Event cover"
					className="aspect-[2/1] w-full object-cover"
				/>
				<div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
					<button
						type="button"
						onClick={handleRemove}
						className="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-[var(--gray-700)] shadow-sm hover:bg-white"
					>
						<X size={14} />
						Remove
					</button>
				</div>
			</div>
		);
	}

	return (
		<label className="group flex aspect-[2/1] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--gray-200)] bg-[var(--gray-100)]/50 transition-colors hover:border-[var(--aksob-primary)]/30 hover:bg-[var(--aksob-primary)]/[0.03]">
			<input
				type="file"
				accept="image/*"
				className="sr-only"
				disabled={uploading}
				onChange={(e) => {
					const file = e.target.files?.[0];
					if (file) handleFileSelect(file);
					e.target.value = "";
				}}
			/>
			{uploading ? (
				<Loader2
					size={28}
					className="text-[var(--aksob-primary)] animate-spin"
					strokeWidth={1.5}
				/>
			) : (
				<ImagePlus
					size={28}
					className="text-[var(--gray-400)] transition-colors group-hover:text-[var(--aksob-primary)]/50"
					strokeWidth={1.5}
				/>
			)}
			<span className="text-xs text-[var(--gray-400)] transition-colors group-hover:text-[var(--gray-500)]">
				{uploading ? "Uploading..." : "Add cover image"}
			</span>
		</label>
	);
}
