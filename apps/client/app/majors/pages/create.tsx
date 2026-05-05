import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { createFileRoute } from "@tanstack/react-router";
import { MajorForm } from "@/app/majors/components/form/major-form";
import { CreateMajorSkeleton } from "@/app/majors/components/loading/create-major-skeleton";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/admin/majors/create")({
	pendingComponent: CreateMajorSkeleton,
	head: () => ({
		meta: [
			{
				title: m.majors_create_page_title(),
			},
			{
				name: "description",
				content: m.majors_create_page_description(),
			},
			{
				property: "og:title",
				content: m.majors_create_page_title(),
			},
			{
				property: "og:description",
				content: m.majors_create_page_description(),
			},
		],
	}),
	component: CreateMajorPage,
});

function CreateMajorPage() {
	return (
		<Main>
			<PageHeader
				title={m.majors_create_title()}
				description={m.majors_create_description()}
				withSeparator
			/>
			<MajorForm />
		</Main>
	);
}
