import { ListSection } from "@aksob/ui/components/layout/list-section";
import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { ButtonSkeleton } from "@aksob/ui/components/skeleton/button-skeleton";
import { FilterChipSkeleton } from "@aksob/ui/components/skeleton/filter-chip-skeleton";
import { FiltersSkeleton } from "@aksob/ui/components/skeleton/filters-skeleton";
import { PaginationSkeleton } from "@aksob/ui/components/skeleton/pagination-skeleton";
import { TableSkeleton } from "@aksob/ui/components/skeleton/table-skeleton";
import { ToolbarSkeleton } from "@aksob/ui/components/skeleton/toolbar-skeleton";

export function ResearchListSkeleton() {
	return (
		<Main>
			<PageHeader
					title="Research Programs"
					description="Manage research programs and postings."
			>
				<ButtonSkeleton className="h-9 w-28" />
			</PageHeader>

			<ListSection>
				<ToolbarSkeleton>
					<FiltersSkeleton>
						<FilterChipSkeleton />
						<FilterChipSkeleton />
					</FiltersSkeleton>
				</ToolbarSkeleton>

				<TableSkeleton columns={5} rows={10} rowClassName="h-14" />
				<PaginationSkeleton />
			</ListSection>
		</Main>
	);
}
