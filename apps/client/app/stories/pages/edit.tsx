import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { Button } from "@aksob/ui/core/button";
import { cn } from "@aksob/ui/lib/utils";
import {
	IconArrowLeft,
	IconCalendar,
	IconCircleCheck,
	IconCircleDashed,
	IconCircleX,
	IconPencil,
} from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { StoryForm } from "@/app/stories/components/form/story-form";
import type { StoryFormSchema } from "@/app/stories/components/form/story-form-schema";
import { StoriesFormSkeleton } from "@/app/stories/components/loading/stories-form-skeleton";
import { storyQueries } from "@/app/stories/hooks/api/stories.queries";
import { m } from "@/paraglide/messages";

const statusVisuals: Record<
	string,
	{
		label: string;
		icon: React.ElementType;
		bg: string;
		text: string;
		ring: string;
	}
> = {
	pending: {
		label: m.stories_status_pending(),
		icon: IconCircleDashed,
		bg: "bg-amber-50",
		text: "text-amber-700",
		ring: "ring-amber-200",
	},
	approved: {
		label: m.stories_status_approved(),
		icon: IconCircleCheck,
		bg: "bg-emerald-50",
		text: "text-emerald-700",
		ring: "ring-emerald-200",
	},
	rejected: {
		label: m.stories_status_rejected(),
		icon: IconCircleX,
		bg: "bg-rose-50",
		text: "text-rose-700",
		ring: "ring-rose-200",
	},
};

function toDateInputValue(value: string | number | Date) {
	if (value instanceof Date) {
		return value.toISOString().slice(0, 10);
	}

	if (typeof value === "number") {
		return new Date(value).toISOString().slice(0, 10);
	}

	return value.slice(0, 10);
}

export const Route = createFileRoute("/admin/stories/$storyId/edit")({
	pendingComponent: StoriesFormSkeleton,
	loaderDeps: ({ params }) => params,
	loader: async ({ context, deps }) => {
		await context.queryClient.ensureQueryData(
			storyQueries.single(deps.storyId),
		);
	},
	head: () => ({
		meta: [
			{ title: m.stories_edit_page_title() },
			{ name: "description", content: m.stories_edit_description() },
			{ property: "og:title", content: m.stories_edit_page_title() },
			{ property: "og:description", content: m.stories_edit_description() },
		],
	}),
	component: EditStoryPage,
});

function storyToFormValues(story: {
	title: string;
	description: string;
	content: string;
	coverImage: string | null;
	thumbnailImage: string | null;
	category: string;
	storyDate: string | number | Date;
	author: { id: string };
}): StoryFormSchema {
	return {
		title: story.title,
		description: story.description,
		content: story.content,
		coverImage: story.coverImage ?? "",
		thumbnailImage: story.thumbnailImage ?? "",
		category: story.category as StoryFormSchema["category"],
		storyDate: toDateInputValue(story.storyDate),
		authorId: story.author.id,
	};
}

function EditStoryPage() {
	const { storyId } = Route.useParams();
	const { data } = useSuspenseQuery(storyQueries.single(storyId));
	const statusVisual = statusVisuals[data.status];

	return (
		<Main>
			<PageHeader
				title={m.stories_edit_title()}
				description={m.stories_edit_description()}
				withSeparator
			>
				<div className="flex flex-wrap items-center gap-2">
					{statusVisual && (
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
					)}
					<span className="hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border sm:flex">
						<IconCalendar size={12} />
						Story {toDateInputValue(data.storyDate)}
					</span>
					<span className="hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border sm:flex">
						<IconPencil size={12} />
						Edited{" "}
						{new Date(data.updatedAt).toLocaleDateString(undefined, {
							month: "short",
							day: "numeric",
							year: "numeric",
						})}
					</span>
					<Link to="/admin/stories">
						<Button variant="ghost" className="gap-2">
							<IconArrowLeft size={16} />
							{m.stories_form_back_button()}
						</Button>
					</Link>
				</div>
			</PageHeader>
			<StoryForm
				storyId={storyId}
				existingStory={data}
				defaultValues={storyToFormValues(data)}
			/>
		</Main>
	);
}
