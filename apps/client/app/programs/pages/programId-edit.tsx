import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { Button } from "@aksob/ui/core/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ProgramForm } from "@/app/programs/components/form/program-form";
import { EditProgramSkeleton } from "@/app/programs/components/loading/edit-program-skeleton";
import { programQueries } from "@/app/programs/hooks/api/programs.queries";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/admin/programs/$programId/edit")({
	pendingComponent: EditProgramSkeleton,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			programQueries.single(params.programId),
		);
	},
	head: () => ({
		meta: [
			{
				title: m.programs_edit_page_title(),
			},
			{
				name: "description",
				content: m.programs_edit_page_description(),
			},
			{
				property: "og:title",
				content: m.programs_edit_page_title(),
			},
			{
				property: "og:description",
				content: m.programs_edit_page_description(),
			},
		],
	}),
	component: EditProgramPage,
});

function EditProgramPage() {
	const params = Route.useParams();
	const programId = params.programId;
	const { data: program } = useSuspenseQuery(programQueries.single(programId));

	if (!program) {
		return <div>{m.programs_not_found()}</div>;
	}

	const defaultValues = {
		name: program.name,
		description: program.description ?? "",
		credits: program.credits ?? 0,
		duration: program.duration ?? 4,
		level: program.level ?? "",
	};

	return (
		<Main>
			<PageHeader
				title={m.programs_edit_title({ name: program.name })}
				description={m.programs_edit_description()}
				withSeparator
			>
				<Link to="/admin/programs">
					<Button variant="ghost">{m.programs_edit_back_button()}</Button>
				</Link>
			</PageHeader>
			<ProgramForm programId={programId} defaultValues={defaultValues} />
		</Main>
	);
}
