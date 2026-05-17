import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Link, useParams } from "react-router";

import { getNewsArticle } from "~/app/lib/news";
import { Avatar } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { FullPageLoader } from "~/components/ui/loading-spinner";

export default function NewsDetailPage() {
	const { id } = useParams<{ id: string }>();

	const {
		data: article,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["news", id],
		queryFn: () => getNewsArticle(id!).then((r) => r.data),
		enabled: !!id,
	});

	if (isLoading) {
		return (
			<main className="min-h-screen bg-(--off-white) pt-20">
				<div className="flex items-center justify-center py-32">
					<FullPageLoader />
				</div>
			</main>
		);
	}

	if (error || !article) {
		return (
			<main className="min-h-screen bg-(--off-white) pt-20">
				<div className="max-w-3xl mx-auto px-6 py-16 text-center">
					<h1
						className="text-3xl font-light text-(--aksob-darkest)"
						style={{ fontFamily: "var(--font-display)" }}
					>
						Article Not Found
					</h1>
					<p className="mt-4 text-[var(--gray-500)]">
						The article you&apos;re looking for doesn&apos;t exist or has been
						removed.
					</p>
					<Link
						to="/news"
						className="mt-6 inline-flex items-center gap-2 text-[var(--aksob-primary)] hover:underline"
					>
						<ArrowLeft size={16} />
						Back to News
					</Link>
				</div>
			</main>
		);
	}

	const dateStr = article.date ?? article.publishedAt;
	const formattedDate = dateStr
		? new Date(dateStr).toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			})
		: "";

	return (
		<main className="min-h-screen bg-(--off-white) pt-20">
			{/* Back link */}
			<div className="max-w-4xl mx-auto px-6 py-6">
				<Link
					to="/news"
					className="inline-flex items-center gap-2 text-sm text-[var(--gray-500)] hover:text-[var(--aksob-primary)] transition-colors"
				>
					<ArrowLeft size={16} />
					Back to News
				</Link>
			</div>

			{/* Cover Image */}
			{article.coverImage && (
				<div className="max-w-5xl mx-auto px-6">
					<img
						src={article.coverImage}
						alt={article.title}
						className="w-full aspect-[2/1] object-cover rounded-2xl"
					/>
				</div>
			)}

			{/* Content */}
			<article className="max-w-3xl mx-auto px-6 py-12">
				{/* Meta */}
				<div className="flex items-center gap-3 mb-6 flex-wrap">
					{article.category && (
						<Badge variant="primary" className="text-xs">
							{article.category.name}
						</Badge>
					)}
				</div>

				{/* Title */}
				<h1
					className="text-4xl md:text-5xl font-bold text-(--aksob-darkest) tracking-tight leading-tight"
					style={{ fontFamily: "var(--font-display)" }}
				>
					{article.title}
				</h1>

				{/* Excerpt */}
				{article.excerpt && (
					<p className="mt-4 text-xl text-[var(--gray-500)] leading-relaxed">
						{article.excerpt}
					</p>
				)}

				{/* Author & Date */}
				<div className="mt-8 flex items-center gap-4 flex-wrap">
					<div className="flex items-center gap-3">
						<Avatar
							name={article.author.name}
							src={article.author.image ?? undefined}
							size="md"
						/>
						<div>
							<p className="text-sm font-medium text-(--aksob-darkest)">
								{article.author.name}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-4 text-xs text-[var(--gray-400)]">
						{formattedDate && (
							<span className="flex items-center gap-1">
								<Calendar size={12} />
								{formattedDate}
							</span>
						)}
						{article.readTime && (
							<span className="flex items-center gap-1">
								<Clock size={12} />
								{article.readTime} min read
							</span>
						)}
					</div>
				</div>

				{/* Divider */}
				<hr className="mt-8 mb-10 border-[var(--gray-200)]" />

				{/* Article Content */}
				<div
					className="prose prose-aksob max-w-none"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: HTML content from trusted API
					dangerouslySetInnerHTML={{ __html: article.content }}
				/>
			</article>
		</main>
	);
}
