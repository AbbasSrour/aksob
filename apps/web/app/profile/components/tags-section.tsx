import { Save, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { type TagsData, updateTags } from "~/app/lib/users";
import { Button } from "~/components/ui/button";

interface Props {
	tags: TagsData;
	onRefetch: () => void;
	isEditing?: boolean;
	onDone?: () => void;
}

function ChipInput({
	label,
	values,
	onChange,
	disabled,
}: {
	label: string;
	values: string[];
	onChange: (v: string[]) => void;
	disabled?: boolean;
}) {
	const [input, setInput] = useState("");

	const handleAdd = useCallback(() => {
		const t = input.trim();
		if (t && !values.includes(t)) onChange([...values, t]);
		setInput("");
	}, [input, values, onChange]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter") {
				e.preventDefault();
				handleAdd();
			}
			if (e.key === "Backspace" && !input && values.length > 0)
				onChange(values.slice(0, -1));
		},
		[handleAdd, input, values, onChange],
	);

	return (
		<div>
			<p className="text-xs text-gray-400 mb-1.5 block">{label}</p>
			<div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-[var(--aksob-primary)]/20 focus-within:border-[var(--aksob-primary)] transition">
				{values.map((v) => (
					<span
						key={v}
						className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-sm text-gray-700"
					>
						{v}
						<button
							type="button"
							className="text-gray-400 hover:text-red-500"
							onClick={() => onChange(values.filter((x) => x !== v))}
							disabled={disabled}
						>
							<X size={12} />
						</button>
					</span>
				))}
				<input
					className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-sm text-gray-700"
					placeholder="Type and press Enter"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={handleKeyDown}
					disabled={disabled}
				/>
			</div>
		</div>
	);
}

export function TagsSection({
	tags,
	onRefetch,
	isEditing = false,
	onDone,
}: Props) {
	const [draft, setDraft] = useState<TagsData>({
		skills: [],
		goals: [],
		hobbies: [],
	});
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (isEditing) {
			setDraft({
				skills: [...tags.skills],
				goals: [...tags.goals],
				hobbies: [...tags.hobbies],
			});
		}
	}, [isEditing, tags]);

	const handleCancel = useCallback(() => {
		setDraft({ skills: [], goals: [], hobbies: [] });
		onDone?.();
	}, [onDone]);
	const handleSave = useCallback(async () => {
		setSaving(true);
		try {
			await updateTags(draft);
			onRefetch();
			onDone?.();
		} finally {
			setSaving(false);
		}
	}, [draft, onRefetch, onDone]);

	const renderChips = (items: string[]) =>
		items.length === 0 ? (
			<p className="text-sm text-gray-400">None added</p>
		) : (
			<div className="flex flex-wrap gap-1.5">
				{items.map((item) => (
					<span
						key={item}
						className="inline-flex px-2.5 py-1 rounded-full bg-gray-100 text-sm text-gray-700"
					>
						{item}
					</span>
				))}
			</div>
		);

	return (
		<div className="p-5">
			{isEditing ? (
				<div className="space-y-4">
					<ChipInput
						label="Skills"
						values={draft.skills}
						onChange={(v) => setDraft((p) => ({ ...p, skills: v }))}
						disabled={saving}
					/>
					<ChipInput
						label="Goals"
						values={draft.goals}
						onChange={(v) => setDraft((p) => ({ ...p, goals: v }))}
						disabled={saving}
					/>
					<ChipInput
						label="Hobbies"
						values={draft.hobbies}
						onChange={(v) => setDraft((p) => ({ ...p, hobbies: v }))}
						disabled={saving}
					/>
					<div className="flex items-center gap-3 pt-2">
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
				</div>
			) : (
				<div className="space-y-4">
					<div>
						<p className="text-xs text-gray-400 mb-1.5 block">Skills</p>
						{renderChips(tags.skills)}
					</div>
					<div>
						<p className="text-xs text-gray-400 mb-1.5 block">Goals</p>
						{renderChips(tags.goals)}
					</div>
					<div>
						<p className="text-xs text-gray-400 mb-1.5 block">Hobbies</p>
						{renderChips(tags.hobbies)}
					</div>
				</div>
			)}
		</div>
	);
}
