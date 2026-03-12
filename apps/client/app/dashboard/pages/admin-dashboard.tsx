import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { createFileRoute } from '@tanstack/react-router';
import { m } from '@/paraglide/messages';

export const Route = createFileRoute('/admin/dashboard')({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  return (
    <>
      <PageHeader title={m.dashboard_title()} description={m.dashboard_welcome()} />
    </>
  );
}