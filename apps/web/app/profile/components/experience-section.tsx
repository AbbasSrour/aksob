import { Plus, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { type ExperienceEntry, updateExperience } from "~/app/lib/users";
import { ExperienceEntryRow } from "~/app/profile/components/experience-entry";
import { Button } from "~/components/ui/button";

interface Props {
	entries: ExperienceEntry[];
	onRefetch: () => void;
	isEditing?: boolean;
	onDone?: () => void;
}

export function ExperienceSection({
	entries,
	onRefetch,
	isEditing = false,
	onDone,
}: Props) {
	const [draft, setDraft] = useState<ExperienceEntry[]>([]);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (isEditing) {
			setDraft(entries.map((e) => ({ ...e })));
		}
	}, [isEditing, entries]);

	const handleCancel = useCallback(() => {
		setDraft([]);
		onDone?.();
	}, [onDone]);

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
			onRefetch();
			onDone?.();
		} finally {
			setSaving(false);
		}
	}, [draft, onRefetch, onDone]);

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

	const display = isEditing ? draft : entries;

	return (
		<div className="p-5">
			{display.length === 0 && !isEditing ? (
				<p className="text-sm text-gray-400 py-2">No experience entries yet.</p>
			) : (
				<div className="divide-y divide-gray-100">
					{display.map((entry, i) => (
						<ExperienceEntryRow
							key={isEditing ? i : entry.id}
							entry={entry}
							index={i}
							editing={isEditing}
							onUpdate={handleUpdate}
							onRemove={handleRemove}
							disabled={saving}
						/>
					))}
				</div>
			)}
			{isEditing ? (
				<div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
					<Button
						variant="ghost"
						size="sm"
						onClick={handleAdd}
						leftIcon={<Plus size={14} />}
						disabled={saving}
					>
						Add experience
					</Button>
					<div className="flex-1" />
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
			) : null}
		</div>
	);
}
