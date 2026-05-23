import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ArrowLeft,
	Calendar,
	Check,
	ImageIcon,
	ImagePlus,
	Tag,
	Trash2,
	X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import {
	STORY_CATEGORY_LABELS,
	type StoryCategory,
	deleteStory,
	getStory,
	updateStory,
} from "~/app/lib/stories";
import { createStory } from "~/app/lib/users";
import { uploadStoryImages } from "~/app/lib/upload";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	TipTapEditor,
	type TipTapEditorRef,
} from "~/components/stories/tiptap-editor";

// ─── Category Visuals ────────────────────────────────────────────────

const categoryVisuals: Record<
	string,
	{ dot: string; bg: string; border: string }
> = {
	career_advancement: {
		dot: "bg-blue-500",
		bg: "bg-blue-50",
		border: "border-blue-200",
	},
	entrepreneurship: {
		dot: "bg-amber-500",
		bg: "bg-amber-50",
		border: "border-amber-200",
	},
	industry_recognition: {
		dot: "bg-violet-500",
		bg: "bg-violet-50",
		border: "border-violet-200",
	},
	social_impact: {
		dot: "bg-emerald-500",
		bg: "bg-emerald-50",
		border: "border-emerald-200",
	},
	academic_achievement: {
		dot: "bg-indigo-500",
		bg: "bg-indigo-50",
		border: "border-indigo-200",
	},
	innovation: {
		dot: "bg-cyan-500",
		bg: "bg-cyan-50",
		border: "border-cyan-200",
	},
	leadership: {
		dot: "bg-rose-500",
		bg: "bg-rose-50",
		border: "border-rose-200",
	},
	community_service: {
		dot: "bg-teal-500",
		bg: "bg-teal-50",
		border: "border-teal-200",
	},
	other: {
		dot: "bg-gray-400",
		bg: "bg-gray-50",
		border: "border-gray-200",
	},
};

const CATEGORIES: StoryCategory[] = Object.keys(
	STORY_CATEGORY_LABELS,
) as StoryCategory[];

// ─── Helpers ─────────────────────────────────────────────────────────

