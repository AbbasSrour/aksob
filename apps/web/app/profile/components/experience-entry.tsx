import { Briefcase } from "lucide-react";
import type { ExperienceEntry } from "~/app/lib/users";

interface Props {
	entry: ExperienceEntry;
	index: number;
	editing: boolean;
	onUpdate: (
		index: number,
		field: keyof ExperienceEntry,
		value: unknown,
	) => void;
	onRemove: (index: number) => void;
	disabled?: boolean;
}

export function ExperienceEntryRow({
	entry,
	index,
	editing,
	onUpdate,
	onRemove,
	disabled,
}: Props) {
	if (!editing) {
		return (
			<div className="flex items-center justify-between py-3">
				<div className="flex items-center gap-3 min-w-0">
					<div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
						<Briefcase size={16} className="text-gray-500" />
					</div>
					<div className="min-w-0">
						<p className="text-sm font-medium text-gray-900 truncate">
							{entry.title}
							{entry.isCurrent ? (
								<span className="ml-1.5 text-xs text-emerald-600 font-normal">
									(Current)
								</span>
							) : null}
						</p>
						<p className="text-xs text-gray-400">
							{entry.company}
							{entry.startDate ? ` · ${entry.startDate}` : ""}
							{entry.endDate && !entry.isCurrent ? ` — ${entry.endDate}` : ""}
						</p>
					</div>
				</div>
			</div>
		);
	}

	const inputClass =
		"h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:ring-2 focus:ring-[var(--aksob-primary)]/20 focus:border-[var(--aksob-primary)] transition disabled:opacity-50";

	return (
		<div className="flex items-start gap-3 py-3">
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
				<select
					className={inputClass}
					value={entry.type}
					onChange={(e) => onUpdate(index, "type", e.target.value)}
					disabled={disabled}
				>
					<option value="work">Work</option>
					<option value="internship">Internship</option>
					<option value="volunteer">Volunteer</option>
				</select>
				<input
					className={inputClass}
					placeholder="Job title"
					value={entry.title}
					onChange={(e) => onUpdate(index, "title", e.target.value)}
					disabled={disabled}
				/>
				<input
					className={inputClass}
					placeholder="Company"
					value={entry.company}
					onChange={(e) => onUpdate(index, "company", e.target.value)}
					disabled={disabled}
				/>
				<input
					type="date"
					className={inputClass}
					value={entry.startDate ?? ""}
					onChange={(e) => onUpdate(index, "startDate", e.target.value || null)}
					disabled={disabled}
				/>
				{!entry.isCurrent && (
					<input
						type="date"
						className={inputClass}
						value={entry.endDate ?? ""}
						onChange={(e) => onUpdate(index, "endDate", e.target.value || null)}
						disabled={disabled}
					/>
				)}
				<label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
					<input
						type="checkbox"
						checked={entry.isCurrent}
						onChange={(e) => {
							onUpdate(index, "isCurrent", e.target.checked);
							if (e.target.checked) onUpdate(index, "endDate", null);
						}}
						disabled={disabled}
						className="rounded"
					/>
					Current position
				</label>
			</div>
			<button
				type="button"
				className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 transition disabled:opacity-50"
				onClick={() => onRemove(index)}
				disabled={disabled}
				aria-label="Remove entry"
			>
				×
			</button>
		</div>
	);
}
