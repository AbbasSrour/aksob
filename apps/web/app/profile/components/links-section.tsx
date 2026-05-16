import { Edit2, Link, Plus, Save } from "lucide-react";
import { useCallback, useState } from "react";
import { type LinkEntry, updateLinks } from "~/app/lib/users";
import { Button } from "~/components/ui/button";

interface Props {
	links: LinkEntry[];
	onRefetch: () => void;
}

const PLATFORM_LABELS: Record<string, string> = {
	linkedin: "LinkedIn",
	github: "GitHub",
	twitter: "Twitter",
	website: "Website",
};

export function LinksSection({ links, onRefetch }: Props) {
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState<LinkEntry[]>([]);
	const [saving, setSaving] = useState(false);

	const handleEdit = useCallback(() => {
		setDraft(links.map((l) => ({ ...l })));
		setEditing(true);
	}, [links]);
	const handleCancel = useCallback(() => {
		setDraft([]);
		setEditing(false);
	}, []);
	const handleSave = useCallback(async () => {
		setSaving(true);
		try {
			await updateLinks({
				entries: draft.map((d) => ({ platform: d.platform, url: d.url })),
			});
			setEditing(false);
			onRefetch();
		} finally {
			setSaving(false);
		}
	}, [draft, onRefetch]);
	const handleAdd = useCallback(
		() =>
			setDraft((prev) => [
				...prev,
				{ id: crypto.randomUUID(), platform: "linkedin", url: "" },
			]),
		[],
	);
	const handleRemove = useCallback(
		(i: number) => setDraft((prev) => prev.filter((_, idx) => idx !== i)),
		[],
	);
	const handleUpdate = useCallback(
		(i: number, field: "platform" | "url", value: string) =>
			setDraft((prev) =>
				prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)),
			),
		[],
	);

	const inputClass =
		"h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:ring-2 focus:ring-[var(--aksob-primary)]/20 focus:border-[var(--aksob-primary)] transition disabled:opacity-50";

	const display = editing ? draft : links;

	return (
		<div className="p-5">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-sm font-semibold text-gray-900">Links</h3>
				{!editing ? (
					<Button
						variant="secondary"
						size="sm"
						onClick={handleEdit}
						leftIcon={<Edit2 size={14} />}
					>
						Edit
					</Button>
				) : (
					<div className="flex gap-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={handleCancel}
							disabled={saving}
						>
							Cancel
						</Button>
						<Button
							variant="primary"
							size="sm"
							onClick={handleSave}
							leftIcon={<Save size={14} />}
							isLoading={saving}
						>
							Save
						</Button>
					</div>
				)}
			</div>
			{display.length === 0 && !editing ? (
				<p className="text-sm text-gray-400 py-2">No links added yet.</p>
			) : (
				<div className="divide-y divide-gray-100">
					{display.map((link, i) => (
						<div
							key={editing ? i : link.id}
							className="flex items-center justify-between py-3"
						>
							{!editing ? (
								<div className="flex items-center gap-3 min-w-0">
									<div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
										<Link size={16} className="text-gray-500" />
									</div>
									<div>
										<p className="text-sm font-medium text-gray-900">
											{PLATFORM_LABELS[link.platform] ?? link.platform}
										</p>
										<a
											href={link.url}
											target="_blank"
											rel="noopener noreferrer"
											className="text-xs text-gray-400 hover:underline truncate block"
										>
											{link.url}
										</a>
									</div>
								</div>
							) : (
								<>
									<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
										<select
											className={inputClass}
											value={link.platform}
											onChange={(e) =>
												handleUpdate(i, "platform", e.target.value)
											}
											disabled={saving}
										>
											<option value="linkedin">LinkedIn</option>
											<option value="github">GitHub</option>
											<option value="twitter">Twitter</option>
											<option value="website">Website</option>
											<option value="other">Other</option>
										</select>
										<div className="sm:col-span-2">
											<input
												className={`${inputClass} w-full`}
												placeholder="https://..."
												value={link.url}
												onChange={(e) => handleUpdate(i, "url", e.target.value)}
												disabled={saving}
											/>
										</div>
									</div>
									<button
										type="button"
										className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 transition disabled:opacity-50"
										onClick={() => handleRemove(i)}
										disabled={saving}
										aria-label="Remove link"
									>
										×
									</button>
								</>
							)}
						</div>
					))}
				</div>
			)}
			{editing ? (
				<Button
					variant="ghost"
					size="sm"
					className="mt-3"
					onClick={handleAdd}
					leftIcon={<Plus size={14} />}
					disabled={saving}
				>
					Add link
				</Button>
			) : null}
		</div>
	);
}
