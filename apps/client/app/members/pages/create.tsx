import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { createFileRoute } from "@tanstack/react-router";
import { MemberForm } from "@/app/members/components/form/member-form";
import { CreateMemberSkeleton } from "@/app/members/components/loading/create-member-skeleton";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/admin/members/create")({
	pendingComponent: CreateMemberSkeleton,
	head: () => ({
		meta: [
			{
				title: m.members_create_page_title(),
			},
			{
				name: "description",
				content: m.members_create_description(),
			},
			{
				property: "og:title",
				content: m.members_create_page_title(),
			},
			{
				property: "og:description",
				content: m.members_create_description(),
			},
		],
	}),
	component: CreateMemberPage,
});

function CreateMemberPage() {
	return (
		<Main>
			<PageHeader
				title={m.members_create_title()}
				description={m.members_create_description()}
				withSeparator
			/>
			<MemberForm />
		</Main>
	);
}
