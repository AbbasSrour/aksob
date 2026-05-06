import { InsightCard } from "@aksob/ui/components/cards/insight-card";
import { InsightGrid } from "@aksob/ui/components/insights/insight-grid";
import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@aksob/ui/core/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@aksob/ui/core/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltipContent,
} from "@aksob/ui/core/chart";
import { Separator } from "@aksob/ui/core/separator";
import { createFileRoute } from "@tanstack/react-router";
import {
	BookOpen,
	Briefcase,
	GraduationCap,
	Microscope,
	Users,
} from "lucide-react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { dashboardQueries } from "@/app/dashboard/hooks/api/dashboard.queries";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/admin/dashboard")({
	loader: async ({ context }) => {
		return await context.queryClient.ensureQueryData(dashboardQueries.stats());
	},
	head: () => ({
		meta: [
			{ title: m.dashboard_title() },
			{
				name: "description",
				content: m.dashboard_welcome(),
			},
		],
	}),
	component: AdminDashboardPage,
});

const PIE_COLORS = [
	"#076951",
	"#16876b",
	"#2dbe8e",
	"#5cd4ae",
	"#8ee5c9",
	"#c2f3e1",
	"#365951",
	"#1a5c47",
];

const STATUS_COLORS: Record<string, string> = {
	pending: "#f59e0b",
	approved: "#10b981",
	rejected: "#ef4444",
};

const USER_TYPE_LABELS: Record<string, string> = {
	student: "Students",
	alumni: "Alumni",
	faculty: "Faculty",
};

const OPPORTUNITY_TYPE_LABELS: Record<string, string> = {
	job: "Jobs",
	internship: "Internships",
};

const STORY_CATEGORY_LABELS: Record<string, string> = {
	career_advancement: "Career",
	entrepreneurship: "Entrepreneurship",
	industry_recognition: "Industry",
	social_impact: "Social Impact",
	academic_achievement: "Academic",
	innovation: "Innovation",
	leadership: "Leadership",
	community_service: "Community",
	other: "Other",
};

const RESEARCH_TYPE_LABELS: Record<string, string> = {
	phd_position: "PhD",
	postdoc: "Postdoc",
	research_assistant: "Research Asst.",
	visiting_researcher: "Visiting",
	research_internship: "Internship",
	collaboration: "Collaboration",
	fellowship: "Fellowship",
	other: "Other",
};

const MAJOR_LABELS: Record<string, string> = {
	"BS in Business": "BS Business",
	"BS in Economics": "BS Economics",
	"BS Hospitality Management": "BS Hospitality",
	"MBA & Executive MBA": "MBA",
	"MS Data Analytics": "MS Data Analytics",
	"MS Human Resources": "MS HR",
	"MA Applied Economics": "MA Applied Econ",
	"LLM & Master of Laws": "LLM",
};

