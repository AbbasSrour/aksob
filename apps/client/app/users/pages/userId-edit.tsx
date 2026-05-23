import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { Button } from "@aksob/ui/core/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { UserForm } from "@/app/users/components/form/user-form.tsx";
import { EditUserSkeleton } from "@/app/users/components/loading/edit-user-skeleton.tsx";
import { userQueries } from "@/app/users/hooks/api/users.queries.ts";
import { userToFormValues } from "@/app/users/utils/user-form-transformer.ts";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/admin/users/$userId/edit")({
	pendingComponent: EditUserSkeleton,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			userQueries.single(params.userId),
		);
	},
	head: () => ({
		meta: [
			{
				title: m.users_edit_page_title(),
			},
			{
				name: "description",
				content: m.users_edit_page_description(),
			},
			{
				property: "og:title",
				content: m.users_edit_page_title(),
			},
			{
				property: "og:description",
				content: m.users_edit_page_description(),
			},
		],
	}),
	component: EditUserPage,
});

function EditUserPage() {
	const params = Route.useParams();
	const userId = params.userId;
	const { data: user } = useSuspenseQuery(userQueries.single(userId));

	const defaultValues = userToFormValues(user);

	if (!user) {
		return <div>{m.users_not_found()}</div>;
	}

	return (
		<Main>
			<PageHeader
				title={m.users_edit_title({ name: user.name })}
				description={m.users_edit_description()}
				withSeparator
			>
				<Link
					to="/admin/users"
					search={{ search: "", page: 1, pageSize: 10, role: undefined }}
				>
					<Button variant="ghost">{m.users_edit_back_button()}</Button>
				</Link>
			</PageHeader>
			<UserForm userId={userId} defaultValues={defaultValues} />
		</Main>
	);
}
