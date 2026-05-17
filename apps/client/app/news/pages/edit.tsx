import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { Button } from "@aksob/ui/core/button";
import { cn } from "@aksob/ui/lib/utils";
import {
	IconArrowLeft,
	IconCalendar,
	IconCircleCheck,
	IconCircleDashed,
	IconPencil,
} from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { NewsForm } from "@/app/news/components/form/news-form";
import type { NewsFormSchema } from "@/app/news/components/form/news-form-schema";
import { NewsFormSkeleton } from "@/app/news/components/loading/news-form-skeleton";
import type { NewsArticle } from "@/app/news/hooks/api/news.functions";
import { newsQueries } from "@/app/news/hooks/api/news.queries";

const statusVisuals: Record<
	string,
	{
		label: string;
		icon: React.ElementType;
		bg: string;
		text: string;
		ring: string;
	}
> = {
	draft: {
		label: "Draft",
		icon: IconCircleDashed,
		bg: "bg-amber-50",
		text: "text-amber-700",
		ring: "ring-amber-200",
	},
	published: {
		label: "Published",
		icon: IconCircleCheck,
		bg: "bg-emerald-50",
		text: "text-emerald-700",
		ring: "ring-emerald-200",
	},
};

function toDateInputValue(value: string | number | Date | null): string {
	if (!value) return "";
	if (value instanceof Date) return value.toISOString().slice(0, 10);
	if (typeof value === "number")
		return new Date(value).toISOString().slice(0, 10);
	return value.slice(0, 10);
}

function toFormValues(article: NewsArticle): NewsFormSchema {
	return {
		title: article.title,
		excerpt: article.excerpt,
		content: article.content,
		coverImage: article.coverImage ?? "",
		thumbnailImage: article.thumbnailImage ?? "",
		categoryId: article.category?.id ?? "",
		authorId: article.author.id,
		date: article.date ? toDateInputValue(article.date) : "",
	};
}

export const Route = createFileRoute("/admin/news/$newsId/edit")({
	pendingComponent: NewsFormSkeleton,
	loaderDeps: ({ params }) => params,
	loader: async ({ context, deps }) => {
		await context.queryClient.ensureQueryData(newsQueries.single(deps.newsId));
	},
	head: () => ({
		meta: [
			{ title: "Edit Article - AKSOB" },
			{
				name: "description",
				content: "Edit an existing news article.",
			},
			{ property: "og:title", content: "Edit Article - AKSOB" },
			{
				property: "og:description",
				content: "Edit an existing news article.",
			},
		],
	}),
	component: EditNewsPage,
});

function EditNewsPage() {
	const { newsId } = Route.useParams();
	const { data } = useSuspenseQuery(newsQueries.single(newsId));
	const statusVisual = statusVisuals[data.status];

	return (
		<Main>
			<PageHeader
				title="Edit Article"
				description="Make changes to an existing article."
				withSeparator
			>
				<div className="flex flex-wrap items-center gap-2">
					{statusVisual && (
						<div
							className={cn(
								"flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
								statusVisual.bg,
								statusVisual.text,
								statusVisual.ring,
							)}
						>
							<statusVisual.icon size={13} />
							{statusVisual.label}
						</div>
					)}
					{data.date && (
						<span className="hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border sm:flex">
							<IconCalendar size={12} /> {toDateInputValue(data.date)}
						</span>
					)}
					<span className="hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border sm:flex">
						<IconPencil size={12} /> Edited{" "}
						{new Date(data.updatedAt).toLocaleDateString(undefined, {
							month: "short",
							day: "numeric",
							year: "numeric",
						})}
					</span>
					<Link to="/admin/news">
						<Button variant="ghost" className="gap-2">
							<IconArrowLeft size={16} /> Back to Articles
						</Button>
					</Link>
				</div>
			</PageHeader>
			<NewsForm newsId={newsId} defaultValues={toFormValues(data)} />
		</Main>
	);
}
