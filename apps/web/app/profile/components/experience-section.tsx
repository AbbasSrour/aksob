import { Edit2, Plus, Save } from "lucide-react";
import { useCallback, useState } from "react";
import { type ExperienceEntry, updateExperience } from "~/app/lib/users";
import { ExperienceEntryRow } from "~/app/profile/components/experience-entry";
import { Button } from "~/components/ui/button";

interface Props {
	entries: ExperienceEntry[];
	onRefetch: () => void;
}

export function ExperienceSection({ entries, onRefetch }: Props) {
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState<ExperienceEntry[]>([]);
	const [saving, setSaving] = useState(false);

	const handleEdit = useCallback(() => {
		setDraft(entries.map((e) => ({ ...e })));
		setEditing(true);
	}, [entries]);

	const handleCancel = useCallback(() => {
		setDraft([]);
		setEditing(false);
	}, []);

	const handleSave = useCallback(async () => {
		setSaving(true);
		try {
			await updateExperience({
				entries: draft.map((e) => ({
					type: e.type,
					title: e.title,
					company: e.company,
					startDate: e.startDate,
					endDate: e.isCurrent ? null : e.endDate,
					isCurrent: e.isCurrent,
				})),
			});
			setEditing(false);
			onRefetch();
		} finally {
			setSaving(false);
		}
	}, [draft, onRefetch]);

	const handleAdd = useCallback(() => {
		setDraft((prev) => [
			...prev,
			{
				id: crypto.randomUUID(),
				type: "work",
				title: "",
				company: "",
				startDate: null,
				endDate: null,
				isCurrent: false,
			},
		]);
	}, []);
	const handleRemove = useCallback(
		(i: number) => setDraft((prev) => prev.filter((_, idx) => idx !== i)),
		[],
	);
	const handleUpdate = useCallback(
		(i: number, field: keyof ExperienceEntry, value: unknown) => {
			setDraft((prev) =>
				prev.map((e, idx) => (idx === i ? { ...e, [field]: value } : e)),
			);
		},
		[],
	);

	const display = editing ? draft : entries;

	return (
		<div className="p-5">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-sm font-semibold text-gray-900">Experience</h3>
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
				<p className="text-sm text-gray-400 py-2">No experience entries yet.</p>
			) : (
				<div className="divide-y divide-gray-100">
					{display.map((entry, i) => (
						<ExperienceEntryRow
							key={editing ? i : entry.id}
							entry={entry}
							index={i}
							editing={editing}
							onUpdate={handleUpdate}
							onRemove={handleRemove}
							disabled={saving}
						/>
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
					Add experience
				</Button>
			) : null}
		</div>
	);
}
