import { Skeleton } from '@aksob/ui/core/skeleton';
import { cn } from '@aksob/ui/lib/utils';
import type { ComponentProps } from 'react';

export function FilterChipSkeleton({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <Skeleton
      className={cn('h-8 w-24 rounded-md', className)}
      {...props}
    />
  );
}
