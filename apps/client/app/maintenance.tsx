import { createFileRoute } from '@tanstack/react-router';
import { m } from '@/paraglide/messages';

export const Route = createFileRoute('/maintenance')({
  component: MaintenancePage,
});

function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          {m.maintenance_title()}
        </h1>
        <p className="text-muted-foreground text-lg">
          {m.maintenance_description()}
        </p>
      </div>
    </div>
  );
}