import { ListSection } from "@aksob/ui/components/layout/list-section";
import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { ActionsSkeleton } from "@aksob/ui/components/skeleton/actions-skeleton";
import { ButtonSkeleton } from "@aksob/ui/components/skeleton/button-skeleton";
import { FilterChipSkeleton } from "@aksob/ui/components/skeleton/filter-chip-skeleton";
import { FiltersSkeleton } from "@aksob/ui/components/skeleton/filters-skeleton";
import { PaginationSkeleton } from "@aksob/ui/components/skeleton/pagination-skeleton";
import { TableSkeleton } from "@aksob/ui/components/skeleton/table-skeleton";
import { ToolbarSkeleton } from "@aksob/ui/components/skeleton/toolbar-skeleton";

export function NewsListSkeleton() {
	return (
		<Main>
			<PageHeader
				title="News Articles"
				description="Create and manage news articles for the public website."
			/>

			<ListSection>
				<ToolbarSkeleton>
					<FiltersSkeleton>
						<FilterChipSkeleton />
					</FiltersSkeleton>
					<ActionsSkeleton>
						<ButtonSkeleton className="h-8 w-20" />
					</ActionsSkeleton>
				</ToolbarSkeleton>

				<TableSkeleton columns={7} rows={10} rowClassName="h-14" />
				<PaginationSkeleton />
			</ListSection>
		</Main>
	);
}
