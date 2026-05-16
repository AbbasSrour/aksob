import { GraduationCap } from "lucide-react";
import type { EducationEntry } from "~/app/lib/users";

interface Props {
	entry: EducationEntry;
	index: number;
	editing: boolean;
	programs: Array<{ id: string; name: string }>;
	programsLoading?: boolean;
	onUpdate: (
		index: number,
		field: keyof EducationEntry,
		value: unknown,
	) => void;
	onRemove: (index: number) => void;
	disabled?: boolean;
}

export function EducationEntryRow({
	entry,
	index,
	editing,
	programs,
	programsLoading,
	onUpdate,
	onRemove,
	disabled,
}: Props) {
	if (!editing) {
		return (
			<div className="flex items-center justify-between py-3">
				<div className="flex items-center gap-3 min-w-0">
					<div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
						<GraduationCap size={16} className="text-gray-500" />
					</div>
					<div className="min-w-0">
						<p className="text-sm font-medium text-gray-900 truncate">
							{entry.name}
							{entry.isPrimary ? (
								<span className="ml-1.5 text-xs text-[var(--aksob-primary)] font-normal">
									(Primary)
								</span>
							) : null}
						</p>
						<p className="text-xs text-gray-400">
							{entry.graduationYear ?? "No graduation year"}
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex items-start gap-3 py-3">
			<div className="grid grid-cols-1 sm:grid-cols-12 gap-3 flex-1">
				<div className="sm:col-span-5">
					<select
						className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:ring-2 focus:ring-[var(--aksob-primary)]/20 focus:border-[var(--aksob-primary)] transition disabled:opacity-50"
						value={entry.programId}
						onChange={(e) => onUpdate(index, "programId", e.target.value)}
						disabled={disabled || programsLoading}
					>
						<option value="">
							{programsLoading
								? "Loading programs..."
								: programs.length === 0
									? "No programs available"
									: "Select program"}
						</option>
						{programs.map((p) => (
							<option key={p.id} value={p.id}>
								{p.name}
							</option>
						))}
					</select>
				</div>
				<input
					type="number"
					placeholder="Grad year"
					className="sm:col-span-3 h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:ring-2 focus:ring-[var(--aksob-primary)]/20 focus:border-[var(--aksob-primary)] transition disabled:opacity-50"
					value={entry.graduationYear ?? ""}
					onChange={(e) =>
						onUpdate(
							index,
							"graduationYear",
							e.target.value ? Number(e.target.value) : null,
						)
					}
					disabled={disabled}
				/>
				<label className="sm:col-span-3 flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
					<input
						type="radio"
						name="primaryEducation"
						checked={entry.isPrimary}
						onChange={() => onUpdate(index, "isPrimary", true)}
						disabled={disabled}
						className="h-4 w-4 text-[var(--aksob-primary)] border-gray-300 focus:ring-[var(--aksob-primary)]"
					/>
					<span className="text-xs">Primary</span>
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
