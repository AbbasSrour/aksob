import {
	Combobox,
	type ComboboxOption,
} from "@aksob/ui/components/form/combobox";
import { Button } from "@aksob/ui/core/button";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import {
	IconCalendar,
	IconPhoto,
	IconPhotoPlus,
	IconTrash,
	IconUser,
	IconX,
} from "@tabler/icons-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { NewsCategorySelector } from "@/app/news/components/form/news-category-selector";
import {
	type NewsFormSchema,
	newsFormDefaultValues,
	newsFormSchema,
} from "@/app/news/components/form/news-form-schema";
import {
	useCreateNews,
	useUpdateNews,
} from "@/app/news/hooks/api/news.queries";
import { TipTapEditor } from "@/app/stories/components/form/tip-tap-editor";
import { userQueries } from "@/app/users/hooks/api/users.queries";
import { useSession } from "@/lib/auth";
import { uploadMediaFiles } from "@/lib/media";

interface NewsFormProps {
	defaultValues?: NewsFormSchema;
	newsId?: string;
}

function countWords(html: string): number {
	const text = html
		.replace(/<[^>]*>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
	if (!text) return 0;
	return text.split(" ").length;
}

function readingTimeMinutes(words: number): number {
	return Math.ceil(words / 200);
}

function readingTimeLabel(words: number): string {
	return `${readingTimeMinutes(words)} min read`;
}

export function NewsForm({ defaultValues, newsId }: NewsFormProps) {
	const location = useLocation();
	const navigate = useNavigate();
	const { data: sessionData } = useSession();
	const isAdmin = sessionData?.user?.role === "admin";
	const isCreate = location.pathname.endsWith("/create");

	const [authorSearch, setAuthorSearch] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const pendingImagesRef = useRef<Map<string, File>>(new Map());
	const pendingCoverRef = useRef<File | null>(null);
	const pendingThumbnailRef = useRef<File | null>(null);

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
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
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
		if (hasNextPage && !isFetchingNextPage) {
			void fetchNextPage();
		}
	};

	const effectiveDefaults = useMemo(() => {
		if (defaultValues) return defaultValues;
		return { ...newsFormDefaultValues, authorId: sessionData?.user?.id ?? "" };
	}, [defaultValues, sessionData]);

	const form = useForm<NewsFormSchema>({
		mode: "onSubmit",
		reValidateMode: "onChange",
		defaultValues: effectiveDefaults,
		resolver: standardSchemaResolver(newsFormSchema),
	});

	const { mutate: createNews, isPending: isCreating } = useCreateNews();
	const { mutate: updateNews, isPending: isUpdating } = useUpdateNews();
	const isLoading = isSubmitting || isCreating || isUpdating;

	const contentValue = form.watch("content");
	const wordCount = useMemo(() => countWords(contentValue), [contentValue]);

	const handleCoverSelect = useCallback(
		(file: File) => {
			const url = URL.createObjectURL(file);
			const prev = form.getValues("coverImage");
			if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
			pendingCoverRef.current = file;
			form.setValue("coverImage", url, { shouldDirty: true });
		},
		[form],
	);

	const handleThumbnailSelect = useCallback(
		(file: File) => {
			const url = URL.createObjectURL(file);
			const prev = form.getValues("thumbnailImage");
			if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
			pendingThumbnailRef.current = file;
			form.setValue("thumbnailImage", url, { shouldDirty: true });
		},
		[form],
	);

	const handleEditorImageAdd = useCallback((file: File): string => {
		const url = URL.createObjectURL(file);
		pendingImagesRef.current.set(url, file);
		return url;
	}, []);

	const onSubmit = async (values: NewsFormSchema) => {
		setIsSubmitting(true);
		try {
			const uploadedBlobUrls = new Map<string, string>();
			let coverImageUrl: string | undefined;
			let thumbnailImageUrl: string | undefined;

			for (const [blobUrl, file] of pendingImagesRef.current.entries()) {
				const results = await uploadMediaFiles("storyImage", {
					files: [file],
				});
				const url = results?.[0]?.serverData?.mediaUrl;
				if (url) uploadedBlobUrls.set(blobUrl, url);
				else toast.error("Failed to upload an image");
			}

			if (pendingCoverRef.current) {
				const results = await uploadMediaFiles("storyImage", {
					files: [pendingCoverRef.current],
				});
				coverImageUrl = results?.[0]?.serverData?.mediaUrl;
				if (!coverImageUrl) toast.error("Failed to upload cover image");
			}

			if (pendingThumbnailRef.current) {
				const results = await uploadMediaFiles("storyImage", {
					files: [pendingThumbnailRef.current],
				});
				thumbnailImageUrl = results?.[0]?.serverData?.mediaUrl;
				if (!thumbnailImageUrl) toast.error("Failed to upload thumbnail image");
			}

			let content = values.content;
			for (const [blobUrl, realUrl] of uploadedBlobUrls.entries()) {
				content = content.replaceAll(blobUrl, realUrl);
				URL.revokeObjectURL(blobUrl);
				pendingImagesRef.current.delete(blobUrl);
			}

			const coverImage = coverImageUrl ?? values.coverImage;
			const thumbnailImage = thumbnailImageUrl ?? values.thumbnailImage;

			const payload = {
				title: values.title,
				excerpt: values.excerpt,
				content,
				coverImage: coverImage || undefined,
				thumbnailImage: thumbnailImage || undefined,
				readTime: readingTimeMinutes(wordCount),
				categoryId: values.categoryId || undefined,
				authorId: isAdmin ? values.authorId || undefined : undefined,
				date: values.date || undefined,
			};

			const onSuccess = () => void navigate({ to: "/admin/news" });

			if (isCreate) {
				createNews(payload, { onSuccess });
			} else if (newsId) {
				updateNews({ id: newsId, ...payload }, { onSuccess });
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			console.error("Failed to save article:", message, error);
			toast.error(`Failed to save article: ${message}`);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			className="flex min-h-0 flex-1 flex-col"
		>
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
													<IconX size={14} /> Remove
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
											<IconPhotoPlus
												size={28}
												className="text-muted-foreground/30 transition-colors group-hover:text-[#076951]/50"
												strokeWidth={1.5}
											/>
											<span className="text-xs text-muted-foreground/40 transition-colors group-hover:text-muted-foreground/60">
												Add cover image
											</span>
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
								placeholder="Article title"
								className="w-full border-0 bg-transparent text-5xl font-bold leading-[1.1] tracking-tighter text-foreground placeholder:text-muted-foreground/15 focus:outline-none focus:ring-0"
								{...form.register("title", { required: true })}
							/>
							{form.formState.errors.title && (
								<p className="mt-3 text-sm font-medium text-destructive">
									{form.formState.errors.title.message}
								</p>
							)}
						</div>

						{/* Excerpt */}
						<div className="mb-12">
							<input
								type="text"
								placeholder="A short description of the article..."
								className="w-full border-0 bg-transparent text-xl font-normal leading-relaxed text-muted-foreground/80 placeholder:text-muted-foreground/20 focus:outline-none focus:ring-0"
								{...form.register("excerpt", { required: true })}
							/>
							{form.formState.errors.excerpt && (
								<p className="mt-3 text-sm font-medium text-destructive">
									{form.formState.errors.excerpt.message}
								</p>
							)}
						</div>

						{/* TipTap Editor */}
						<Controller
							control={form.control}
							name="content"
							render={({ field }) => (
								<TipTapEditor
									placeholder="Write your article..."
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

						{/* Word count / reading time footer */}
						<div className="mt-10 flex items-center gap-3 border-t border-dashed border-black/[0.06] pt-4">
							<span className="text-[11px] font-medium tabular-nums tracking-wide text-muted-foreground/40">
								{wordCount.toLocaleString()} words
							</span>
							<span className="text-muted-foreground/20">·</span>
							<span className="text-[11px] font-medium tracking-wide text-muted-foreground/40">
								{readingTimeLabel(wordCount)}
							</span>
						</div>
					</div>
				</div>

				{/* ----- Right Inspector Panel ----- */}
				<div className="hidden w-[320px] flex-shrink-0 overflow-y-auto border-l border-[#e8e6e1] bg-white lg:block">
					<div className="space-y-8 p-6">
						{/* Thumbnail */}
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
													<IconTrash size={14} /> Remove
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
											<IconPhotoPlus
												size={20}
												className="text-muted-foreground/30 transition-colors group-hover:text-[#076951]/50"
												strokeWidth={1.5}
											/>
											<span className="text-[10px] text-muted-foreground/40 transition-colors group-hover:text-muted-foreground/60">
												Add thumbnail
											</span>
										</label>
									)}
								</div>
							)}
						/>

						{/* Author (admin only) */}
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
												Author
											</span>
										</div>
										<Combobox
											value={field.value}
											onChange={field.onChange}
											options={authorOptions}
											placeholder="Select author..."
											searchPlaceholder="Search users..."
											emptyMessage="No users found."
											isLoading={isFetchingNextPage || isAuthorPending}
											onScrollEnd={onAuthorScrollEnd}
											searchValue={authorSearch}
											setSearchValue={setAuthorSearch}
										/>
									</div>
								)}
							/>
						)}

						{/* Category */}
						<Controller
							control={form.control}
							name="categoryId"
							render={({ field }) => (
								<NewsCategorySelector
									value={field.value}
									onChange={field.onChange}
								/>
							)}
						/>

						{/* Date Input */}
						<div className="space-y-2.5">
							<div className="flex items-center gap-2">
								<IconCalendar size={13} className="text-muted-foreground/40" />
								<span className="text-xs font-medium text-foreground/70">
									Display Date
								</span>
							</div>
							<div className="relative">
								<input
									type="date"
									className="h-10 w-full rounded-lg border border-[#e8e6e1] bg-white px-3 text-sm shadow-sm transition-colors focus:border-[#076951]/30 focus:outline-none focus:ring-1 focus:ring-[#076951]/10"
									{...form.register("date")}
								/>
							</div>
							<p className="text-[10px] leading-relaxed text-muted-foreground/40">
								Optional. Used for display on the public site. Leave empty to
								use the publish date.
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Bottom Action Bar */}
			<div className="flex flex-shrink-0 items-center justify-end gap-x-2 border-t border-black/[0.06] bg-white px-5 py-3">
				<Button
					type="button"
					variant="outline"
					className="min-w-40"
					onClick={() => navigate({ to: "/admin/news" })}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					className="min-w-40 bg-[#076951] hover:bg-[#16876b]"
					disabled={isLoading}
				>
					{isCreate ? "Create Article" : "Save Changes"}
				</Button>
			</div>
		</form>
	);
}
