import {
	IconArrowLeft,
	IconCalendar,
	IconCheck,
	IconCircleCheck,
	IconCircleDashed,
	IconCircleX,
	IconClock,
	IconPencil,
	IconTag,
	IconUser,
} from "@tabler/icons-react";
import { Button } from "@aksob/ui/core/button";
import { Input } from "@aksob/ui/core/input";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Controller, useForm } from "react-hook-form";
import { useMemo } from "react";
import { TipTapEditor } from "@/app/stories/components/form/tip-tap-editor";
import {
	storyFormDefaultValues,
	storyFormSchema,
	type StoryFormSchema,
} from "@/app/stories/components/form/story-form-schema";
import { storyCategoryOptions } from "@/app/stories/constants/story-category-options";
import type { Story } from "@/app/stories/hooks/api/stories.functions";
import {
	useCreateStory,
	useUpdateStory,
} from "@/app/stories/hooks/api/stories.queries";
import { useSession } from "@/lib/auth";
import { m } from "@/paraglide/messages";
import { cn } from "@aksob/ui/lib/utils";

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

// -------------------------------------------------------------------> Status Visuals

const statusVisuals: Record<
	string,
	{
		label: string;
		icon: React.ElementType;
		bg: string;
		text: string;
		ring: string;
		description: string;
	}
> = {
	pending: {
		label: m.stories_status_pending(),
		icon: IconCircleDashed,
		bg: "bg-amber-50",
		text: "text-amber-700",
		ring: "ring-amber-200",
		description: "Awaiting review",
	},
	approved: {
		label: m.stories_status_approved(),
		icon: IconCircleCheck,
		bg: "bg-emerald-50",
		text: "text-emerald-700",
		ring: "ring-emerald-200",
		description: "Published and visible",
	},
	rejected: {
		label: m.stories_status_rejected(),
		icon: IconCircleX,
		bg: "bg-rose-50",
		text: "text-rose-700",
		ring: "ring-rose-200",
		description: "Needs revision",
	},
};

// -------------------------------------------------------------------> Helpers

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((w) => w[0])
		.filter(Boolean)
		.slice(0, 2)
		.join("")
		.toUpperCase();
}

function countWords(html: string): number {
	const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
	if (!text) return 0;
	return text.split(" ").length;
}

function readingTime(words: number): string {
	const minutes = Math.ceil(words / 200);
	return `${minutes} min read`;
}

// -------------------------------------------------------------------> Component

