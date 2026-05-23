import { ListSection } from "@aksob/ui/components/layout/list-section";
import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { ButtonSkeleton } from "@aksob/ui/components/skeleton/button-skeleton";
import { PaginationSkeleton } from "@aksob/ui/components/skeleton/pagination-skeleton";
import { TableSkeleton } from "@aksob/ui/components/skeleton/table-skeleton";

export function DonorsListSkeleton() {
	return (
		<Main>
			<PageHeader
				title="Donors"
				description="Manage the Wall of Giving on the public website."
			>
				<ButtonSkeleton className="h-9 w-28" />
			</PageHeader>

			<ListSection>
				<div className="flex items-center justify-end">
					<ButtonSkeleton className="h-8 w-24" />
				</div>
				<TableSkeleton columns={5} rows={10} rowClassName="h-14" />
				<PaginationSkeleton />
			</ListSection>
		</Main>
	);
}
