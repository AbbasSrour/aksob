import { DataTable } from '@aksob/ui/components/data-table/data-table';
import { DataTableFacetedFilter } from '@aksob/ui/components/data-table/data-table-faceted-filter';
import { DataTablePagination } from '@aksob/ui/components/data-table/data-table-pagination';
import { DataTableProvider } from '@aksob/ui/components/data-table/data-table-provider';
import {
  DataTableToolbar,
  DataTableToolbarActions,
  DataTableToolbarFilters,
} from '@aksob/ui/components/data-table/data-table-toolbar';
import { DataTableViewOptions } from '@aksob/ui/components/data-table/data-table-view-options';
import { ListSection } from '@aksob/ui/components/layout/list-section';
import { usePagination } from '@aksob/ui/hooks/pagination';
import { useSearch } from '@aksob/ui/hooks/search';
import { useSort } from '@aksob/ui/hooks/sort';
import { useFilters } from '@aksob/ui/hooks/use-filters';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { userDataTableColumns } from '@/app/users/components/list/user-data-table-columns';
import type { AdminUser } from '@/app/users/hooks/api/users.functions.ts';
import { userQueries } from '@/app/users/hooks/api/users.queries.ts';
import { useUserFacetsValue } from '@/app/users/hooks/user-facets-value';
import { Route } from '@/app/users/pages/list.tsx';
import { userRoleFilter } from '@/app/users/utils/user-role-filter';
import { userStatusFilter } from '@/app/users/utils/user-status-filter';

export function UserDataTable() {
  const navigate = Route.useNavigate();

  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const { sorting, setSorting, sortValue } = useSort();
  const { searchValue } = useSearch();
  const { columnFilters, setColumnFilters } = useFilters([
    userRoleFilter,
    userStatusFilter,
  ]);
  const { pagination, setPagination } = usePagination({}, [
    searchValue,
    columnFilters,
    sorting,
  ]);

  const statusConditions = userStatusFilter.toConditions(columnFilters);
  const roleConditions = userRoleFilter.toConditions(columnFilters);

  const { data } = useSuspenseQuery({
    ...userQueries.list({
      search: searchValue,
      ...pagination,
      ...sortValue,
      ...roleConditions,
      ...statusConditions,
    }),
  });

  const getServerFacetedUniqueValues = useUserFacetsValue({
    columnFilters,
  });
  const table = useReactTable<AdminUser>({
    data: (data?.data || []) as Array<AdminUser>,
    columns: userDataTableColumns,
    pageCount: data?.meta?.pageCount || 0,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    manualPagination: true,
    manualFiltering: true,
    enableRowSelection: false,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedUniqueValues: getServerFacetedUniqueValues(),
  });

  return (
    <ListSection>
      <DataTableProvider {...table}>
        <DataTableToolbar placeholder={'Search users...'}>
          <DataTableToolbarFilters>
            <DataTableFacetedFilter
              title={userStatusFilter.title}
              columnId={userStatusFilter.id}
              options={userStatusFilter.options}
            />
            <DataTableFacetedFilter
              title={userRoleFilter.title}
              columnId={userRoleFilter.id}
              options={userRoleFilter.options}
            />
          </DataTableToolbarFilters>
          <DataTableToolbarActions>
            <DataTableViewOptions />
          </DataTableToolbarActions>
        </DataTableToolbar>
        <DataTable<AdminUser>
          onRowClick={(row) =>
            navigate({
              to: '/admin/users/$userId/edit',
              params: {
                userId: row.original.id!,
              },
            })
          }
        />
        <DataTablePagination />
      </DataTableProvider>
    </ListSection>
  );
}
