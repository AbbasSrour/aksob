import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { Button } from "@aksob/ui/core/button";
import { IconArrowLeft } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ResearchForm } from "@/app/research/components/form/research-form";
import { CreateResearchSkeleton } from "@/app/research/components/loading/create-research-skeleton";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/admin/research/create")({
	pendingComponent: CreateResearchSkeleton,
	head: () => ({
		meta: [
			{ title: m.research_create_page_title() },
			{
				name: "description",
				content: m.research_create_description(),
			},
			{ property: "og:title", content: m.research_create_page_title() },
			{
				property: "og:description",
				content: m.research_create_description(),
			},
		],
	}),
	component: CreateResearchPage,
});

function CreateResearchPage() {
	return (
		<Main className={"pb-0"}>
			<PageHeader
				title={m.research_create_title()}
				description={m.research_create_description()}
				withSeparator
			>
				<Link to="/admin/research">
					<Button variant="ghost" className="gap-2">
						<IconArrowLeft size={16} />
						{m.research_form_back_button()}
					</Button>
				</Link>
			</PageHeader>
			<ResearchForm />
		</Main>
	);
}
