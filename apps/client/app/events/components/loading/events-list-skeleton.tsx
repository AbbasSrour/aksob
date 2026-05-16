import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { Button } from "@aksob/ui/core/button";
import { Skeleton } from "@aksob/ui/core/skeleton";
import { IconPlus } from "@tabler/icons-react";

export function EventsListSkeleton() {
	return (
		<Main>
			<PageHeader title="Events" description="Manage events.">
				<Button disabled className="gap-1.5">
					<IconPlus size={16} />
					<span>Create Event</span>
				</Button>
			</PageHeader>
			<div className="space-y-2 px-4">
				<Skeleton className="h-10 w-full max-w-sm" />
				<Skeleton className="h-72 w-full" />
			</div>
		</Main>
	);
}
