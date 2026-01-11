import type React from "react";

interface BadgeProps {
	children: React.ReactNode;
	variant?: "default" | "primary" | "success" | "warning" | "error";
	className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = "default", className }) => {
	const variants = {
		default: "bg-[var(--gray-100)] text-[var(--gray-700)]",
		primary: "bg-[var(--aksob-primary)] text-white",
		success: "bg-[#D1FAE5] text-[var(--success)]", // Approximate 'bg 10%' with tailwind-like hex if vars unavailable, or use rgba
		warning: "bg-[#FEF3C7] text-[var(--warning)]",
		error: "bg-[#FEE2E2] text-[var(--error)]",
	};

	/* 
     Note: For exact "bg 10%" match with variables, we might ordinarily use 
     `bg-[color-mix(in srgb, var(--success), transparent 90%)]` 
     but simplistic backgrounds work for now.
  */

	return (
		<span
			className={`
        inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
        ${variants[variant]}
        ${className || ""}
      `}
		>
			{children}
		</span>
	);
};

interface NotificationBadgeProps {
	count: number;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count }) => {
	if (count <= 0) return null;

	return (
		<span
			className="
        absolute -top-1 -right-1
        flex items-center justify-center
        min-w-[18px] h-[18px] px-1
        bg-[var(--error)] text-white text-[10px] font-bold
        rounded-full
      "
		>
			{count > 99 ? "99+" : count}
		</span>
	);
};
