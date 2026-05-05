import { Main } from "@aksob/ui/components/layout/main";
import { Skeleton } from "@aksob/ui/core/skeleton";

export function OpportunitiesListSkeleton() {
	return (
		<Main>
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<Skeleton className="h-8 w-48" />
						<Skeleton className="mt-2 h-4 w-72" />
					</div>
					<Skeleton className="h-10 w-32" />
				</div>
				<div className="space-y-2">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-12 w-full" />
					<Skeleton className="h-12 w-full" />
					<Skeleton className="h-12 w-full" />
				</div>
			</div>
		</Main>
	);
}
