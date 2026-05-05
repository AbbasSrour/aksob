import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { Button } from "@aksob/ui/core/button";
import { cn } from "@aksob/ui/lib/utils";
import {
	IconArrowLeft,
	IconCircleCheck,
	IconCircleDashed,
	IconCircleX,
	IconPencil,
} from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { OpportunityForm } from "@/app/opportunities/components/form/opportunity-form";
import type { OpportunityFormSchema } from "@/app/opportunities/components/form/opportunity-form-schema";
import { OpportunitiesFormSkeleton } from "@/app/opportunities/components/loading/opportunities-form-skeleton";
import { opportunityQueries } from "@/app/opportunities/hooks/api/opportunities.queries";

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
		label: "Pending",
		icon: IconCircleDashed,
		bg: "bg-amber-50",
		text: "text-amber-700",
		ring: "ring-amber-200",
	},
	approved: {
		label: "Approved",
		icon: IconCircleCheck,
		bg: "bg-emerald-50",
		text: "text-emerald-700",
		ring: "ring-emerald-200",
	},
	rejected: {
		label: "Rejected",
		icon: IconCircleX,
		bg: "bg-rose-50",
		text: "text-rose-700",
		ring: "ring-rose-200",
	},
};

export const Route = createFileRoute(
	"/admin/opportunities/$opportunityId/edit",
)({
	pendingComponent: OpportunitiesFormSkeleton,
	loaderDeps: ({ params }) => params,
	loader: async ({ context, deps }) => {
		await context.queryClient.ensureQueryData(
			opportunityQueries.single(deps.opportunityId),
		);
	},
	head: () => ({
		meta: [
			{ title: "Edit Opportunity" },
			{ name: "description", content: "Edit an existing opportunity" },
		],
	}),
	component: EditOpportunityPage,
});

function opportunityToFormValues(opportunity: {
	type: string;
	company: string;
	contactEmail: string | null;
	applyUrl: string | null;
}): OpportunityFormSchema {
	return {
		type: opportunity.type as OpportunityFormSchema["type"],
		company: opportunity.company,
		contactEmail: opportunity.contactEmail ?? "",
		applyUrl: opportunity.applyUrl ?? "",
	};
}

function EditOpportunityPage() {
	const { opportunityId } = Route.useParams();
	const { data } = useSuspenseQuery(opportunityQueries.single(opportunityId));
	const statusVisual = statusVisuals[data.status];

	return (
		<Main>
			<PageHeader
				title="Edit Opportunity"
				description="Update the details of this opportunity."
				withSeparator
			>
				<div className="flex items-center gap-3">
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
					<span className="hidden items-center gap-1.5 text-xs text-muted-foreground/60 sm:flex">
						<IconPencil size={12} />
						Edited{" "}
						{new Date(data.updatedAt).toLocaleDateString(undefined, {
							month: "short",
							day: "numeric",
							year: "numeric",
						})}
					</span>
					<Link to="/admin/opportunities">
						<Button variant="ghost" className="gap-2">
							<IconArrowLeft size={16} />
							Back
						</Button>
					</Link>
				</div>
			</PageHeader>
			<OpportunityForm
				opportunityId={opportunityId}
				existingOpportunity={data}
				defaultValues={opportunityToFormValues(data)}
			/>
		</Main>
	);
}
