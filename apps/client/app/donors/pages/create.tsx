import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { Button } from "@aksob/ui/core/button";
import { IconArrowLeft } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { DonorForm } from "@/app/donors/components/form/donor-form";
import { DonorFormSkeleton } from "@/app/donors/components/loading/donor-form-skeleton";

export const Route = createFileRoute("/admin/donors/create")({
	pendingComponent: DonorFormSkeleton,
	head: () => ({
		meta: [
			{ title: "Add Donor - AKSOB" },
			{
				name: "description",
				content: "Add a donor to the Wall of Giving.",
			},
		],
	}),
	component: CreateDonorPage,
});

function CreateDonorPage() {
	return (
		<Main>
			<PageHeader
				title="Add Donor"
				description="Add a supporter to the Wall of Giving."
				withSeparator
			>
				<Link to="/admin/donors">
					<Button variant="ghost" className="gap-2">
						<IconArrowLeft size={16} />
						Back to Donors
					</Button>
				</Link>
			</PageHeader>
			<DonorForm />
		</Main>
	);
}
