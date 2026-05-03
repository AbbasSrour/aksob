import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { StoryForm } from "@/app/stories/components/form/story-form";
import type { StoryFormSchema } from "@/app/stories/components/form/story-form-schema";
import { StoriesFormSkeleton } from "@/app/stories/components/loading/stories-form-skeleton";
import { storyQueries } from "@/app/stories/hooks/api/stories.queries";
import { m } from "@/paraglide/messages";

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
	category: string;
	storyDate: string | null;
}): StoryFormSchema {
	return {
		title: story.title,
		description: story.description,
		content: story.content,
		category: story.category as StoryFormSchema["category"],
		storyDate: story.storyDate ?? "",
		authorId: "",
	};
}

function EditStoryPage() {
	const { storyId } = Route.useParams();
	const { data } = useSuspenseQuery(storyQueries.single(storyId));

	return (
		<Main className="h-[calc(100vh-4rem)] overflow-hidden">
			<PageHeader
				title={m.stories_edit_title()}
				description={m.stories_edit_description()}
			/>
			<StoryForm
				storyId={storyId}
				existingStory={data}
				defaultValues={storyToFormValues(data)}
			/>
		</Main>
	);
}
