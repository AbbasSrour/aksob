import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { createFileRoute } from "@tanstack/react-router";
import { StoryForm } from "@/app/stories/components/form/story-form";
import { StoriesFormSkeleton } from "@/app/stories/components/loading/stories-form-skeleton";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/admin/stories/create")({
	pendingComponent: StoriesFormSkeleton,
	head: () => ({
		meta: [
			{ title: m.stories_create_page_title() },
			{ name: "description", content: m.stories_create_description() },
			{ property: "og:title", content: m.stories_create_page_title() },
			{ property: "og:description", content: m.stories_create_description() },
		],
	}),
	component: CreateStoryPage,
});

function CreateStoryPage() {
	return (
		<Main className="h-[calc(100vh-4rem)] overflow-hidden">
			<PageHeader
				title={m.stories_create_title()}
				description={m.stories_create_description()}
			/>
			<StoryForm />
		</Main>
	);
}
