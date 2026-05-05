import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { Button } from "@aksob/ui/core/button";
import { IconArrowLeft } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { OpportunityForm } from "@/app/opportunities/components/form/opportunity-form";
import { OpportunitiesFormSkeleton } from "@/app/opportunities/components/loading/opportunities-form-skeleton";

export const Route = createFileRoute("/admin/opportunities/create")({
	pendingComponent: OpportunitiesFormSkeleton,
	head: () => ({
		meta: [
			{ title: "Create Opportunity" },
			{
				name: "description",
				content: "Create a new job or internship opportunity",
			},
		],
	}),
	component: CreateOpportunityPage,
});

function CreateOpportunityPage() {
	return (
		<Main className={"pb-0"}>
			<PageHeader
				title="Create Opportunity"
				description="Add a new job or internship opportunity."
				withSeparator
			>
				<Link to="/admin/opportunities">
					<Button variant="ghost" className="gap-2">
						<IconArrowLeft size={16} />
						Back
					</Button>
				</Link>
			</PageHeader>
			<OpportunityForm />
		</Main>
	);
}
