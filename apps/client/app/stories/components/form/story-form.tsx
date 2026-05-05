import {
	Combobox,
	type ComboboxOption,
} from "@aksob/ui/components/form/combobox";
import { Button } from "@aksob/ui/core/button";
import { Input } from "@aksob/ui/core/input";
import { cn } from "@aksob/ui/lib/utils";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import {
	IconCalendar,
	IconCheck,
	IconPhoto,
	IconPhotoPlus,
	IconTag,
	IconTrash,
	IconUser,
	IconX,
} from "@tabler/icons-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import {
	type StoryFormSchema,
	storyFormDefaultValues,
	storyFormSchema,
} from "@/app/stories/components/form/story-form-schema";
import { TipTapEditor } from "@/app/stories/components/form/tip-tap-editor";
import { storyCategoryOptions } from "@/app/stories/constants/story-category-options";
import type { Story } from "@/app/stories/hooks/api/stories.functions";
import {
	useCreateStory,
	useUpdateStory,
} from "@/app/stories/hooks/api/stories.queries";
import { userQueries } from "@/app/users/hooks/api/users.queries";
import { useSession } from "@/lib/auth";
import { uploadMediaFiles } from "@/lib/media";
import { m } from "@/paraglide/messages";

interface StoryFormProps {
	defaultValues?: StoryFormSchema;
	storyId?: string;
	existingStory?: Story;
}

// -------------------------------------------------------------------> Category Visuals

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

// -------------------------------------------------------------------> Helpers

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

// -------------------------------------------------------------------> Component

