import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { createFileRoute } from "@tanstack/react-router";
import { UserForm } from "@/app/users/components/form/user-form.tsx";
import { CreateUserSkeleton } from "@/app/users/components/loading/create-user-skeleton.tsx";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/admin/users/create")({
	pendingComponent: CreateUserSkeleton,
	head: () => ({
		meta: [
			{
				title: m.users_create_page_title(),
			},
			{
				name: "description",
				content: m.users_create_description(),
			},
			{
				property: "og:title",
				content: m.users_create_page_title(),
			},
			{
				property: "og:description",
				content: m.users_create_description(),
			},
		],
	}),
	component: CreateUserPage,
});

function CreateUserPage() {
	// const s = true;
	const s = false;
	if (s) {
		return <CreateUserSkeleton />;
	}

	return (
		<Main>
			<PageHeader
				title={m.users_create_title()}
				description={m.users_create_description()}
				withSeparator
			/>
			<UserForm />
		</Main>
	);
}