function AdminDashboardPage() {
	const stats = Route.useLoaderData();

	const userTypeData = Object.entries(stats.users.byType).map(
		([type, count]) => ({
			name: USER_TYPE_LABELS[type] ?? type,
			value: count,
			type,
		}),
	);

	const usersByMajorData = Object.entries(stats.users.byMajor)
		.map(([major, count]) => ({
			name: MAJOR_LABELS[major] ?? major,
			value: count,
			major,
		}))
		.sort((a, b) => b.value - a.value);

	const oppByStatusData = Object.entries(stats.opportunities.byStatus).map(
		([status, count]) => ({
			name: status.charAt(0).toUpperCase() + status.slice(1),
			count,
			fill: STATUS_COLORS[status] ?? "#6b7280",
		}),
	);

	const storiesByCategoryData = Object.entries(stats.stories.byCategory).map(
		([category, count]) => ({
			name: STORY_CATEGORY_LABELS[category] ?? category,
			value: count,
			category,
		}),
	);

	const researchByTypeData = Object.entries(stats.research.byType).map(
		([type, count]) => ({
			name: RESEARCH_TYPE_LABELS[type] ?? type,
			value: count,
			type,
		}),
	);

	const userTypeChartConfig: ChartConfig = {
		student: { label: "Students", color: "#076951" },
		alumni: { label: "Alumni", color: "#16876b" },
		faculty: { label: "Faculty", color: "#2dbe8e" },
	};

	const oppStatusChartConfig: ChartConfig = {
		pending: { label: "Pending", color: "#f59e0b" },
		approved: { label: "Approved", color: "#10b981" },
		rejected: { label: "Rejected", color: "#ef4444" },
	};

	const majorChartConfig: ChartConfig = Object.fromEntries(
		Object.keys(stats.users.byMajor).map((major, i) => [
			major,
			{
				label: MAJOR_LABELS[major] ?? major,
				color: PIE_COLORS[i % PIE_COLORS.length],
			},
		]),
	);

	const storyCategoryChartConfig: ChartConfig = Object.fromEntries(
		Object.keys(stats.stories.byCategory).map((cat, i) => [
			cat,
			{
				label: STORY_CATEGORY_LABELS[cat] ?? cat,
				color: PIE_COLORS[i % PIE_COLORS.length],
			},
		]),
	);

	const researchTypeChartConfig: ChartConfig = Object.fromEntries(
		Object.keys(stats.research.byType).map((type, i) => [
			type,
			{
				label: RESEARCH_TYPE_LABELS[type] ?? type,
				color: PIE_COLORS[i % PIE_COLORS.length],
			},
		]),
	);

	return (
		<Main>
			<PageHeader
				title={m.dashboard_title()}
				description={m.dashboard_welcome()}
			/>

			<InsightGrid className="lg:grid-cols-4">
				<InsightCard
					title="Total Members"
					value={stats.users.total.toLocaleString()}
					icon={Users}
					gradientClassName="from-emerald-400 to-emerald-600"
					iconClassName="text-emerald-600"
				/>
				<InsightCard
					title="Opportunities"
					value={stats.opportunities.total.toLocaleString()}
					icon={Briefcase}
					gradientClassName="from-amber-400 to-amber-600"
					iconClassName="text-amber-600"
				/>
				<InsightCard
					title="Stories"
					value={stats.stories.total.toLocaleString()}
					icon={BookOpen}
					gradientClassName="from-blue-400 to-blue-600"
					iconClassName="text-blue-600"
				/>
				<InsightCard
					title="Research"
					value={stats.research.total.toLocaleString()}
					icon={Microscope}
					gradientClassName="from-purple-400 to-purple-600"
					iconClassName="text-purple-600"
				/>
			</InsightGrid>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-4 w-4 text-emerald-600" />
							Members by Type
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ChartContainer
							config={userTypeChartConfig}
							className="mx-auto aspect-square max-h-[280px]"
						>
							<PieChart>
								<Tooltip content={<ChartTooltipContent hideLabel />} />
								<Pie
									data={userTypeData}
									dataKey="value"
									nameKey="name"
									innerRadius={60}
									outerRadius={100}
									paddingAngle={2}
								>
									{userTypeData.map((entry, index) => (
										<Cell
											key={entry.type}
											fill={PIE_COLORS[index % PIE_COLORS.length]}
										/>
									))}
								</Pie>
							</PieChart>
						</ChartContainer>
						<div className="mt-4 flex flex-wrap justify-center gap-3">
							{userTypeData.map((item) => (
								<div
									key={item.type}
									className="flex items-center gap-1.5 text-sm"
								>
									<div
										className="h-2.5 w-2.5 rounded-full"
										style={{
											backgroundColor:
												userTypeChartConfig[item.type]?.color ?? "#6b7280",
										}}
									/>
									<span className="text-muted-foreground">{item.name}</span>
									<span className="font-medium">{item.value}</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Briefcase className="h-4 w-4 text-amber-600" />
							Opportunities by Status
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ChartContainer
							config={oppStatusChartConfig}
							className="aspect-square max-h-[280px]"
						>
							<BarChart
								data={oppByStatusData}
								layout="vertical"
								margin={{ left: 10, right: 20, top: 10, bottom: 10 }}
							>
								<CartesianGrid horizontal={false} />
								<XAxis type="number" />
								<YAxis
									dataKey="name"
									type="category"
									width={80}
									tickLine={false}
								/>
								<Tooltip content={<ChartTooltipContent />} />
								<Bar dataKey="count" radius={[0, 6, 6, 0]}>
									{oppByStatusData.map((entry) => (
										<Cell key={entry.name} fill={entry.fill} />
									))}
								</Bar>
							</BarChart>
						</ChartContainer>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<GraduationCap className="h-4 w-4 text-emerald-600" />
							Members by Major
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ChartContainer
							config={majorChartConfig}
							className="mx-auto aspect-square max-h-[280px]"
						>
							<PieChart>
								<Tooltip content={<ChartTooltipContent hideLabel />} />
								<Pie
									data={usersByMajorData}
									dataKey="value"
									nameKey="name"
									innerRadius={50}
									outerRadius={90}
									paddingAngle={1}
								>
									{usersByMajorData.map((entry, index) => (
										<Cell
											key={entry.major}
											fill={PIE_COLORS[index % PIE_COLORS.length]}
										/>
									))}
								</Pie>
							</PieChart>
						</ChartContainer>
						<div className="mt-4 flex flex-wrap justify-center gap-2">
							{usersByMajorData.map((item) => (
								<div
									key={item.major}
									className="flex items-center gap-1.5 text-xs"
								>
									<div
										className="h-2 w-2 rounded-full"
										style={{
											backgroundColor:
												majorChartConfig[item.major]?.color ?? "#6b7280",
										}}
									/>
									<span className="text-muted-foreground">{item.name}</span>
									<span className="font-medium">{item.value}</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-6 md:grid-cols-2 mt-6">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<BookOpen className="h-4 w-4 text-blue-600" />
							Stories by Category
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ChartContainer
							config={storyCategoryChartConfig}
							className="aspect-video max-h-[300px]"
						>
							<BarChart
								data={storiesByCategoryData.sort((a, b) => b.value - a.value)}
								margin={{ top: 10, bottom: 20 }}
							>
								<CartesianGrid vertical={false} />
								<XAxis
									dataKey="name"
									tickLine={false}
									axisLine={false}
									tickMargin={8}
									interval={0}
									angle={-30}
									textAnchor="end"
									fontSize={11}
								/>
								<YAxis tickLine={false} axisLine={false} />
								<Tooltip content={<ChartTooltipContent />} />
								<Bar dataKey="value" radius={[4, 4, 0, 0]}>
									{storiesByCategoryData.map((entry, index) => (
										<Cell
											key={entry.category}
											fill={PIE_COLORS[index % PIE_COLORS.length]}
										/>
									))}
								</Bar>
							</BarChart>
						</ChartContainer>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Microscope className="h-4 w-4 text-purple-600" />
							Research by Type
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ChartContainer
							config={researchTypeChartConfig}
							className="mx-auto aspect-square max-h-[300px]"
						>
							<PieChart>
								<Tooltip content={<ChartTooltipContent hideLabel />} />
								<Pie
									data={researchByTypeData}
									dataKey="value"
									nameKey="name"
									innerRadius={55}
									outerRadius={95}
									paddingAngle={2}
								>
									{researchByTypeData.map((entry, index) => (
										<Cell
											key={entry.type}
											fill={PIE_COLORS[index % PIE_COLORS.length]}
										/>
									))}
								</Pie>
							</PieChart>
						</ChartContainer>
						<div className="mt-4 flex flex-wrap justify-center gap-2">
							{researchByTypeData.map((item) => (
								<div
									key={item.type}
									className="flex items-center gap-1.5 text-xs"
								>
									<div
										className="h-2 w-2 rounded-full"
										style={{
											backgroundColor:
												researchTypeChartConfig[item.type]?.color ?? "#6b7280",
										}}
									/>
									<span className="text-muted-foreground">{item.name}</span>
									<span className="font-medium">{item.value}</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-6 md:grid-cols-3 mt-6">
				<RecentActivity
					title="Recent Members"
					icon={<Users className="h-4 w-4 text-emerald-600" />}
					items={stats.recent.users.map((u) => ({
						id: u.id,
						primary: u.name,
						secondary: u.email,
						image: u.image,
						badge: USER_TYPE_LABELS[u.userType] ?? u.userType,
						date: u.createdAt,
					}))}
				/>
				<RecentActivity
					title="Recent Opportunities"
					icon={<Briefcase className="h-4 w-4 text-amber-600" />}
					items={stats.recent.opportunities.map((o) => ({
						id: o.id,
						primary: o.company,
						secondary: OPPORTUNITY_TYPE_LABELS[o.type] ?? o.type,
						badge: o.status,
						date: o.createdAt,
					}))}
				/>
				<RecentActivity
					title="Recent Stories"
					icon={<BookOpen className="h-4 w-4 text-blue-600" />}
					items={stats.recent.stories.map((s) => ({
						id: s.id,
						primary: s.title,
						secondary: STORY_CATEGORY_LABELS[s.category] ?? s.category,
						badge: s.status,
						date: s.createdAt,
					}))}
				/>
			</div>
		</Main>
	);
}

interface RecentActivityItem {
	id: string;
	primary: string;
	secondary?: string;
	image?: string | null;
	badge?: string;
	date?: string | null;
}

function RecentActivity({
	title,
	icon,
	items,
}: {
	title: string;
	icon: React.ReactNode;
	items: RecentActivityItem[];
}) {
	const statusVariant = (status?: string) => {
		switch (status) {
			case "approved":
				return "bg-emerald-100 text-emerald-700";
			case "pending":
				return "bg-amber-100 text-amber-700";
			case "rejected":
				return "bg-red-100 text-red-700";
			default:
				return "bg-gray-100 text-gray-700";
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-base">
					{icon}
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent>
				{items.length === 0 ? (
					<p className="text-sm text-muted-foreground text-center py-6">
						No items yet
					</p>
				) : (
					<div className="space-y-1">
						{items.map((item, i) => (
							<div key={item.id}>
								{i > 0 && <Separator className="my-2" />}
								<div className="flex items-center justify-between gap-3 py-1.5">
									<div className="flex items-center gap-3 min-w-0">
										{item.image ? (
											<Avatar className="h-8 w-8 shrink-0">
												<AvatarImage src={item.image} alt={item.primary} />
												<AvatarFallback className="text-xs">
													{item.primary.charAt(0).toUpperCase()}
												</AvatarFallback>
											</Avatar>
										) : (
											<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
												{item.primary.charAt(0).toUpperCase()}
											</div>
										)}
										<div className="min-w-0">
											<p className="text-sm font-medium truncate">
												{item.primary}
											</p>
											{item.secondary && (
												<p className="text-xs text-muted-foreground truncate">
													{item.secondary}
												</p>
											)}
										</div>
									</div>
									<div className="flex items-center gap-2 shrink-0">
										{item.badge && (
											<span
												className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusVariant(item.badge)}`}
											>
												{item.badge}
											</span>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
