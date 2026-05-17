import { BookOpen, Plus, Trash2 } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { programsQueries } from "~/app/auth/hooks/api/programs.queries";

export interface EducationEntry {
	programId: string;
	graduationYear: number | null;
	isPrimary: boolean;
}

interface EducationStepProps {
	data: EducationEntry[];
	onChange: (entries: EducationEntry[]) => void;
}

const currentYear = new Date().getFullYear();

export const EducationStep: React.FC<EducationStepProps> = ({
	data,
	onChange,
}) => {
	const { data: programs } = useQuery(programsQueries.active);
	const [entries, setEntries] = useState<EducationEntry[]>(
		data.length > 0
			? data
			: [{ programId: "", graduationYear: null, isPrimary: true }],
	);

	useEffect(() => {
		onChange(entries);
	}, [entries, onChange]);

	const addEntry = () => {
		setEntries((prev) => [
			...prev,
			{ programId: "", graduationYear: null, isPrimary: false },
		]);
	};

	const removeEntry = (index: number) => {
		setEntries((prev) => {
			const next = prev.filter((_, i) => i !== index);
			if (prev[index]?.isPrimary && next.length > 0) {
				next[0] = { ...next[0], isPrimary: true };
			}
			return next;
		});
	};

	const updateEntry = (index: number, field: Partial<EducationEntry>) => {
		setEntries((prev) => {
			const next = [...prev];
			next[index] = { ...next[index], ...field };
			if (field.isPrimary) {
				for (let i = 0; i < next.length; i++) {
					if (i !== index) next[i] = { ...next[i], isPrimary: false };
				}
			}
			return next;
		});
	};

	// Program IDs already selected in other entries (excluding empty)
	const selectedProgramIds = new Set(
		entries
			.map((entry, i) => entry.programId)
			.filter((id) => id !== ""),
	);

	return (
		<div className="relative">
			{/* Header */}
			<div className="mb-8">
				<h2
					className="text-xl font-light text-(--aksob-darkest) tracking-tight"
					style={{ fontFamily: "var(--font-display)" }}
				>
					Education
				</h2>
				<p className="text-sm text-(--gray-500) mt-1 leading-relaxed">
					What are you studying or where did you graduate?
				</p>
			</div>

			<div className="space-y-5">
				{entries.map((entry, i) => (
					<div
						key={`edu-${i}`}
						className="relative p-5 sm:p-6 rounded-xl border border-(--gray-200)/60 bg-white/40 group hover:border-(--aksob-primary)/15 transition-colors"
					>
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-2">
								<BookOpen size={14} className="text-(--gray-400)" />
								<span
									className="text-[10px] tracking-[0.2em] uppercase text-(--gray-400) font-medium"
									style={{ fontFamily: "var(--font-display)" }}
								>
									Program {i + 1}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<label className="flex items-center gap-1.5 text-xs text-(--gray-500) cursor-pointer">
									<input
										type="radio"
										name="primary-education"
										checked={entry.isPrimary}
										onChange={() => updateEntry(i, { isPrimary: true })}
										className="text-(--aksob-primary) accent-(--aksob-primary)"
									/>
									<span className="text-[10px] tracking-wide">Primary</span>
								</label>
								{entries.length > 1 && (
									<button
										type="button"
										onClick={() => removeEntry(i)}
										className="w-7 h-7 rounded-lg flex items-center justify-center text-(--gray-400) hover:text-(--error) hover:bg-(--error)/5 transition-all"
									>
										<Trash2 size={14} />
									</button>
								)}
							</div>
						</div>

						<div className="space-y-4">
							<div>
								<label
									className="block text-[10px] tracking-[0.15em] uppercase text-(--gray-500) mb-2 font-medium"
									style={{ fontFamily: "var(--font-display)" }}
								>
									Program
								</label>
								<select
									value={entry.programId}
									onChange={(e) =>
										updateEntry(i, { programId: e.target.value })
									}
									className="h-12 w-full rounded-xl border border-(--gray-200)/60 bg-white/80 px-4 text-sm text-(--aksob-darkest) focus:border-(--aksob-primary) focus:outline-none focus:ring-2 focus:ring-(--aksob-primary)/10 transition-all appearance-none"
									style={{ fontFamily: "var(--font-display)" }}
								>
									<option value="">Select a program</option>
									{programs?.map((p) => {
										const isSelectedElsewhere =
											selectedProgramIds.has(p.id) &&
											p.id !== entry.programId;
										return (
											<option
												key={p.id}
												value={p.id}
												disabled={isSelectedElsewhere}
											>
												{p.name}
											</option>
										);
									})}
								</select>
							</div>

							<div>
								<label
									className="block text-[10px] tracking-[0.15em] uppercase text-(--gray-500) mb-2 font-medium"
									style={{ fontFamily: "var(--font-display)" }}
								>
									Graduation Year
								</label>
								<input
									type="number"
									placeholder={String(currentYear)}
									value={entry.graduationYear ?? ""}
									onChange={(e) =>
										updateEntry(i, {
											graduationYear: e.target.value
												? Number(e.target.value)
												: null,
										})
									}
									min={1970}
									max={currentYear + 6}
									className="h-12 w-full rounded-xl border border-(--gray-200)/60 bg-white/80 px-4 text-sm text-(--aksob-darkest) focus:border-(--aksob-primary) focus:outline-none focus:ring-2 focus:ring-(--aksob-primary)/10 transition-all"
									style={{ fontFamily: "var(--font-display)" }}
								/>
							</div>
						</div>
					</div>
				))}

				<button
					type="button"
					onClick={addEntry}
					className="w-full py-4 border-2 border-dashed border-(--gray-300)/60 rounded-xl text-sm text-(--gray-500) hover:border-(--aksob-primary)/30 hover:text-(--aksob-primary) transition-all flex items-center justify-center gap-2 group"
				>
					<Plus
						size={16}
						className="group-hover:scale-110 transition-transform"
					/>
					<span
						className="text-[11px] tracking-[0.1em] uppercase font-medium"
						style={{ fontFamily: "var(--font-display)" }}
					>
						Add another program
					</span>
				</button>
			</div>
		</div>
	);
};
