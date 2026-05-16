import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { Button } from "@aksob/ui/core/button";
import { IconArrowLeft } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EventForm } from "@/app/events/components/form/event-form";
import { CreateEventSkeleton } from "@/app/events/components/loading/create-event-skeleton";

export const Route = createFileRoute("/admin/events/create")({
	pendingComponent: CreateEventSkeleton,
	head: () => ({
		meta: [
			{ title: "Create Event" },
			{ name: "description", content: "Create a new event." },
		],
	}),
	component: CreateEventPage,
});

function CreateEventPage() {
	return (
		<Main>
			<PageHeader
				title="Create Event"
				description="Set up a new event for the community."
				withSeparator
			>
				<Link to="/admin/events">
					<Button variant="ghost" className="gap-2">
						<IconArrowLeft size={16} />
						Back to Events
					</Button>
				</Link>
			</PageHeader>
			<EventForm />
		</Main>
	);
}