export function StoryForm({ defaultValues, storyId, existingStory }: StoryFormProps) {
	const location = useLocation();
	const navigate = useNavigate();
	const { data: sessionData } = useSession();
	const isAdmin = sessionData?.user?.role === "admin";
	const isCreate = location.pathname.endsWith("/create");

	const form = useForm<StoryFormSchema>({
		mode: "onSubmit",
		reValidateMode: "onChange",
		defaultValues: defaultValues ?? storyFormDefaultValues,
		resolver: standardSchemaResolver(storyFormSchema),
	});

	const { mutate: createStory, isPending: isCreating } = useCreateStory();
	const { mutate: updateStory, isPending: isUpdating } = useUpdateStory();
	const isLoading = isCreating || isUpdating;

	const contentValue = form.watch("content");
	const wordCount = useMemo(() => countWords(contentValue), [contentValue]);

	const statusVisual = existingStory
		? statusVisuals[existingStory.status]
		: undefined;

	const onSubmit = (values: StoryFormSchema) => {
		const payload = {
			...values,
			storyDate: values.storyDate || undefined,
			...(isAdmin && values.authorId ? { authorId: values.authorId } : {}),
		};

		if (isCreate) {
			createStory(payload, {
				onSuccess: () => {
					void navigate({ to: "/admin/stories" });
				},
			});
			return;
		}

		if (!storyId) return;

		updateStory(
			{ id: storyId, ...payload },
			{
				onSuccess: () => {
					void navigate({ to: "/admin/stories" });
				},
			},
		);
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col">
			{/* ===== Top Bar ===== */}
			<div className="flex flex-shrink-0 items-center justify-between border-b border-black/[0.06] bg-white/80 px-5 py-3 backdrop-blur-xl">
				<div className="flex items-center gap-4">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="h-9 gap-2 text-muted-foreground/70 hover:bg-black/[0.04] hover:text-foreground"
						onClick={() => navigate({ to: "/admin/stories" })}
					>
						<IconArrowLeft size={16} strokeWidth={2} />
						<span className="text-sm font-medium">{m.stories_form_back_button()}</span>
					</Button>

					{statusVisual && (
						<div className="hidden items-center gap-2 sm:flex">
							<div className="h-4 w-px bg-border/60" />
							<div
								className={cn(
									"flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
									statusVisual.bg,
									statusVisual.text,
									statusVisual.ring,
								)}
							>
								<statusVisual.icon size={13} />
								{statusVisual.label}
							</div>
						</div>
					)}
				</div>

				{existingStory && (
					<span className="hidden items-center gap-1.5 text-xs text-muted-foreground/60 sm:flex">
						<IconPencil size={12} />
						Edited {new Date(existingStory.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
					</span>
				)}
			</div>

			{/* ===== Content ===== */}
			<div className="flex flex-1 overflow-hidden">
				{/* ----- Writing Canvas ----- */}
				<div className="flex-1 overflow-y-auto bg-white">
					<div className="mx-auto max-w-3xl px-8 pb-20 pt-14 lg:px-16 lg:pt-20">
						{/* Draft Label */}
						{isCreate && (
							<div className="mb-8">
								<span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-muted-foreground/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/40">
									<IconPencil size={11} />
									Draft
								</span>
							</div>
						)}

						{/* Title */}
						<div className="mb-2">
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
								{form.watch("category")}
							</span>
						</div>
					</div>
				</div>

				{/* ----- Right Inspector Panel ----- */}
				<div className="hidden w-[320px] flex-shrink-0 overflow-y-auto border-l border-[#e8e6e1] bg-[#f7f6f3] lg:block">
					<div className="space-y-8 p-6">
						{/* Status Card */}
						{statusVisual && existingStory && (
							<div className="rounded-xl border border-black/[0.06] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
								<div className="flex items-start gap-3.5">
									<div
										className={cn(
											"flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ring-1",
											statusVisual.bg,
											statusVisual.ring,
										)}
									>
										<statusVisual.icon
											size={20}
											className={statusVisual.text}
										/>
									</div>
									<div className="min-w-0">
										<p className="text-sm font-semibold text-foreground">
											{statusVisual.label}
										</p>
										<p className="mt-0.5 text-xs text-muted-foreground/70">
											{statusVisual.description}
										</p>
										<div className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground/40">
											<IconClock size={11} />
											<span>
												Last edited{" "}
												{new Date(existingStory.updatedAt).toLocaleDateString(undefined, {
													month: "short",
													day: "numeric",
												})}
											</span>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Author Byline */}
						{existingStory && (
							<div className="rounded-xl border border-black/[0.06] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
								<p className="mb-3.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/40">
									{m.stories_form_author_section()}
								</p>
								<div className="flex items-center gap-3.5">
									<div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#076951] text-sm font-bold text-white shadow-sm">
										{getInitials(existingStory.author.name)}
									</div>
									<div className="min-w-0">
										<p className="truncate text-sm font-semibold text-foreground">
											{existingStory.author.name}
										</p>
										<p className="truncate text-xs text-muted-foreground/70">
											{existingStory.author.major}
										</p>
									</div>
								</div>
							</div>
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
																	isSelected ? "bg-white/80" : visual?.dot ?? "bg-gray-400",
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
										<IconCalendar size={13} className="text-muted-foreground/40" />
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

								{/* Admin Author ID */}
								{isAdmin && isCreate && (
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<IconUser size={13} className="text-muted-foreground/40" />
											<span className="text-xs font-medium text-foreground/70">
												{m.stories_form_author_label()}
											</span>
										</div>
										<Input
											type="text"
											className="h-10 border-[#e8e6e1] bg-white text-sm shadow-sm transition-colors focus:border-[#076951]/30 focus:ring-[#076951]/10"
											placeholder={m.stories_form_author_placeholder()}
											{...form.register("authorId")}
										/>
							</div>
						)}
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