export function StoryForm({
	defaultValues,
	storyId,
}: StoryFormProps) {
	const location = useLocation();
	const navigate = useNavigate();
	const { data: sessionData } = useSession();
	const isAdmin = sessionData?.user?.role === "admin";
	const isCreate = location.pathname.endsWith("/create");

	const [authorSearch, setAuthorSearch] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Blob URL → File mapping for images not yet uploaded
	const pendingImagesRef = useRef<Map<string, File>>(new Map());
	// Pending cover/thumbnail files (blob URL stored in form, file stored here)
	const pendingCoverRef = useRef<File | null>(null);
	const pendingThumbnailRef = useRef<File | null>(null);

	// Revoke all blob URLs on unmount to prevent memory leaks
	useEffect(() => {
		const pendingImages = pendingImagesRef.current;
		return () => {
			for (const blobUrl of pendingImages.keys()) {
				URL.revokeObjectURL(blobUrl);
			}
		};
	}, []);

	const {
		data: authorPages,
		fetchNextPage: fetchNextAuthorPage,
		hasNextPage: hasNextAuthorPage,
		isFetchingNextPage: isFetchingNextAuthorPage,
		isPending: isAuthorPending,
	} = useInfiniteQuery({
		...userQueries.infinite({
			search: authorSearch || undefined,
			searchField: "name",
			pageSize: 20,
		}),
		enabled: isAdmin,
	});

	const authorOptions = useMemo(() => {
		if (!authorPages) return [] as ComboboxOption[];

		return authorPages.pages
			.flatMap((page) => page.data)
			.map((user) => ({
				value: user.id,
				label: `${user.name}${user.email ? ` (${user.email})` : ""}`,
			}));
	}, [authorPages]);

	const onAuthorScrollEnd = () => {
		if (hasNextAuthorPage && !isFetchingNextAuthorPage) {
			void fetchNextAuthorPage();
		}
	};

	const effectiveDefaults = useMemo(() => {
		if (defaultValues) return defaultValues;
		return {
			...storyFormDefaultValues,
			authorId: sessionData?.user?.id ?? "",
		};
	}, [defaultValues, sessionData]);

	const form = useForm<StoryFormSchema>({
		mode: "onSubmit",
		reValidateMode: "onChange",
		defaultValues: effectiveDefaults,
		resolver: standardSchemaResolver(storyFormSchema),
	});

	const { mutate: createStory, isPending: isCreating } = useCreateStory();
	const { mutate: updateStory, isPending: isUpdating } = useUpdateStory();
	const isLoading = isSubmitting || isCreating || isUpdating;

	const contentValue = form.watch("content");
	const wordCount = useMemo(() => countWords(contentValue), [contentValue]);

	// ----- Cover/Thumbnail: use blob URLs for preview, store File for later upload -----

	const handleCoverSelect = useCallback(
		(file: File) => {
			const url = URL.createObjectURL(file);
			// Revoke previous blob if it was a local blob
			const prev = form.getValues("coverImage");
			if (prev && prev.startsWith("blob:")) {
				URL.revokeObjectURL(prev);
			}
			pendingCoverRef.current = file;
			form.setValue("coverImage", url, { shouldDirty: true });
		},
		[form],
	);

	const handleThumbnailSelect = useCallback(
		(file: File) => {
			const url = URL.createObjectURL(file);
			const prev = form.getValues("thumbnailImage");
			if (prev && prev.startsWith("blob:")) {
				URL.revokeObjectURL(prev);
			}
			pendingThumbnailRef.current = file;
			form.setValue("thumbnailImage", url, { shouldDirty: true });
		},
		[form],
	);

	// ----- Editor: return blob URL immediately, track File for later upload -----
	const handleEditorImageAdd = useCallback((file: File): string => {
		const url = URL.createObjectURL(file);
		pendingImagesRef.current.set(url, file);
		return url;
	}, []);

	// ----- Submit: upload pending files, swap URLs, then save -----
	const onSubmit = async (values: StoryFormSchema) => {
		setIsSubmitting(true);
		try {
			// Upload pending files one at a time (endpoint allows maxFileCount: 1)
			const uploadedBlobUrls = new Map<string, string>();
			let coverImageUrl: string | undefined;
			let thumbnailImageUrl: string | undefined;

			// Upload editor images
			for (const [blobUrl, file] of pendingImagesRef.current.entries()) {
				const results = await uploadMediaFiles("storyImage", { files: [file] });
				const url = results?.[0]?.serverData?.mediaUrl;
				if (url) {
					uploadedBlobUrls.set(blobUrl, url);
				} else {
					toast.error("Failed to upload an image");
				}
			}

			// Upload cover image
			if (pendingCoverRef.current) {
				const results = await uploadMediaFiles("storyImage", {
					files: [pendingCoverRef.current],
				});
				coverImageUrl = results?.[0]?.serverData?.mediaUrl;
				if (!coverImageUrl) {
					toast.error("Failed to upload cover image");
				}
			}

			// Upload thumbnail image
			if (pendingThumbnailRef.current) {
				const results = await uploadMediaFiles("storyImage", {
					files: [pendingThumbnailRef.current],
				});
				thumbnailImageUrl = results?.[0]?.serverData?.mediaUrl;
				if (!thumbnailImageUrl) {
					toast.error("Failed to upload thumbnail image");
				}
			}

			// Build final payload, replacing blob URLs with real URLs
			let content = values.content;
			for (const [blobUrl, realUrl] of uploadedBlobUrls.entries()) {
				content = content.replaceAll(blobUrl, realUrl);
				URL.revokeObjectURL(blobUrl);
				pendingImagesRef.current.delete(blobUrl);
			}

			const coverImage = coverImageUrl ?? values.coverImage;
			const thumbnailImage = thumbnailImageUrl ?? values.thumbnailImage;

			const payload = {
				...values,
				content,
				coverImage: coverImage || undefined,
				thumbnailImage: thumbnailImage || undefined,
				storyDate: values.storyDate,
				...(isAdmin && values.authorId ? { authorId: values.authorId } : {}),
			};

			const onSuccess = () => {
				void navigate({ to: "/admin/stories" });
			};

			if (isCreate) {
				createStory(payload, { onSuccess });
			} else if (storyId) {
				updateStory({ id: storyId, ...payload }, { onSuccess });
			}
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Unknown error";
			console.error("Failed to save story:", message, error);
			toast.error(`Failed to save story: ${message}`);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			className="flex min-h-0 flex-1 flex-col"
		>
			{/* ===== Content ===== */}
			<div className="flex flex-1 overflow-hidden">
				{/* ----- Writing Canvas ----- */}
				<div className="flex-1 overflow-y-auto bg-white">
					<div className="mx-auto max-w-3xl px-8 pb-20 pt-8 lg:px-16 lg:pt-10">
						{/* Cover Image */}
						<Controller
							control={form.control}
							name="coverImage"
							render={({ field }) => (
								<div className="mb-8">
									{field.value ? (
										<div className="group relative overflow-hidden rounded-xl">
											<img
												src={field.value}
												alt="Cover"
												className="aspect-[2/1] w-full object-cover"
											/>
											<div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
												<button
													type="button"
													onClick={() => {
														if (field.value.startsWith("blob:")) {
															URL.revokeObjectURL(field.value);
															pendingCoverRef.current = null;
														}
														field.onChange("");
													}}
													className="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm hover:bg-white"
												>
													<IconX size={14} />
													Remove
												</button>
											</div>
										</div>
									) : (
										<label className="group flex aspect-[2/1] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/[0.08] bg-black/[0.01] transition-colors hover:border-[#076951]/30 hover:bg-[#076951]/[0.03]">
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
											<>
												<IconPhotoPlus
													size={28}
													className="text-muted-foreground/30 transition-colors group-hover:text-[#076951]/50"
													strokeWidth={1.5}
												/>
												<span className="text-xs text-muted-foreground/40 transition-colors group-hover:text-muted-foreground/60">
													Add cover image
												</span>
											</>
										</label>
									)}
								</div>
							)}
						/>

						{/* Title */}
						<div className="mb-2">
							{isCreate && (
								<p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground/40">
									Draft
								</p>
							)}
							<input
								type="text"
								placeholder={m.stories_form_title_placeholder()}
								className="w-full border-0 bg-transparent text-5xl font-bold leading-[1.1] tracking-tighter text-foreground placeholder:text-muted-foreground/15 focus:outline-none focus:ring-0"
								{...form.register("title", { required: true })}
							/>
							{form.formState.errors.title && (
								<p className="mt-3 text-sm font-medium text-destructive">
									{form.formState.errors.title.message}
								</p>
							)}
						</div>

						{/* Description */}
						<div className="mb-12">
							<input
								type="text"
								placeholder={m.stories_form_description_placeholder()}
								className="w-full border-0 bg-transparent text-xl font-normal leading-relaxed text-muted-foreground/80 placeholder:text-muted-foreground/20 focus:outline-none focus:ring-0"
								{...form.register("description", { required: true })}
							/>
							{form.formState.errors.description && (
								<p className="mt-3 text-sm font-medium text-destructive">
									{form.formState.errors.description.message}
								</p>
							)}
						</div>

						{/* Editor */}
						<Controller
							control={form.control}
							name="content"
							render={({ field }) => (
								<TipTapEditor
									placeholder={m.stories_form_content_placeholder()}
									value={field.value}
									onChange={field.onChange}
									onImageAdd={handleEditorImageAdd}
								/>
							)}
						/>
						{form.formState.errors.content && (
							<p className="mt-3 text-sm font-medium text-destructive">
								{form.formState.errors.content.message}
							</p>
						)}

						{/* Word Count */}
						<div className="mt-10 flex items-center gap-3 border-t border-dashed border-black/[0.06] pt-4">
							<span className="text-[11px] font-medium tabular-nums tracking-wide text-muted-foreground/40">
								{wordCount.toLocaleString()} words
							</span>
							<span className="text-muted-foreground/20">·</span>
							<span className="text-[11px] font-medium tracking-wide text-muted-foreground/40">
								{readingTime(wordCount)}
							</span>
							<span className="text-muted-foreground/20">·</span>
							<span className="text-[11px] font-medium tracking-wide text-muted-foreground/40">
								{storyCategoryOptions.find(
									(o) => o.value === form.watch("category"),
								)?.label ?? form.watch("category")}
							</span>
						</div>
					</div>
				</div>

				{/* ----- Right Inspector Panel ----- */}
				<div className="hidden w-[320px] flex-shrink-0 overflow-y-auto border-l border-[#e8e6e1] bg-white lg:block">
					<div className="space-y-8 p-6">
						{/* Thumbnail Image */}
						<Controller
							control={form.control}
							name="thumbnailImage"
							render={({ field }) => (
								<div className="space-y-2.5">
									<div className="flex items-center gap-2">
										<IconPhoto size={13} className="text-muted-foreground/40" />
										<span className="text-xs font-medium text-foreground/70">
											Thumbnail
										</span>
									</div>
									{field.value ? (
										<div className="group relative overflow-hidden rounded-lg border border-black/[0.06]">
											<img
												src={field.value}
												alt="Thumbnail"
												className="aspect-[16/9] w-full object-cover"
											/>
											<div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
												<button
													type="button"
													onClick={() => {
														if (field.value.startsWith("blob:")) {
															URL.revokeObjectURL(field.value);
															pendingThumbnailRef.current = null;
														}
														field.onChange("");
													}}
													className="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm hover:bg-white"
												>
													<IconTrash size={14} />
													Remove
												</button>
											</div>
										</div>
									) : (
										<label className="group flex aspect-[16/9] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-black/[0.08] bg-black/[0.01] transition-colors hover:border-[#076951]/30 hover:bg-[#076951]/[0.03]">
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
											<>
												<IconPhotoPlus
													size={20}
													className="text-muted-foreground/30 transition-colors group-hover:text-[#076951]/50"
													strokeWidth={1.5}
												/>
												<span className="text-[10px] text-muted-foreground/40 transition-colors group-hover:text-muted-foreground/60">
													Add thumbnail
												</span>
											</>
										</label>
									)}
								</div>
							)}
						/>

						{/* Author */}
						{isAdmin && (
							<Controller
								control={form.control}
								name="authorId"
								render={({ field }) => (
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<IconUser
												size={13}
												className="text-muted-foreground/40"
											/>
											<span className="text-xs font-medium text-foreground/70">
												{m.stories_form_author_label()}
											</span>
										</div>
										<Combobox
											value={field.value}
											onChange={field.onChange}
											options={authorOptions}
											placeholder={m.stories_form_author_placeholder()}
											searchPlaceholder={m.stories_form_author_placeholder()}
											emptyMessage="No users found."
											isLoading={isFetchingNextAuthorPage || isAuthorPending}
											onScrollEnd={onAuthorScrollEnd}
											searchValue={authorSearch}
											setSearchValue={setAuthorSearch}
										/>
									</div>
								)}
							/>
						)}

						{/* Properties Section */}
						<div className="space-y-5">
							{/* Category */}
							<div className="space-y-2.5">
								<div className="flex items-center gap-2">
									<IconTag size={13} className="text-muted-foreground/40" />
									<span className="text-xs font-medium text-foreground/70">
										{m.stories_form_category_label()}
									</span>
								</div>
								<Controller
									control={form.control}
									name="category"
									render={({ field }) => (
										<div className="space-y-2">
											{storyCategoryOptions.map((option) => {
												const visual = categoryVisuals[option.value];
												const isSelected = field.value === option.value;
												return (
													<button
														key={option.value}
														type="button"
														onClick={() => field.onChange(option.value)}
														className={cn(
															"flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-xs font-medium transition-all duration-200",
															isSelected
																? "border-[#076951] bg-[#076951] text-white shadow-sm"
																: "border-[#e8e6e1] bg-white text-foreground/70 hover:border-[#076951]/30 hover:bg-[#076951]/[0.04] hover:shadow-sm",
														)}
													>
														<span
															className={cn(
																"h-2 w-2 flex-shrink-0 rounded-full transition-colors",
																isSelected
																	? "bg-white/80"
																	: (visual?.dot ?? "bg-gray-400"),
															)}
														/>
														<span className="truncate">{option.label}</span>
														{isSelected && (
															<IconCheck
																size={13}
																className="ml-auto flex-shrink-0 opacity-80"
															/>
														)}
													</button>
												);
											})}
										</div>
									)}
								/>
							</div>

							{/* Date */}
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<IconCalendar
										size={13}
										className="text-muted-foreground/40"
									/>
									<span className="text-xs font-medium text-foreground/70">
										{m.stories_form_date_label()}
									</span>
								</div>
								<div className="relative">
									<Input
										type="date"
										className="h-10 border-[#e8e6e1] bg-white text-sm shadow-sm transition-colors focus:border-[#076951]/30 focus:ring-[#076951]/10"
										{...form.register("storyDate")}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* ===== Bottom Bar ===== */}
			<div className="flex flex-shrink-0 items-center justify-end gap-x-2 border-t border-black/[0.06] bg-white px-5 py-3">
				<Button
					type="button"
					variant="outline"
					className="min-w-40"
					onClick={() => navigate({ to: "/admin/stories" })}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					className="min-w-40 bg-[#076951] hover:bg-[#16876b]"
					disabled={isLoading}
				>
					{isCreate
						? m.stories_form_create_button()
						: m.stories_form_save_button()}
				</Button>
			</div>
		</form>
	);
}
