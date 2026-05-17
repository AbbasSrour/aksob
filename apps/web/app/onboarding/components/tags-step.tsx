import { Plus, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

interface TagsStepProps {
	data: { skills: string[]; goals: string[]; hobbies: string[] };
	onChange: (data: {
		skills: string[];
		goals: string[];
		hobbies: string[];
	}) => void;
}

interface TagSectionProps {
	title: string;
	description: string;
	value: string[];
	onChange: (v: string[]) => void;
}

const TagSection: React.FC<TagSectionProps> = ({
	title,
	description,
	value,
	onChange,
}) => {
	const [input, setInput] = useState("");
	const [focused, setFocused] = useState(false);

	const addTag = () => {
		const trimmed = input.trim();
		if (trimmed && !value.includes(trimmed)) {
			onChange([...value, trimmed]);
		}
		setInput("");
	};

	const removeTag = (tag: string) => {
		onChange(value.filter((t) => t !== tag));
	};

	return (
		<div className="pb-8 border-b border-(--gray-200) last:border-b-0">
			<div className="mb-4">
				<h3
					className="text-sm font-medium text-(--aksob-darkest) tracking-wide"
					style={{ fontFamily: "var(--font-display)" }}
				>
					{title}
				</h3>
				<p className="text-xs text-(--gray-500) mt-0.5">{description}</p>
			</div>

			{/* Tags */}
			<div className="flex flex-wrap gap-2 mb-3">
				{value.map((tag) => (
					<span
						key={tag}
						className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-(--aksob-primary)/20 bg-(--aksob-primary)/5 text-xs font-medium text-(--aksob-primary) hover:bg-(--aksob-primary)/10 transition-colors cursor-default"
					>
						{tag}
						<button
							type="button"
							onClick={() => removeTag(tag)}
							className="opacity-60 group-hover:opacity-100 hover:text-(--error) transition-all cursor-pointer"
						>
							<X size={12} strokeWidth={2.5} />
						</button>
					</span>
				))}
			</div>

			{/* Input */}
			<div
				className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-all ${
					focused
						? "border-(--aksob-primary) ring-2 ring-(--aksob-primary)/10"
						: "border-(--gray-200)"
				}`}
			>
				<input
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							addTag();
						}
					}}
					onFocus={() => setFocused(true)}
					onBlur={() => setFocused(false)}
					placeholder="Type and press Enter"
					className="flex-1 text-sm text-(--aksob-darkest) placeholder:text-(--gray-400) bg-transparent outline-none"
					style={{ fontFamily: "var(--font-display)" }}
				/>
				<button
					type="button"
					onClick={addTag}
					className="w-7 h-7 rounded-lg bg-(--gray-100) text-(--gray-500) hover:bg-(--aksob-primary) hover:text-white transition-colors flex items-center justify-center cursor-pointer"
				>
					<Plus size={14} strokeWidth={2.5} />
				</button>
			</div>
		</div>
	);
};

export const TagsStep: React.FC<TagsStepProps> = ({ data, onChange }) => {
	const [state, setState] = useState(data);

	useEffect(() => {
		onChange(state);
	}, [state, onChange]);

	return (
		<div className="relative">
			{/* Header */}
			<div className="mb-8">
				<h2
					className="text-xl font-light text-(--aksob-darkest) tracking-tight"
					style={{ fontFamily: "var(--font-display)" }}
				>
					Skills, Goals &amp; Interests
				</h2>
				<p className="text-sm text-(--gray-500) mt-1 leading-relaxed">
					Tell us what you bring and what you're looking for
				</p>
			</div>

			{/* Sections */}
			<div className="space-y-6">
				<TagSection
					title="Skills"
					description="What are you good at?"
					value={state.skills}
					onChange={(skills) => setState((s) => ({ ...s, skills }))}
				/>
				<TagSection
					title="Goals"
					description="What are you hoping to achieve?"
					value={state.goals}
					onChange={(goals) => setState((s) => ({ ...s, goals }))}
				/>
				<TagSection
					title="Interests"
					description="What do you enjoy outside of work?"
					value={state.hobbies}
					onChange={(hobbies) => setState((s) => ({ ...s, hobbies }))}
				/>
			</div>
		</div>
	);
};
