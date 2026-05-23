import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Check,
	CheckCircle,
	Clock,
	Link2,
	Loader2,
	X,
	XCircle,
} from "lucide-react";
import { useCallback, useState } from "react";
import {
	acceptConnection,
	type ConnectionItem,
	cancelConnection,
	completeConnection,
	declineConnection,
	listConnections,
} from "~/app/lib/users";
import { Avatar } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

const STATUS_CONFIG: Record<
	string,
	{
		label: string;
		variant: "default" | "primary" | "success" | "warning" | "error";
		icon: React.ReactNode;
	}
> = {
	pending: { label: "Pending", variant: "warning", icon: <Clock size={12} /> },
	active: {
		label: "Active",
		variant: "success",
		icon: <CheckCircle size={12} />,
	},
	declined: {
		label: "Declined",
		variant: "error",
		icon: <XCircle size={12} />,
	},
	cancelled: {
		label: "Cancelled",
		variant: "default",
		icon: <XCircle size={12} />,
	},
	completed: {
		label: "Completed",
		variant: "primary",
		icon: <CheckCircle size={12} />,
	},
};

const TYPE_LABELS: Record<string, string> = {
	mentorship: "Mentorship",
	career_coaching: "Career Coaching",
	study_partner: "Study Partner",
	buddy: "Buddy",
	research: "Research",
	project: "Project",
};

type TabKey = "all" | "active" | "pending" | "cancelled" | "completed";

export function ConnectionsSection({ userId }: { userId: string }) {
	const [tab, setTab] = useState<TabKey>("active");
	const queryClient = useQueryClient();

	const { data, isLoading } = useQuery({
		queryKey: ["connections", tab],
		queryFn: () =>
			listConnections(tab === "all" ? undefined : tab).then((r) => r.data),
	});

	const handleAction = useCallback(
		async (
			id: string,
			action: "accept" | "decline" | "cancel" | "complete",
		) => {
			if (action === "accept") await acceptConnection(id);
			if (action === "decline") await declineConnection(id);
			if (action === "cancel") await cancelConnection(id);
			if (action === "complete") await completeConnection(id);
			queryClient.invalidateQueries({ queryKey: ["connections"] });
		},
		[queryClient],
	);

	const connections = data ?? [];

	const tabs: { key: TabKey; label: string }[] = [
		{ key: "all", label: "All" },
		{ key: "active", label: "Active" },
		{ key: "pending", label: "Pending" },
		{ key: "cancelled", label: "Cancelled" },
		{ key: "completed", label: "Completed" },
	];

	return (
		<div className="space-y-4">
			{/* Tabs */}
			<div className="flex gap-1 p-1 bg-[var(--gray-100)] rounded-lg w-fit">
				{tabs.map((t) => (
					<button
						type="button"
						key={t.key}
						onClick={() => setTab(t.key)}
						className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
							tab === t.key
								? "bg-white text-[var(--aksob-primary)] shadow-sm"
								: "text-gray-500 hover:text-gray-700"
						}`}
					>
						{t.label}
					</button>
				))}
			</div>

			{isLoading ? (
				<div className="flex items-center justify-center py-12">
					<Loader2
						size={24}
						className="animate-spin text-[var(--aksob-primary)]"
					/>
				</div>
			) : connections.length === 0 ? (
				<div className="text-center py-12">
					<div className="w-16 h-16 bg-[var(--gray-100)] rounded-full flex items-center justify-center mx-auto mb-3">
						<Link2 size={24} className="text-[var(--gray-400)]" />
					</div>
					<p className="text-sm text-[var(--gray-500)]">
						{tab === "all"
							? "No connections yet."
							: `No ${tab} connections yet.`}
					</p>
					{tab === "active" || tab === "all" ? (
						<p className="text-xs text-[var(--gray-400)] mt-1">
							Browse the Galaxy to find and connect with alumni.
						</p>
					) : null}
				</div>
			) : (
				<div className="grid gap-3">
					{connections.map((c) => (
						<ConnectionCard
							key={c.id}
							connection={c}
							userId={userId}
							onAction={handleAction}
						/>
					))}
				</div>
			)}
		</div>
	);
}

function ConnectionCard({
	connection,
	userId,
	onAction,
}: {
	connection: ConnectionItem;
	userId: string;
	onAction: (
		id: string,
		action: "accept" | "decline" | "cancel" | "complete",
	) => Promise<void>;
}) {
	const isRequester = connection.requesterId === userId;
	const otherUser = isRequester ? connection.matchedUser : connection.requester;
	const otherUserId =
		otherUser?.id ??
		(isRequester ? connection.matchedUserId : connection.requesterId);
	const status = STATUS_CONFIG[connection.status];

	return (
		<div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50">
			<div className="flex items-center gap-3 flex-1 min-w-0">
				<Avatar
					name={otherUser?.name ?? "User"}
					src={otherUser?.image ?? undefined}
					size="md"
					className="w-10 h-10 flex-shrink-0"
				/>
				<div className="min-w-0">
					<div className="flex items-center gap-2 flex-wrap">
						<h4 className="text-sm font-semibold text-gray-900 truncate">
							{otherUser?.name ?? `User ${otherUserId.slice(0, 8)}`}
						</h4>
						<Badge
							variant={status.variant}
							className="text-[10px] px-1.5 py-0.5"
						>
							<span className="flex items-center gap-1">
								{status.icon}
								{status.label}
							</span>
						</Badge>
					</div>
					<div className="flex items-center gap-2 mt-0.5">
						<Badge variant="default" className="text-[10px] px-1.5 py-0.5">
							{TYPE_LABELS[connection.type] ?? connection.type}
						</Badge>
						<span className="text-xs text-[var(--gray-400)]">
							{new Date(connection.createdAt).toLocaleDateString()}
						</span>
					</div>
					{connection.matchExplanation ? (
						<p className="text-xs text-[var(--gray-500)] mt-1 line-clamp-2">
							{connection.matchExplanation}
						</p>
					) : null}
				</div>
			</div>

			{/* Actions */}
			<div className="flex gap-2 flex-shrink-0">
				{connection.status === "pending" && !isRequester && (
					<>
						<Button
							variant="ghost"
							size="sm"
							className="h-8 px-3"
							onClick={() => onAction(connection.id, "decline")}
						>
							<X size={14} />
						</Button>
						<Button
							variant="primary"
							size="sm"
							className="h-8 px-3"
							onClick={() => onAction(connection.id, "accept")}
						>
							<Check size={14} />
						</Button>
					</>
				)}
				{connection.status === "pending" && isRequester && (
					<Button
						variant="ghost"
						size="sm"
						className="h-8 px-3"
						onClick={() => onAction(connection.id, "cancel")}
					>
						Cancel
					</Button>
				)}
				{connection.status === "active" && (
					<Button
						variant="secondary"
						size="sm"
						className="h-8 px-3"
						onClick={() => onAction(connection.id, "complete")}
					>
						Complete
					</Button>
				)}
			</div>
		</div>
	);
}
