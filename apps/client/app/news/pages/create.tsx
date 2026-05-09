import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { Button } from "@aksob/ui/core/button";
import { IconArrowLeft } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { NewsForm } from "@/app/news/components/form/news-form";
import { NewsFormSkeleton } from "@/app/news/components/loading/news-form-skeleton";

export const Route = createFileRoute("/admin/news/create")({
	pendingComponent: NewsFormSkeleton,
	head: () => ({
		meta: [
			{ title: "Create Article - AKSOB" },
			{
				name: "description",
				content: "Create a new news article.",
			},
			{ property: "og:title", content: "Create Article - AKSOB" },
			{
				property: "og:description",
				content: "Create a new news article.",
			},
		],
	}),
	component: CreateNewsPage,
});

function CreateNewsPage() {
	return (
		<Main className={"pb-0"}>
			<PageHeader
				title="Create Article"
				description="Write and publish a new news article."
				withSeparator
			>
				<Link to="/admin/news">
					<Button variant="ghost" className="gap-2">
						<IconArrowLeft size={16} />
						Back to Articles
					</Button>
				</Link>
			</PageHeader>
			<NewsForm />
		</Main>
	);
}
