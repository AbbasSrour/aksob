import { useQuery } from "@tanstack/react-query";
import { Plus, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "~/app/lib/api";
import { type EducationEntry, updateEducation } from "~/app/lib/users";
import { EducationEntryRow } from "~/app/profile/components/education-entry";
import { Button } from "~/components/ui/button";

interface Props {
	entries: EducationEntry[];
	onRefetch?: () => void;
	isEditing?: boolean;
	onDone?: () => void;
}

export function EducationSection({
	entries,
	onRefetch,
	isEditing = false,
	onDone,
}: Props) {
	const [draft, setDraft] = useState<EducationEntry[]>([]);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (isEditing) {
			setDraft(entries.map((e) => ({ ...e })));
		}
	}, [isEditing, entries]);

	const { data: programsData, isLoading: programsLoading } = useQuery({
		queryKey: ["programs"],
		queryFn: () =>
			apiFetch<{ status: string; data: Array<{ id: string; name: string }> }>(
				"/api/programs",
			),
	});
	const programs = programsData?.data ?? [];

	const handleCancel = useCallback(() => {
		setDraft([]);
		onDone?.();
	}, [onDone]);

	const handleSave = useCallback(async () => {
		setSaving(true);
		try {
			await updateEducation({
				entries: draft.map((e) => ({
					programId: e.programId,
					graduationYear: e.graduationYear,
					isPrimary: e.isPrimary,
				})),
			});
			onRefetch?.();
			onDone?.();
		} finally {
			setSaving(false);
		}
	}, [draft, onRefetch, onDone]);

	const handleAdd = useCallback(() => {
		setDraft((prev) => [
			...prev,
			{
				programId: "",
				name: "",
				graduationYear: null,
				isPrimary: prev.length === 0,
			},
		]);
	}, []);

	const handleRemove = useCallback((index: number) => {
		setDraft((prev) => {
			const next = prev.filter((_, i) => i !== index);
			if (prev[index]?.isPrimary && next.length > 0) {
				next[0] = { ...next[0], isPrimary: true };
			}
			return next;
		});
	}, []);

	const handleUpdate = useCallback(
		(index: number, field: keyof EducationEntry, value: unknown) => {
			setDraft((prev) => {
				if (field === "isPrimary" && value) {
					return prev.map((e, i) => ({ ...e, isPrimary: i === index }));
				}
				return prev.map((entry, i) => {
					if (i !== index) return entry;
					if (field === "programId") {
						const program = programs.find((p) => p.id === value);
						return {
							...entry,
							programId: value as string,
							name: program?.name ?? entry.name,
						};
					}
					return { ...entry, [field]: value };
				});
			});
		},
		[programs],
	);

	const displayEntries = isEditing ? draft : entries;

	return (
		<div className="p-5">
			{displayEntries.length === 0 && !isEditing ? (
				<p className="text-sm text-gray-400 py-2">No education entries yet.</p>
			) : (
				<div className="divide-y divide-gray-100">
					{displayEntries.map((entry, i) => (
						<EducationEntryRow
							key={i}
							entry={entry}
							index={i}
							editing={isEditing}
							programs={programs}
							programsLoading={programsLoading}
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
						Add education
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
