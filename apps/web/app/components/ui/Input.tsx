import { Eye, EyeOff } from "lucide-react";
import type React from "react";
import { useState } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	helperText?: string;
	error?: boolean;
	fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
	label,
	helperText,
	error,
	fullWidth = true,
	className,
	id,
	type = "text",
	...props
}) => {
	const [showPassword, setShowPassword] = useState(false);
	const isPassword = type === "password";
	const inputType = isPassword ? (showPassword ? "text" : "password") : type;

	const baseInputStyles = `
    block rounded-md border text-[var(--aksob-darkest)] placeholder-[var(--gray-400)]
    focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-colors duration-200
    px-4 py-3 text-base h-12
  `;

	const stateStyles = error
		? "border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]"
		: "border-[var(--gray-200)] focus:border-[var(--aksob-primary)] focus:ring-[var(--aksob-primary)]";

	const widthClass = fullWidth ? "w-full" : "";

	return (
		<div className={`${widthClass} ${className || ""}`}>
			{label && (
				<label
					htmlFor={id}
					className="block text-sm font-medium text-[var(--aksob-darkest)] mb-1.5"
				>
					{label}
				</label>
			)}
			<div className="relative">
				<input
					id={id}
					type={inputType}
					className={`${baseInputStyles} ${stateStyles} ${widthClass} ${isPassword ? "pr-12" : ""}`}
					{...props}
				/>
				{isPassword && (
					<button
						type="button"
						className="absolute inset-y-0 right-0 flex items-center px-4 text-[var(--gray-400)] hover:text-[var(--aksob-primary)] focus:outline-none"
						onClick={() => setShowPassword(!showPassword)}
					>
						{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
					</button>
				)}
			</div>
			{helperText && (
				<p className={`mt-1 text-xs ${error ? "text-[var(--error)]" : "text-[var(--gray-600)]"}`}>
					{helperText}
				</p>
			)}
		</div>
	);
};
