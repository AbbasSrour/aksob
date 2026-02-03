import type React from "react";

interface DividerProps {
	text?: string;
	className?: string;
}

export const Divider: React.FC<DividerProps> = ({ text, className }) => {
	if (text) {
		return (
			<div className={`relative flex items-center py-5 ${className || ""}`}>
				<div className="flex-grow border-t border-[var(--gray-200)]"></div>
				<span className="flex-shrink-0 mx-4 text-xs font-medium text-[var(--gray-500)] uppercase tracking-wider">
					{text}
				</span>
				<div className="flex-grow border-t border-[var(--gray-200)]"></div>
			</div>
		);
	}

	return (
		<div
			className={`border-t border-[var(--gray-200)] my-6 ${className || ""}`}
		></div>
	);
};
