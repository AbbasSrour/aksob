import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { Button } from "@aksob/ui/core/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MemberForm } from "@/app/members/components/form/member-form";
import { EditMemberSkeleton } from "@/app/members/components/loading/edit-member-skeleton";
import { memberQueries } from "@/app/members/hooks/api/members.queries";
import { memberToFormValues } from "@/app/members/utils/member-form-transformer";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/admin/members/$memberId/edit")({
	pendingComponent: EditMemberSkeleton,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			memberQueries.single(params.memberId),
		);
	},
	head: () => ({
		meta: [
			{
				title: m.members_edit_page_title(),
			},
			{
				name: "description",
				content: m.members_edit_page_description(),
			},
			{
				property: "og:title",
				content: m.members_edit_page_title(),
			},
			{
				property: "og:description",
				content: m.members_edit_page_description(),
			},
		],
	}),
	component: EditMemberPage,
});

function EditMemberPage() {
	const params = Route.useParams();
	const memberId = params.memberId;
	const { data: user } = useSuspenseQuery(memberQueries.single(memberId));

	const defaultValues = memberToFormValues(user);

	if (!user) {
		return <div>{m.members_not_found()}</div>;
	}

	return (
		<Main>
			<PageHeader
				title={m.members_edit_title({ name: user.name })}
				description={m.members_edit_description()}
				withSeparator
			>
				<Link
					to="/admin/members"
					search={{ search: "", page: 1, pageSize: 10 }}
				>
					<Button variant="ghost">{m.members_edit_back_button()}</Button>
				</Link>
			</PageHeader>
			<MemberForm memberId={memberId} defaultValues={defaultValues} />
		</Main>
	);
}
