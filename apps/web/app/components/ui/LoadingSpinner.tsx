import type React from "react";

interface LoadingSpinnerProps {
	size?: "sm" | "md" | "lg";
	className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = "md", className }) => {
	const sizeClasses = {
		sm: "w-4 h-4 border-2",
		md: "w-6 h-6 border-2",
		lg: "w-10 h-10 border-[3px]",
	};

	return (
		<span
			className={`
        inline-block rounded-full 
        border-[var(--gray-200)] border-t-[var(--aksob-primary)] 
        animate-spin 
        ${sizeClasses[size]} 
        ${className || ""}
      `}
			role="img"
			aria-label="Loading"
		/>
	);
};

interface FullPageLoaderProps {
	text?: string;
}

export const FullPageLoader: React.FC<FullPageLoaderProps> = ({ text = "Loading..." }) => {
	return (
		<div className="fixed inset-0 z-[var(--z-overlay)] flex items-center justify-center bg-[rgba(255,255,255,0.8)] backdrop-blur-sm">
			<div className="flex flex-col items-center">
				<LoadingSpinner size="lg" />
				{text && (
					<p className="mt-4 text-sm font-medium text-[var(--gray-600)] animate-pulse">{text}</p>
				)}
			</div>
		</div>
	);
};
