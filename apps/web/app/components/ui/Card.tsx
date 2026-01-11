import type React from "react";

interface CardProps {
	children: React.ReactNode;
	variant?: "default" | "outlined" | "glass" | "elevated";
	className?: string;
}

export const Card: React.FC<CardProps> = ({ children, variant = "default", className }) => {
	const baseStyles = "rounded-[var(--radius-lg)] p-6 transition-all duration-200";

	const variants = {
		default: "bg-white shadow-[var(--shadow-md)]",
		outlined: "bg-white border border-[var(--gray-200)]",
		glass:
			"bg-[rgba(255,255,255,0.95)] border border-[rgba(255,255,255,0.2)] shadow-[var(--shadow-md)] backdrop-blur-md",
		elevated: "bg-white shadow-[var(--shadow-lg)]",
	};

	return <div className={`${baseStyles} ${variants[variant]} ${className || ""}`}>{children}</div>;
};
