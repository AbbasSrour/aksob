import { Plus, Trash2 } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";

export interface ExperienceEntry {
	type: string;
	title: string;
	company: string;
	startDate: string;
	endDate: string | null;
	isCurrent: boolean;
}

interface ExperienceStepProps {
	data: ExperienceEntry[];
	onChange: (entries: ExperienceEntry[]) => void;
}

const EXPERIENCE_TYPES = [
	{ value: "full-time", label: "Full-time" },
	{ value: "internship", label: "Internship" },
	{ value: "part-time", label: "Part-time" },
	{ value: "contract", label: "Contract" },
	{ value: "volunteer", label: "Volunteer" },
];

export const ExperienceStep: React.FC<ExperienceStepProps> = ({
	data,
	onChange,
}) => {
	const [entries, setEntries] = useState<ExperienceEntry[]>(
		data.length > 0
			? data
			: [
					{
						type: "full-time",
						title: "",
						company: "",
						startDate: "",
						endDate: null,
						isCurrent: false,
					},
				],
	);

	useEffect(() => {
		onChange(entries);
	}, [entries, onChange]);

	const addEntry = () => {
		setEntries((prev) => [
			...prev,
			{
				type: "full-time",
				title: "",
				company: "",
				startDate: "",
				endDate: null,
				isCurrent: false,
			},
		]);
	};

	const removeEntry = (index: number) => {
		setEntries((prev) => prev.filter((_, i) => i !== index));
	};

	const updateEntry = (index: number, field: Partial<ExperienceEntry>) => {
		setEntries((prev) => {
			const next = [...prev];
			next[index] = { ...next[index], ...field };
			return next;
		});
	};

	return (
		<div className="relative">
			{/* Header */}
			<div className="mb-8">
				<h2
					className="text-xl font-light text-(--aksob-darkest) tracking-tight"
					style={{ fontFamily: "var(--font-display)" }}
				>
					Experience
				</h2>
				<p className="text-sm text-(--gray-500) mt-1 leading-relaxed">
					Where have you worked?
				</p>
			</div>

			<div className="space-y-4">
				{entries.map((entry, i) => (
					<div
						key={`exp-${i}`}
						className="p-4 rounded-lg border border-[var(--gray-200)] relative"
					>
						<div className="flex items-center justify-between mb-3">
							<span className="text-xs font-medium text-[var(--gray-500)]">
								Position {i + 1}
							</span>
							{entries.length > 1 && (
								<button
									type="button"
									onClick={() => removeEntry(i)}
									className="text-[var(--gray-400)] hover:text-[var(--error)] transition-colors"
								>
									<Trash2 size={16} />
								</button>
							)}
						</div>

						<div className="space-y-3">
							<select
								value={entry.type}
								onChange={(e) => updateEntry(i, { type: e.target.value })}
								className="h-12 w-full rounded-md border border-[var(--gray-200)] bg-white px-4 text-[var(--aksob-darkest)] focus:border-[var(--aksob-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--aksob-primary)]/20"
							>
								{EXPERIENCE_TYPES.map((t) => (
									<option key={t.value} value={t.value}>
										{t.label}
									</option>
								))}
							</select>
							<Input
								label="Title"
								placeholder="e.g. Senior Analyst"
								value={entry.title}
								onChange={(e) => updateEntry(i, { title: e.target.value })}
								fullWidth
							/>
							<Input
								label="Company"
								placeholder="Company or institution"
								value={entry.company}
								onChange={(e) => updateEntry(i, { company: e.target.value })}
								fullWidth
							/>
							<div className="grid grid-cols-2 gap-3">
								<Input
									type="date"
									label="Start Date"
									value={entry.startDate}
									onChange={(e) =>
										updateEntry(i, { startDate: e.target.value })
									}
									fullWidth
								/>
								{!entry.isCurrent && (
									<Input
										type="date"
										label="End Date"
										value={entry.endDate ?? ""}
										onChange={(e) =>
											updateEntry(i, { endDate: e.target.value || null })
										}
										fullWidth
									/>
								)}
							</div>
							<Checkbox
								id={`is-current-${i}`}
								label="I currently work here"
								checked={entry.isCurrent}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									updateEntry(i, {
										isCurrent: e.target.checked,
										endDate: e.target.checked ? null : entry.endDate,
									})
								}
								className="text-sm text-(--gray-600)"
							/>
						</div>
					</div>
				))}

				<button
					type="button"
					onClick={addEntry}
					className="w-full py-3 border-2 border-dashed border-[var(--gray-300)] rounded-lg text-sm text-[var(--gray-500)] hover:border-[var(--aksob-primary)] hover:text-[var(--aksob-primary)] transition-colors flex items-center justify-center gap-2"
				>
					<Plus size={16} />
					Add another position
				</button>
			</div>
		</div>
	);
};
