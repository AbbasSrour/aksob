import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { Button } from "@aksob/ui/core/button";
import { IconArrowLeft } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { DonorForm } from "@/app/donors/components/form/donor-form";
import type { DonorFormSchema } from "@/app/donors/components/form/donor-form-schema";
import { DonorFormSkeleton } from "@/app/donors/components/loading/donor-form-skeleton";
import type { Donor } from "@/app/donors/hooks/api/donors.functions";
import { donorQueries } from "@/app/donors/hooks/api/donors.queries";

function toFormValues(donor: Donor): DonorFormSchema {
	return {
		name: donor.name,
		position: donor.position,
		company: donor.company,
		donationAmount:
			donor.donationAmount !== null && donor.donationAmount !== undefined
				? String(donor.donationAmount)
				: "",
		message: donor.message ?? "",
		image: donor.image ?? "",
	};
}

export const Route = createFileRoute("/admin/donors/$donorId/edit")({
	pendingComponent: DonorFormSkeleton,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			donorQueries.single(params.donorId),
		);
	},
	head: () => ({
		meta: [
			{ title: "Edit Donor - AKSOB" },
			{
				name: "description",
				content: "Edit a donor on the Wall of Giving.",
			},
		],
	}),
	component: EditDonorPage,
});

function EditDonorPage() {
	const { donorId } = Route.useParams();
	const { data } = useSuspenseQuery(donorQueries.single(donorId));

	return (
		<Main>
			<PageHeader
				title={`Edit ${data.name}`}
				description="Update donor information for the Wall of Giving."
				withSeparator
			>
				<Link to="/admin/donors">
					<Button variant="ghost" className="gap-2">
						<IconArrowLeft size={16} /> Back to Donors
					</Button>
				</Link>
			</PageHeader>
			<DonorForm donorId={donorId} defaultValues={toFormValues(data)} />
		</Main>
	);
}
