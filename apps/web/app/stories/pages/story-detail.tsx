import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import { Link, useParams } from "react-router";

import {
	getStory,
	STORY_CATEGORY_LABELS,
	type StoryCategory,
} from "~/app/lib/stories";
import { Avatar } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { FullPageLoader } from "~/components/ui/loading-spinner";

export default function StoryDetailPage() {
	const { id } = useParams<{ id: string }>();

	const {
		data: story,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["story", id],
		queryFn: () => getStory(id!).then((r) => r.data),
		enabled: !!id,
	});

	if (isLoading) {
		return (
			<main className="min-h-screen bg-(--off-white) pt-20">
				<div className="flex items-center justify-center py-32">
					<FullPageLoader />
				</div>
			</main>
		);
	}

	if (error || !story) {
		return (
			<main className="min-h-screen bg-(--off-white) pt-20">
				<div className="max-w-3xl mx-auto px-6 py-16 text-center">
					<h1
						className="text-3xl font-light text-(--aksob-darkest)"
						style={{ fontFamily: "var(--font-display)" }}
					>
						Story Not Found
					</h1>
					<p className="mt-4 text-[var(--gray-500)]">
						The story you&apos;re looking for doesn&apos;t exist or has been
						removed.
					</p>
					<Link
						to="/stories"
						className="mt-6 inline-flex items-center gap-2 text-[var(--aksob-primary)] hover:underline"
					>
						<ArrowLeft size={16} />
						Back to Stories
					</Link>
				</div>
			</main>
		);
	}

	const dateStr = story.storyDate
		? new Date(story.storyDate).toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			})
		: "";

	const wordCount = story.content
		? story.content
				.replace(/<[^>]*>/g, " ")
				.replace(/\s+/g, " ")
				.trim()
				.split(" ").length
		: 0;
	const readTime = Math.ceil(wordCount / 200);

	return (
		<main className="min-h-screen bg-(--off-white) pt-20">
			{/* Back link */}
			<div className="max-w-4xl mx-auto px-6 py-6">
				<Link
					to="/stories"
					className="inline-flex items-center gap-2 text-sm text-[var(--gray-500)] hover:text-[var(--aksob-primary)] transition-colors"
				>
					<ArrowLeft size={16} />
					Back to Stories
				</Link>
			</div>

			{/* Cover Image */}
			{story.coverImage && (
				<div className="max-w-5xl mx-auto px-6">
					<img
						src={story.coverImage}
						alt={story.title}
						className="w-full aspect-[2/1] object-cover rounded-2xl"
					/>
				</div>
			)}

			{/* Content */}
			<article className="max-w-3xl mx-auto px-6 py-12">
				{/* Meta */}
				<div className="flex items-center gap-3 mb-6 flex-wrap">
					<Badge variant="primary" className="text-xs">
						{STORY_CATEGORY_LABELS[story.category as StoryCategory] ??
							story.category}
					</Badge>
				</div>

				{/* Title */}
				<h1
					className="text-4xl md:text-5xl font-bold text-(--aksob-darkest) tracking-tight leading-tight"
					style={{ fontFamily: "var(--font-display)" }}
				>
					{story.title}
				</h1>

				{/* Description */}
				<p className="mt-4 text-xl text-[var(--gray-500)] leading-relaxed">
					{story.description}
				</p>

				{/* Author & Date */}
				<div className="mt-8 flex items-center gap-4 flex-wrap">
					<div className="flex items-center gap-3">
						<Avatar
							name={story.author.name}
							src={story.author.image ?? undefined}
							size="md"
						/>
						<div>
							<p className="text-sm font-medium text-(--aksob-darkest)">
								{story.author.name}
							</p>
							{story.author.major && (
								<p className="text-xs text-[var(--gray-400)]">
									{story.author.major}
								</p>
							)}
						</div>
					</div>
					<div className="flex items-center gap-4 text-xs text-[var(--gray-400)]">
						{dateStr && (
							<span className="flex items-center gap-1">
								<Calendar size={12} />
								{dateStr}
							</span>
						)}
						<span className="flex items-center gap-1">
							<Clock size={12} />
							{readTime} min read
						</span>
						<span className="flex items-center gap-1">
							<Tag size={12} />
							{wordCount.toLocaleString()} words
						</span>
					</div>
				</div>

				{/* Divider */}
				<hr className="mt-8 mb-10 border-[var(--gray-200)]" />

				{/* Story Content */}
				<div
					className="prose prose-aksob max-w-none"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: Tiptap HTML content from trusted API
					dangerouslySetInnerHTML={{ __html: story.content }}
				/>

				{/* Rejection notes (visible to author) */}
				{story.status === "rejected" && story.reviewNotes && (
					<div className="mt-12 p-5 rounded-xl bg-red-50 border border-red-100">
						<h3 className="text-sm font-semibold text-red-700 mb-2">
							Review Feedback
						</h3>
						<p className="text-sm text-red-600">{story.reviewNotes}</p>
					</div>
				)}
			</article>
		</main>
	);
}
