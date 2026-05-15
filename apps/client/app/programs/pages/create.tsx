import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { createFileRoute } from "@tanstack/react-router";
import { ProgramForm } from "@/app/programs/components/form/program-form";
import { CreateProgramSkeleton } from "@/app/programs/components/loading/create-program-skeleton";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/admin/programs/create")({
	pendingComponent: CreateProgramSkeleton,
	head: () => ({
		meta: [
			{
				title: m.programs_create_page_title(),
			},
			{
				name: "description",
				content: m.programs_create_page_description(),
			},
			{
				property: "og:title",
				content: m.programs_create_page_title(),
			},
			{
				property: "og:description",
				content: m.programs_create_page_description(),
			},
		],
	}),
	component: CreateProgramPage,
});

function CreateProgramPage() {
	return (
		<Main>
			<PageHeader
				title={m.programs_create_title()}
				description={m.programs_create_description()}
				withSeparator
			/>
			<ProgramForm />
		</Main>
	);
}