function countWords(html: string): number {
	const text = html
		.replace(/<[^>]*>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
	if (!text) return 0;
	return text.split(" ").length;
}

function readingTime(words: number): string {
	const minutes = Math.ceil(words / 200);
	return `${minutes} min read`;
}

// ─── Component ───────────────────────────────────────────────────────

export default function StoryEditorPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const isEdit = !!id;

	// Fetch existing story for edit mode
	const { data: existingStory, isLoading: isLoadingStory } = useQuery({
		queryKey: ["story", id],
		queryFn: () => getStory(id!).then((r) => r.data),
		enabled: isEdit,
	});

	// Form state
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [content, setContent] = useState("");
	const [category, setCategory] = useState<StoryCategory>(CATEGORIES[0]);
	const [storyDate, setStoryDate] = useState(
		new Date().toISOString().split("T")[0],
	);
	const [coverImage, setCoverImage] = useState("");
	const [thumbnailImage, setThumbnailImage] = useState("");

	// Initialize from existing story
	useEffect(() => {
		if (existingStory) {
			setTitle(existingStory.title);
			setDescription(existingStory.description);
			setContent(existingStory.content);
			setCategory(existingStory.category);
			setStoryDate(existingStory.storyDate.split("T")[0]);
			setCoverImage(existingStory.coverImage ?? "");
			setThumbnailImage(existingStory.thumbnailImage ?? "");
		}
	}, [existingStory]);

	// Blob URL → File mapping for images not yet uploaded
	const pendingImagesRef = useRef<Map<string, File>>(new Map());
	const pendingCoverRef = useRef<File | null>(null);
	const pendingThumbnailRef = useRef<File | null>(null);
	const editorRef = useRef<TipTapEditorRef>(null);

	// Revoke all blob URLs on unmount
	useEffect(() => {
		const pendingImages = pendingImagesRef.current;
		return () => {
			for (const blobUrl of pendingImages.keys()) {
				URL.revokeObjectURL(blobUrl);
			}
		};
	}, []);

	// Cover image handler
	const handleCoverSelect = useCallback(
		(file: File) => {
			const url = URL.createObjectURL(file);
			const prev = coverImage;
			if (prev?.startsWith("blob:")) {
				URL.revokeObjectURL(prev);
			}
			pendingCoverRef.current = file;
			setCoverImage(url);
		},
		[coverImage],
	);

	// Thumbnail handler
	const handleThumbnailSelect = useCallback(
		(file: File) => {
			const url = URL.createObjectURL(file);
			const prev = thumbnailImage;
			if (prev?.startsWith("blob:")) {
				URL.revokeObjectURL(prev);
			}
			pendingThumbnailRef.current = file;
			setThumbnailImage(url);
		},
		[thumbnailImage],
	);

	// Editor image handler
	const handleEditorImageAdd = useCallback((file: File): string => {
		const url = URL.createObjectURL(file);
		pendingImagesRef.current.set(url, file);
		return url;
	}, []);

	// Mutations
	const createMutation = useMutation({
		mutationFn: createStory,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["my-stories"] });
			queryClient.invalidateQueries({ queryKey: ["stories"] });
			toast.success("Story submitted for review");
			navigate("/profile?tab=stories");
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({
			id: storyId,
			...params
		}: { id: string } & Parameters<typeof updateStory>[1]) =>
			updateStory(storyId, params),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["my-stories"] });
			queryClient.invalidateQueries({ queryKey: ["stories"] });
			queryClient.invalidateQueries({ queryKey: ["story", id] });
			toast.success("Story updated");
			navigate("/profile?tab=stories");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteStory,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["my-stories"] });
			queryClient.invalidateQueries({ queryKey: ["stories"] });
			toast.success("Story deleted");
			navigate("/profile?tab=stories");
		},
	});

	const isSubmitting = createMutation.isPending || updateMutation.isPending;
	const wordCount = countWords(content);

	// Submit handler
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isSubmitting) return;
		if (!title.trim() || !description.trim() || !content.trim()) {
			toast.error("Please fill in all required fields");
			return;
		}

		const loadingToast = toast.loading(
			isEdit ? "Saving changes..." : "Submitting your story...",
		);

		try {
			// Upload pending files
			const uploadedBlobUrls = new Map<string, string>();
			let coverImageUrl = coverImage;
			let thumbnailImageUrl = thumbnailImage;

			// Upload editor images
			for (const [blobUrl, file] of pendingImagesRef.current.entries()) {
				const results = await uploadStoryImages([file]);
				const url = results?.[0]?.serverData?.mediaUrl;
				if (url) {
					uploadedBlobUrls.set(blobUrl, url);
				} else {
					toast.dismiss(loadingToast);
					toast.error("Failed to upload an image");
					return;
				}
			}

			// Upload cover
			if (pendingCoverRef.current) {
				const results = await uploadStoryImages([pendingCoverRef.current]);
				coverImageUrl = results?.[0]?.serverData?.mediaUrl ?? coverImage;
			}

			// Upload thumbnail
			if (pendingThumbnailRef.current) {
				const results = await uploadStoryImages([pendingThumbnailRef.current]);
				thumbnailImageUrl =
					results?.[0]?.serverData?.mediaUrl ?? thumbnailImage;
			}

			// Replace blob URLs with real URLs in content
			let finalContent = content;
			for (const [blobUrl, realUrl] of uploadedBlobUrls.entries()) {
				finalContent = finalContent.replaceAll(blobUrl, realUrl);
				URL.revokeObjectURL(blobUrl);
				pendingImagesRef.current.delete(blobUrl);
			}

			const payload = {
				title: title.trim(),
				description: description.trim(),
				content: finalContent,
				category,
				storyDate,
				coverImage: coverImageUrl || undefined,
				thumbnailImage: thumbnailImageUrl || undefined,
			};

			if (isEdit && id) {
				updateMutation.mutate(
					{ id, ...payload },
					{
						onSettled: () => toast.dismiss(loadingToast),
					},
				);
			} else {
				createMutation.mutate(payload, {
					onSettled: () => toast.dismiss(loadingToast),
				});
			}
		} catch (error) {
			toast.dismiss(loadingToast);
			const message = error instanceof Error ? error.message : "Unknown error";
			toast.error(`Failed to save story: ${message}`);
		}
	};

	const handleDelete = () => {
		if (!id) return;
		if (!confirm("Are you sure you want to delete this story?")) return;
		deleteMutation.mutate(id);
	};

	const inputClass =
		"w-full h-10 rounded-lg border border-[var(--gray-200)] bg-white px-3 text-sm text-[var(--gray-700)] focus:ring-2 focus:ring-[var(--aksob-primary)]/20 focus:border-[var(--aksob-primary)] transition";

	if (isEdit && isLoadingStory) {
		return (
			<main className="min-h-screen bg-[var(--off-white)] pt-20">
				<div className="max-w-6xl mx-auto px-6 py-16 flex items-center justify-center">
					<p className="text-sm text-[var(--gray-500)]">Loading story...</p>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-[var(--off-white)] pt-20">
			<div className="max-w-6xl mx-auto px-6 py-10">
				{/* Top bar */}
				<div className="flex items-center justify-between mb-8">
					<Link
						to="/profile?tab=stories"
						className="flex items-center gap-2 text-sm text-[var(--gray-500)] hover:text-[var(--aksob-primary)] transition-colors"
					>
						<ArrowLeft size={16} />
						Back to Stories
					</Link>
					<div className="flex items-center gap-2">
						{isEdit && existingStory && (
							<StatusBadge status={existingStory.status} />
						)}
						{isEdit && (
							<Button
								type="button"
								variant="danger"
								size="sm"
								onClick={handleDelete}
								isLoading={deleteMutation.isPending}
								leftIcon={<Trash2 size={14} />}
							>
								Delete
							</Button>
						)}
					</div>
				</div>

				{/* Page title */}
				<div className="mb-8">
					<h1
						className="text-3xl font-bold text-[var(--aksob-darkest)] tracking-tight"
						style={{ fontFamily: "var(--font-display)" }}
					>
						{isEdit ? "Edit Story" : "Create Story"}
					</h1>
					<p className="text-sm text-[var(--gray-500)] mt-1">
						{isEdit
							? "Update your story and resubmit for review."
							: "Share your journey and inspire the community."}
					</p>
				</div>

				<form
					onSubmit={handleSubmit}
					className={isSubmitting ? "pointer-events-none opacity-60" : ""}
				>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* ─── Main Column ─── */}
						<div className="lg:col-span-2 space-y-6">
							{/* Cover Image */}
							<div>
								{coverImage ? (
									<div className="group relative overflow-hidden rounded-xl border border-[var(--gray-200)]">
										<img
											src={coverImage}
											alt="Cover"
											className="aspect-[2/1] w-full object-cover"
										/>
										<div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
											<button
												type="button"
												onClick={() => {
													if (coverImage.startsWith("blob:")) {
														URL.revokeObjectURL(coverImage);
														pendingCoverRef.current = null;
													}
													setCoverImage("");
												}}
												className="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-[var(--gray-700)] shadow-sm hover:bg-white"
											>
												<X size={14} />
												Remove
											</button>
										</div>
									</div>
								) : (
									<label className="group flex aspect-[2/1] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--gray-200)] bg-white transition-colors hover:border-[var(--aksob-primary)]/30 hover:bg-[var(--aksob-primary)]/[0.02]">
										<input
											type="file"
											accept="image/*"
											className="sr-only"
											onChange={(e) => {
												const file = e.target.files?.[0];
												if (file) handleCoverSelect(file);
												e.target.value = "";
											}}
										/>
										<ImagePlus
											size={32}
											className="text-[var(--gray-300)] transition-colors group-hover:text-[var(--aksob-primary)]/50"
											strokeWidth={1.5}
										/>
										<span className="text-sm text-[var(--gray-400)] transition-colors group-hover:text-[var(--gray-500)]">
											Add cover image
										</span>
									</label>
								)}
							</div>

							{/* Title */}
							<div>
								<input
									type="text"
									placeholder="Story title"
									className="w-full border-0 bg-transparent text-3xl font-bold leading-tight tracking-tight text-[var(--aksob-darkest)] placeholder:text-[var(--gray-300)] focus:outline-none focus:ring-0"
									style={{ fontFamily: "var(--font-display)" }}
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									required
								/>
							</div>

							{/* Description */}
							<div>
								<input
									type="text"
									placeholder="Short description"
									className="w-full border-0 bg-transparent text-lg font-normal leading-relaxed text-[var(--gray-500)] placeholder:text-[var(--gray-300)] focus:outline-none focus:ring-0"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									required
								/>
							</div>

							{/* Editor */}
							<div className="rounded-xl border border-[var(--gray-200)] bg-white p-5">
								<TipTapEditor
									ref={editorRef}
									placeholder="Write your story..."
									value={content}
									onChange={setContent}
									onImageAdd={handleEditorImageAdd}
								/>
							</div>

							{/* Word count */}
							<div className="flex items-center gap-3 text-[var(--gray-400)]">
								<span className="text-xs font-medium tabular-nums">
									{wordCount.toLocaleString()} words
								</span>
								<span>·</span>
								<span className="text-xs font-medium">
									{readingTime(wordCount)}
								</span>
							</div>
						</div>

						{/* ─── Sidebar ─── */}
						<div className="space-y-6">
							{/* Category */}
							<div className="rounded-xl border border-[var(--gray-200)] bg-white p-5">
								<div className="flex items-center gap-2 mb-3">
									<Tag size={14} className="text-[var(--gray-400)]" />
									<span className="text-sm font-semibold text-[var(--gray-700)]">
										Category
									</span>
								</div>
								<div className="space-y-1.5">
									{CATEGORIES.map((cat) => {
										const visual = categoryVisuals[cat];
										const isSelected = category === cat;
										return (
											<button
												key={cat}
												type="button"
												onClick={() => setCategory(cat)}
												className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-xs font-medium transition-all duration-200 ${
													isSelected
														? "border-[var(--aksob-primary)] bg-[var(--aksob-primary)] text-white shadow-sm"
														: `border-[var(--gray-200)] bg-white text-[var(--gray-600)] hover:border-[var(--aksob-primary)]/30 hover:bg-[var(--aksob-primary)]/[0.04]`
												}`}
											>
												<span
													className={`h-2 w-2 flex-shrink-0 rounded-full transition-colors ${
														isSelected
															? "bg-white/80"
															: (visual?.dot ?? "bg-gray-400")
													}`}
												/>
												<span className="truncate">
													{STORY_CATEGORY_LABELS[cat]}
												</span>
												{isSelected && (
													<Check
														size={13}
														className="ml-auto flex-shrink-0 opacity-80"
													/>
												)}
											</button>
										);
									})}
								</div>
							</div>

							{/* Date */}
							<div className="rounded-xl border border-[var(--gray-200)] bg-white p-5">
								<div className="flex items-center gap-2 mb-3">
									<Calendar size={14} className="text-[var(--gray-400)]" />
									<span className="text-sm font-semibold text-[var(--gray-700)]">
										Date
									</span>
								</div>
								<input
									type="date"
									className={inputClass}
									value={storyDate}
									onChange={(e) => setStoryDate(e.target.value)}
									required
								/>
							</div>

							{/* Thumbnail */}
							<div className="rounded-xl border border-[var(--gray-200)] bg-white p-5">
								<div className="flex items-center gap-2 mb-3">
									<ImageIcon size={14} className="text-[var(--gray-400)]" />
									<span className="text-sm font-semibold text-[var(--gray-700)]">
										Thumbnail
									</span>
								</div>
								{thumbnailImage ? (
									<div className="group relative overflow-hidden rounded-lg border border-[var(--gray-200)]">
										<img
											src={thumbnailImage}
											alt="Thumbnail"
											className="aspect-[16/9] w-full object-cover"
										/>
										<div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
											<button
												type="button"
												onClick={() => {
													if (thumbnailImage.startsWith("blob:")) {
														URL.revokeObjectURL(thumbnailImage);
														pendingThumbnailRef.current = null;
													}
													setThumbnailImage("");
												}}
												className="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-[var(--gray-700)] shadow-sm hover:bg-white"
											>
												<X size={14} />
												Remove
											</button>
										</div>
									</div>
								) : (
									<label className="group flex aspect-[16/9] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-[var(--gray-200)] bg-[var(--gray-100)]/50 transition-colors hover:border-[var(--aksob-primary)]/30 hover:bg-[var(--aksob-primary)]/[0.03]">
										<input
											type="file"
											accept="image/*"
											className="sr-only"
											onChange={(e) => {
												const file = e.target.files?.[0];
												if (file) handleThumbnailSelect(file);
												e.target.value = "";
											}}
										/>
										<ImagePlus
											size={20}
											className="text-[var(--gray-400)] transition-colors group-hover:text-[var(--aksob-primary)]/50"
											strokeWidth={1.5}
										/>
										<span className="text-[10px] text-[var(--gray-400)] transition-colors group-hover:text-[var(--gray-500)]">
											Add thumbnail
										</span>
									</label>
								)}
							</div>

							{/* Rejected feedback */}
							{isEdit &&
								existingStory?.status === "rejected" &&
								existingStory.reviewNotes && (
									<div className="rounded-xl border border-[var(--error)]/20 bg-red-50 p-5">
										<div className="text-sm font-semibold text-red-700 mb-2">
											Review Feedback
										</div>
										<p className="text-xs text-red-600 leading-relaxed">
											{existingStory.reviewNotes}
										</p>
									</div>
								)}

							{/* Actions */}
							<div className="space-y-2">
								<Button
									variant="primary"
									size="md"
									type="submit"
									isLoading={isSubmitting}
									fullWidth
								>
									{isEdit ? "Save Changes" : "Submit for Review"}
								</Button>
								<Button
									variant="ghost"
									size="md"
									type="button"
									onClick={() => navigate("/profile?tab=stories")}
									disabled={isSubmitting}
									fullWidth
								>
									Cancel
								</Button>
							</div>
						</div>
					</div>
				</form>
			</div>
		</main>
	);
}

// ─── Status Badge ────────────────────────────────────────────────────

function StatusBadge({ status }: { status?: string }) {
	if (!status) return null;

	const config: Record<
		string,
		{
			label: string;
			variant: "default" | "primary" | "success" | "warning" | "error";
		}
	> = {
		pending: { label: "Pending Review", variant: "warning" },
		approved: { label: "Published", variant: "success" },
		rejected: { label: "Rejected", variant: "error" },
	};

	const c = config[status];
	if (!c) return null;

	return <Badge variant={c.variant}>{c.label}</Badge>;
}
