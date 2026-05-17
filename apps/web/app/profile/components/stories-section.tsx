import { useQuery } from "@tanstack/react-query";
import {
	BookOpen,
	ChevronDown,
	ChevronUp,
	Clock,
	FileText,
	Loader2,
	Pencil,
	Plus,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import {
	STORY_CATEGORY_LABELS,
	type StoryCategory,
} from "~/app/lib/stories";
import { listMyStories, type StoryItem } from "~/app/lib/users";
import { Avatar } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

const STATUS_CONFIG: Record<
	string,
	{
		label: string;
		variant: "default" | "primary" | "success" | "warning" | "error";
		icon: React.ReactNode;
	}
> = {
	pending: {
		label: "Pending Review",
		variant: "warning",
		icon: <Clock size={12} />,
	},
	approved: {
		label: "Published",
		variant: "success",
		icon: <FileText size={12} />,
	},
	rejected: {
		label: "Rejected",
		variant: "error",
		icon: <FileText size={12} />,
	},
};

interface Props {
	userId: string;
}

export function StoriesSection({ userId }: Props) {
	const { data, isLoading } = useQuery({
		queryKey: ["my-stories", userId],
		queryFn: () => listMyStories(userId).then((r) => r.data),
	});

	const stories = data ?? [];

	return (
		<div className="space-y-4">
			{/* Create button */}
			<div className="flex justify-end">
				<Link
					to="/stories/new"
					className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--aksob-primary)] px-4 py-2 text-xs font-medium text-white transition-all duration-200 hover:bg-[var(--aksob-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--aksob-primary)] focus:ring-offset-2"
				>
					<Plus size={14} />
					Create Story
				</Link>
			</div>

			{/* List */}
			{isLoading ? (
				<div className="flex items-center justify-center py-12">
					<Loader2
						size={24}
						className="animate-spin text-[var(--aksob-primary)]"
					/>
				</div>
			) : stories.length === 0 ? (
				<div className="text-center py-12">
					<div className="w-16 h-16 bg-[var(--gray-100)] rounded-full flex items-center justify-center mx-auto mb-3">
						<BookOpen size={24} className="text-[var(--gray-400)]" />
					</div>
					<p className="text-sm text-[var(--gray-500)]">No stories yet.</p>
					<p className="text-xs text-[var(--gray-400)] mt-1">
						Share your journey and inspire the community.
					</p>
				</div>
			) : (
				<div className="grid gap-3">
					{stories.map((story) => (
						<StoryCard key={story.id} story={story} />
					))}
				</div>
			)}
		</div>
	);
}

function StoryCard({ story }: { story: StoryItem }) {
	const [expanded, setExpanded] = useState(false);
	const status = STATUS_CONFIG[story.status];

	return (
		<div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50">
			<div className="flex items-start gap-3">
				<Avatar
					name={story.author.name}
					src={story.author.image ?? undefined}
					size="md"
					className="w-10 h-10 flex-shrink-0"
				/>
				<div className="flex-1 min-w-0">
					<div className="flex items-start justify-between gap-2">
						<div className="flex-1 min-w-0">
							<h4 className="text-sm font-semibold text-gray-900 truncate">
								{story.title}
							</h4>
							<div className="flex items-center gap-2 mt-0.5 flex-wrap">
								<Badge variant="default" className="text-[10px] px-1.5 py-0.5">
									{STORY_CATEGORY_LABELS[story.category as StoryCategory] ??
										story.category}
								</Badge>
								<Badge
									variant={status.variant}
									className="text-[10px] px-1.5 py-0.5"
								>
									<span className="flex items-center gap-1">
										{status.icon}
										{status.label}
									</span>
								</Badge>
								{story.storyDate ? (
									<span className="text-xs text-[var(--gray-400)]">
										{new Date(story.storyDate).toLocaleDateString()}
									</span>
								) : null}
							</div>
						</div>
						<div className="flex items-center gap-1 flex-shrink-0">
							{story.status === "approved" && (
								<Link
									to={`/stories/${story.id}`}
									className="text-xs text-[var(--aksob-primary)] hover:underline px-2 py-1"
								>
									View
								</Link>
							)}
							<Link
								to={`/stories/${story.id}/edit`}
								className="p-1.5 rounded-md text-[var(--gray-400)] hover:text-[var(--aksob-primary)] hover:bg-[var(--pale-mint)] transition"
								title="Edit story"
							>
								<Pencil size={14} />
							</Link>
						</div>
					</div>

					<p className="text-xs text-[var(--gray-500)] mt-2 line-clamp-2">
						{story.description}
					</p>

					{story.status === "rejected" && story.reviewNotes && (
						<div className="mt-3">
							<button
								type="button"
								onClick={() => setExpanded(!expanded)}
								className="flex items-center gap-1 text-xs text-[var(--error)] hover:underline"
							>
								{expanded ? (
									<ChevronUp size={12} />
								) : (
									<ChevronDown size={12} />
								)}
								Review feedback
							</button>
							{expanded && (
								<div className="mt-2 p-3 bg-red-50 rounded-lg text-xs text-red-700">
									{story.reviewNotes}
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
