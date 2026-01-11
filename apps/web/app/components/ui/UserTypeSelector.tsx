import { Award, Briefcase, GraduationCap } from "lucide-react";
import type React from "react";

interface UserTypeOption {
	id: "student" | "alumni" | "faculty";
	label: string;
	subtext: string;
	icon: React.ElementType;
}

interface UserTypeSelectorProps {
	value?: string;
	onChange: (value: "student" | "alumni" | "faculty") => void;
	error?: boolean;
}

const options: UserTypeOption[] = [
	{
		id: "student",
		label: "Student",
		subtext: "Current LAU student",
		icon: GraduationCap,
	},
	{
		id: "alumni",
		label: "Alumni",
		subtext: "LAU graduate",
		icon: Award,
	},
	{
		id: "faculty",
		label: "Faculty",
		subtext: "Faculty or staff",
		icon: Briefcase,
	},
];

export const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({ value, onChange, error }) => {
	return (
		<div className="space-y-2">
			<span className="block text-sm font-medium text-[var(--aksob-darkest)]">I am a...</span>
			<div className="grid grid-cols-3 gap-4">
				{options.map((option) => {
					const isSelected = value === option.id;
					const Icon = option.icon;
					return (
						<button
							key={option.id}
							type="button"
							onClick={() => onChange(option.id)}
							className={`
              flex flex-col items-center justify-center text-center p-3 h-[100px] rounded-xl border-2 transition-all duration-200
              ${
								isSelected
									? "border-[var(--aksob-primary)] bg-[var(--pale-mint)]"
									: "border-[var(--gray-200)] bg-white hover:border-[var(--gray-300)] hover:bg-[var(--gray-50)]"
							}
              ${error ? "border-[var(--error)]" : ""}
            `}
						>
							<Icon
								size={24}
								className={`mb-2 ${
									isSelected ? "text-[var(--aksob-primary)]" : "text-[var(--gray-500)]"
								}`}
							/>
							<span
								className={`text-xs font-medium block ${
									isSelected ? "text-[var(--aksob-darkest)]" : "text-[var(--gray-700)]"
								}`}
							>
								{option.label}
							</span>
							<span className="text-[10px] text-[var(--gray-500)] leading-tight mt-0.5">
								{option.subtext}
							</span>
						</button>
					);
				})}
			</div>
		</div>
	);
};
