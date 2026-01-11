import type React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, id, className, ...props }) => {
	return (
		<div className={`flex items-center ${className || ""}`}>
			<input
				id={id}
				type="checkbox"
				className="
          h-5 w-5 rounded border-2 border-[var(--gray-300)] text-[var(--aksob-primary)]
          focus:ring-[var(--aksob-primary)] focus:ring-offset-0 
          checked:bg-[var(--aksob-primary)] checked:border-[var(--aksob-primary)]
          cursor-pointer transition-colors duration-200
        "
				{...props}
			/>
			{label && (
				<label
					htmlFor={id}
					className="ml-2 block text-sm text-[var(--aksob-darkest)] cursor-pointer select-none"
				>
					{label}
				</label>
			)}
		</div>
	);
};
