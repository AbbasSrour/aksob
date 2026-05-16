import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	BookOpen,
	ChevronDown,
	ChevronUp,
	Clock,
	FileText,
	Loader2,
	Plus,
	X,
} from "lucide-react";
import { useState } from "react";
import { createStory, listMyStories, type StoryItem } from "~/app/lib/users";
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

const STORY_CATEGORIES = [
	"alumni_success",
	"student_spotlight",
	"faculty_research",
	"community",
	"career",
	"other",
];

interface Props {
	userId: string;
}

export function StoriesSection({ userId }: Props) {
	const queryClient = useQueryClient();
	const [showCreate, setShowCreate] = useState(false);

	const { data, isLoading } = useQuery({
		queryKey: ["my-stories", userId],
		queryFn: () => listMyStories(userId).then((r) => r.data),
	});

	const createMutation = useMutation({
		mutationFn: createStory,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["my-stories", userId] });
			setShowCreate(false);
		},
	});

	const stories = data ?? [];

	return (
		<div className="space-y-4">
			{/* Create button */}
			<div className="flex justify-end">
				<Button
					variant="primary"
					size="sm"
					onClick={() => setShowCreate(true)}
					leftIcon={<Plus size={14} />}
				>
					Create Story
				</Button>
			</div>

			{/* Create form */}
			{showCreate && (
				<CreateStoryForm
					onSubmit={(params) => createMutation.mutate(params)}
					onCancel={() => setShowCreate(false)}
					isLoading={createMutation.isPending}
					error={
						createMutation.error
							? (createMutation.error as Error).message
							: null
					}
				/>
			)}

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

function CreateStoryForm({
	onSubmit,
	onCancel,
	isLoading,
	error,
}: {
	onSubmit: (params: {
		title: string;
		description: string;
		content: string;
		category: string;
		storyDate: string;
	}) => void;
	onCancel: () => void;
	isLoading: boolean;
	error: string | null;
}) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [content, setContent] = useState("");
	const [category, setCategory] = useState(STORY_CATEGORIES[0]);
	const [storyDate, setStoryDate] = useState(
		new Date().toISOString().split("T")[0],
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim() || !description.trim() || !content.trim()) return;
		onSubmit({
			title: title.trim(),
			description: description.trim(),
			content: content.trim(),
			category,
			storyDate,
		});
	};

	const inputClass =
		"w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:ring-2 focus:ring-[var(--aksob-primary)]/20 focus:border-[var(--aksob-primary)] transition";
	const textareaClass =
		"w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-[var(--aksob-primary)]/20 focus:border-[var(--aksob-primary)] transition resize-none";

	return (
		<div className="p-5 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-sm font-semibold text-gray-900">Create Story</h3>
				<button
					type="button"
					onClick={onCancel}
					className="text-gray-400 hover:text-gray-600"
				>
					<X size={16} />
				</button>
			</div>
			<form onSubmit={handleSubmit} className="space-y-3">
				<input
					className={inputClass}
					placeholder="Title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					required
				/>
				<textarea
					className={textareaClass}
					rows={2}
					placeholder="Short description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					required
				/>
				<textarea
					className={textareaClass}
					rows={4}
					placeholder="Full story content"
					value={content}
					onChange={(e) => setContent(e.target.value)}
					required
				/>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<select
						className={inputClass}
						value={category}
						onChange={(e) => setCategory(e.target.value)}
					>
						{STORY_CATEGORIES.map((c) => (
							<option key={c} value={c}>
								{c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
							</option>
						))}
					</select>
					<input
						className={inputClass}
						type="date"
						value={storyDate}
						onChange={(e) => setStoryDate(e.target.value)}
						required
					/>
				</div>
				{error ? <p className="text-xs text-red-600">{error}</p> : null}
				<div className="flex gap-2 justify-end">
					<Button
						variant="ghost"
						size="sm"
						type="button"
						onClick={onCancel}
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						size="sm"
						type="submit"
						isLoading={isLoading}
					>
						Submit for Review
					</Button>
				</div>
			</form>
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
						<div>
							<h4 className="text-sm font-semibold text-gray-900">
								{story.title}
							</h4>
							<div className="flex items-center gap-2 mt-0.5 flex-wrap">
								<Badge variant="default" className="text-[10px] px-1.5 py-0.5">
									{story.category.replace(/_/g, " ")}
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
								{expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
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
