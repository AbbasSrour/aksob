import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { ButtonSkeleton } from "@aksob/ui/components/skeleton/button-skeleton";

export function StoriesFormSkeleton() {
	return (
		<Main className="h-[calc(100vh-4rem)] overflow-hidden">
			<PageHeader title="Loading..." description="">
				<ButtonSkeleton className="h-9 w-28" />
			</PageHeader>

			<div className="flex flex-1 overflow-hidden">
				{/* Writing area */}
				<div className="flex-1 overflow-y-auto bg-white">
					<div className="mx-auto max-w-3xl px-8 pb-20 pt-14 lg:px-16 lg:pt-20">
						<div className="mb-8 h-6 w-20 rounded-full bg-muted" />
						<div className="mb-2 h-16 w-3/4 rounded-lg bg-muted" />
						<div className="mb-12 h-8 w-1/2 rounded-lg bg-muted" />
						<div className="mb-6 h-10 rounded-lg bg-muted" />
						<div className="h-80 rounded-xl bg-muted" />
						<div className="mt-10 flex items-center gap-3 border-t border-dashed border-black/[0.06] pt-4">
							<div className="h-3 w-16 rounded bg-muted" />
							<div className="h-3 w-2 rounded bg-muted" />
							<div className="h-3 w-14 rounded bg-muted" />
						</div>
					</div>
				</div>

				{/* Right panel skeleton */}
				<div className="hidden w-[320px] flex-shrink-0 border-l border-[#e8e6e1] bg-[#f7f6f3] lg:block">
					<div className="space-y-8 p-6">
						<div className="rounded-xl border border-black/[0.06] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
							<div className="flex items-start gap-3.5">
								<div className="h-10 w-10 flex-shrink-0 rounded-full bg-muted" />
								<div className="space-y-2">
									<div className="h-4 w-24 rounded bg-muted" />
									<div className="h-3 w-32 rounded bg-muted" />
								</div>
							</div>
						</div>
						<div className="space-y-4">
							<div className="h-3 w-20 rounded bg-muted" />
							<div className="space-y-2">
								{Array.from({ length: 5 }).map((_, i) => (
									<div key={i} className="h-10 rounded-lg bg-muted" />
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</Main>
	);
}
