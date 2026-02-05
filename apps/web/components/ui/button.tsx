import type React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
	size?: "sm" | "md" | "lg";
	isLoading?: boolean;
	fullWidth?: boolean;
	leftIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
	children,
	variant = "primary",
	size = "md",
	isLoading,
	fullWidth,
	leftIcon,
	className,
	disabled,
	...props
}) => {
	const baseStyles =
		"inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

	const variants = {
		primary:
			"bg-[var(--aksob-primary)] text-white hover:bg-[var(--aksob-secondary)] active:scale-98 focus:ring-[var(--aksob-primary)]",
		secondary:
			"bg-transparent text-[var(--aksob-primary)] border border-[var(--aksob-primary)] hover:bg-[var(--pale-mint)]",
		ghost: "bg-transparent text-[var(--gray-600)] hover:bg-[var(--gray-200)]",
		danger: "bg-[var(--error)] text-white hover:bg-[#DC2626]",
		outline:
			"bg-white text-[var(--gray-700)] border border-[var(--gray-300)] hover:bg-[var(--gray-50)] hover:border-[var(--gray-400)]",
	};

	const sizes = {
		sm: "px-4 py-2 text-xs h-8",
		md: "px-6 py-3 text-sm h-11",
		lg: "px-8 py-4 text-base h-[52px]",
	};

	const widthClass = fullWidth ? "w-full" : "";

	return (
		<button
			className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} rounded-md ${className || ""}`}
			disabled={disabled || isLoading}
			{...props}
		>
			{isLoading ? (
				<svg
					className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					role="img"
					aria-label="Loading"
				>
					<title>Loading</title>
					<circle
						className="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						strokeWidth="4"
					/>
					<path
						className="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					/>
				</svg>
			) : leftIcon ? (
				<span className="mr-2">{leftIcon}</span>
			) : null}
			{children}
		</button>
	);
};
