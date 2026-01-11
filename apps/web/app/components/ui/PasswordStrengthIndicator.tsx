import type React from "react";

interface PasswordStrengthIndicatorProps {
	password?: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
	password = "",
}) => {
	const getStrength = (pass: string) => {
		let score = 0;
		if (!pass) return 0;
		if (pass.length >= 8) score++;
		if (/[A-Z]/.test(pass)) score++;
		if (/[a-z]/.test(pass)) score++;
		if (/[0-9]/.test(pass)) score++;
		if (/[^A-Za-z0-9]/.test(pass)) score++;
		return Math.min(score, 4);
	};

	const strength = getStrength(password);

	const getLabel = () => {
		switch (strength) {
			case 0:
				return "";
			case 1:
				return "Weak";
			case 2:
				return "Fair";
			case 3:
				return "Good";
			case 4:
				return "Strong";
		}
	};

	const getColor = () => {
		switch (strength) {
			case 1:
				return "bg-[var(--error)]";
			case 2:
				return "bg-[var(--warning)]";
			case 3:
				return "bg-[var(--info)]";
			case 4:
				return "bg-[var(--success)]";
			default:
				return "bg-[var(--gray-200)]";
		}
	};

	const bars = [1, 2, 3, 4];

	if (!password) return null;

	return (
		<div className="mt-2">
			<div className="flex gap-1 h-1 w-full">
				{bars.map((level) => (
					<div
						key={level}
						className={`h-full flex-1 rounded-full transition-colors duration-300 ${
							strength >= level ? getColor() : "bg-[var(--gray-200)]"
						}`}
					/>
				))}
			</div>
			<div className="text-right mt-1">
				<span
					className={`text-xs font-medium ${strength >= 4 ? "text-[var(--success)]" : "text-[var(--gray-600)]"}`}
				>
					{getLabel()}
				</span>
			</div>
		</div>
	);
};
