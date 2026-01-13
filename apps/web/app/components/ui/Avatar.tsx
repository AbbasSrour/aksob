import type React from "react";

type AvatarStatus = "online" | "offline" | "busy";

interface AvatarProps {
	src?: string;
	name: string; // Used for initials and alt text
	size?: "xs" | "sm" | "md" | "lg" | "xl";
	status?: AvatarStatus;
	className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, name, size = "md", status, className }) => {
	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.slice(0, 2)
			.join("")
			.toUpperCase();
	};

	const sizeClasses = {
		xs: "w-6 h-6 text-[10px]",
		sm: "w-8 h-8 text-xs",
		md: "w-10 h-10 text-sm",
		lg: "w-14 h-14 text-xl",
		xl: "w-20 h-20 text-2xl",
	};

	const statusColors = {
		online: "bg-[var(--success)]",
		offline: "bg-[var(--gray-400)]",
		busy: "bg-[var(--error)]",
	};

	const statusSizes = {
		xs: "w-2 h-2",
		sm: "w-2.5 h-2.5",
		md: "w-3 h-3",
		lg: "w-4 h-4",
		xl: "w-5 h-5",
	};

	return (
		<div className={`relative inline-block ${className || ""}`}>
			<div
				className={`
          ${sizeClasses[size]}
          rounded-full flex items-center justify-center
          overflow-hidden bg-[var(--aksob-muted)]
          text-white font-semibold select-none
        `}
			>
				{src ? (
					<img src={src} alt={name} className="w-full h-full object-cover" />
				) : (
					<span>{getInitials(name)}</span>
				)}
			</div>

			{status && (
				<span
					className={`
            absolute bottom-0 right-0 block rounded-full border-2 border-white
            ${statusColors[status]}
            ${statusSizes[size]}
          `}
					title={status}
				/>
			)}
		</div>
	);
};
