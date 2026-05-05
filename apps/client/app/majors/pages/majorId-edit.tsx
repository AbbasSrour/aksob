import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { Button } from "@aksob/ui/core/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MajorForm } from "@/app/majors/components/form/major-form";
import { EditMajorSkeleton } from "@/app/majors/components/loading/edit-major-skeleton";
import { majorQueries } from "@/app/majors/hooks/api/majors.queries";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/admin/majors/$majorId/edit")({
	pendingComponent: EditMajorSkeleton,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			majorQueries.single(params.majorId),
		);
	},
	head: () => ({
		meta: [
			{
				title: m.majors_edit_page_title(),
			},
			{
				name: "description",
				content: m.majors_edit_page_description(),
			},
			{
				property: "og:title",
				content: m.majors_edit_page_title(),
			},
			{
				property: "og:description",
				content: m.majors_edit_page_description(),
			},
		],
	}),
	component: EditMajorPage,
});

function EditMajorPage() {
	const params = Route.useParams();
	const majorId = params.majorId;
	const { data: major } = useSuspenseQuery(majorQueries.single(majorId));

	if (!major) {
		return <div>{m.majors_not_found()}</div>;
	}

	const defaultValues = {
		name: major.name,
		description: major.description ?? "",
		credits: major.credits ?? 0,
		duration: major.duration ?? 4,
	};

	return (
		<Main>
			<PageHeader
				title={m.majors_edit_title({ name: major.name })}
				description={m.majors_edit_description()}
				withSeparator
			>
				<Link to="/admin/majors">
					<Button variant="ghost">{m.majors_edit_back_button()}</Button>
				</Link>
			</PageHeader>
			<MajorForm majorId={majorId} defaultValues={defaultValues} />
		</Main>
	);
}
