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
import { ResearchForm } from "@/app/research/components/form/research-form";
import { EditResearchSkeleton } from "@/app/research/components/loading/edit-research-skeleton";
import { researchQueries } from "@/app/research/hooks/api/research.queries";
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
		label: m.research_status_pending(),
		icon: IconCircleDashed,
		bg: "bg-amber-50",
		text: "text-amber-700",
		ring: "ring-amber-200",
	},
	approved: {
		label: m.research_status_approved(),
		icon: IconCircleCheck,
		bg: "bg-emerald-50",
		text: "text-emerald-700",
		ring: "ring-emerald-200",
	},
	rejected: {
		label: m.research_status_rejected(),
		icon: IconCircleX,
		bg: "bg-rose-50",
		text: "text-rose-700",
		ring: "ring-rose-200",
	},
};

export const Route = createFileRoute("/admin/research/$researchId/edit")({
	pendingComponent: EditResearchSkeleton,
	loaderDeps: ({ params }) => params,
	loader: async ({ context, deps }) => {
		await context.queryClient.ensureQueryData(
			researchQueries.single(deps.researchId),
		);
	},
	head: () => ({
		meta: [
			{ title: m.research_edit_page_title() },
			{
				name: "description",
				content: m.research_edit_description(),
			},
			{ property: "og:title", content: m.research_edit_page_title() },
			{
				property: "og:description",
				content: m.research_edit_description(),
			},
		],
	}),
	component: EditResearchPage,
});

function EditResearchPage() {
	const { researchId } = Route.useParams();
	const { data } = useSuspenseQuery(researchQueries.single(researchId));
	const statusVisual = statusVisuals[data.status];

	return (
		<Main>
			<PageHeader
				title={m.research_edit_title()}
				description={m.research_edit_description()}
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
					<Link to="/admin/research">
						<Button variant="ghost" className="gap-2">
							<IconArrowLeft size={16} />
							{m.research_form_back_button()}
						</Button>
					</Link>
				</div>
			</PageHeader>
			<ResearchForm researchId={researchId} existingResearch={data} />
		</Main>
	);
}
