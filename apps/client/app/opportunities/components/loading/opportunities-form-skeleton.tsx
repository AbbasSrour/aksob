import { Main } from "@aksob/ui/components/layout/main";
import { Skeleton } from "@aksob/ui/core/skeleton";

export function OpportunitiesFormSkeleton() {
	return (
		<Main>
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<Skeleton className="h-8 w-48" />
						<Skeleton className="mt-2 h-4 w-72" />
					</div>
					<Skeleton className="h-10 w-32" />
				</div>
				<div className="space-y-4">
					<Skeleton className="h-11 w-64" />
					<Skeleton className="h-11 w-full" />
					<Skeleton className="h-11 w-full" />
					<Skeleton className="h-11 w-full" />
				</div>
			</div>
		</Main>
	);
}
