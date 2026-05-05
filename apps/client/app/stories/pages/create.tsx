import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { Button } from "@aksob/ui/core/button";
import { IconArrowLeft } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
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
		<Main className={"pb-0"}>
			<PageHeader
				title={m.stories_create_title()}
				description={m.stories_create_description()}
				withSeparator
			>
				<Link to="/admin/stories">
					<Button variant="ghost" className="gap-2">
						<IconArrowLeft size={16} />
						{m.stories_form_back_button()}
					</Button>
				</Link>
			</PageHeader>
			<StoryForm />
		</Main>
	);
}
