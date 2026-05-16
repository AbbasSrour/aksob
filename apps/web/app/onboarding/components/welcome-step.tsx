import {
	ArrowRight,
	BookOpen,
	Calendar,
	Globe,
	MessageCircle,
	Trophy,
	Users,
} from "lucide-react";
import type React from "react";

interface WelcomeStepProps {
	onNext: () => void;
}

const FEATURES = [
	{
		icon: Users,
		title: "Alumni Network",
		description: "Connect with graduates across industries and graduation years worldwide",
	},
	{
		icon: Trophy,
		title: "Success Stories",
		description: "Discover where fellow alumni are making an impact and find inspiration",
	},
	{
		icon: BookOpen,
		title: "News & Insights",
		description: "Stay updated with AKSOB news, research, and thought leadership",
	},
	{
		icon: Calendar,
		title: "Events",
		description: "Join talks, workshops, and networking events with the community",
	},
	{
		icon: MessageCircle,
		title: "Direct Messaging",
		description: "Reach out to alumni and faculty for advice, collaboration, or mentorship",
	},
	{
		icon: Globe,
		title: "Galaxy Explorer",
		description: "Browse the interactive map of alumni and visualize your connections",
	},
];

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
	return (
		<div className="flex flex-col items-center text-center">
			{/* Headline */}
			<h1
				className="text-3xl sm:text-4xl md:text-5xl font-light text-(--aksob-darkest) leading-[1.1] tracking-tight animate-editorial-reveal"
				style={{
					fontFamily: "var(--font-display)",
					animationDelay: "0.5s",
				}}
			>
				Your Alumni<br />
				Journey Starts Here
			</h1>

			{/* Body */}
			<p
				className="text-sm text-(--gray-500) leading-relaxed mt-6 max-w-lg animate-editorial-slide-up"
				style={{
					fontFamily: "var(--font-display)",
					animationDelay: "0.7s",
				}}
			>
				The AKSOB Alumni Network brings together graduates, faculty, and students.
				Share your story so others can discover you — and so you can discover them.
			</p>

			{/* Feature Grid */}
			<div
				className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 w-full max-w-2xl animate-editorial-slide-up"
				style={{ animationDelay: "0.85s" }}
			>
				{FEATURES.map((feature) => (
					<div
						key={feature.title}
						className="flex flex-col items-center text-center"
					>
						<div className="w-10 h-10 rounded-full bg-(--aksob-primary)/5 flex items-center justify-center mb-3">
							<feature.icon
								size={18}
								className="text-(--aksob-primary)"
							/>
						</div>
						<h3
							className="text-sm font-medium text-(--aksob-darkest) mb-1.5"
							style={{ fontFamily: "var(--font-display)" }}
						>
							{feature.title}
						</h3>
						<p className="text-xs text-(--gray-500) leading-relaxed max-w-[200px]">
							{feature.description}
						</p>
					</div>
				))}
			</div>

			{/* CTA */}
			<div
				className="mt-14 animate-editorial-slide-up"
				style={{ animationDelay: "1.0s" }}
			>
				<button
					type="button"
					onClick={onNext}
					className="group inline-flex items-center gap-3 px-10 py-4 bg-(--aksob-primary) text-white text-[11px] tracking-[0.15em] uppercase font-medium rounded-full hover:bg-(--aksob-secondary) transition-colors cursor-pointer"
					style={{ fontFamily: "var(--font-display)" }}
				>
					Build Your Profile
					<ArrowRight
						size={14}
						className="group-hover:translate-x-1 transition-transform"
					/>
				</button>
				<p className="text-[10px] text-(--gray-400) mt-4 tracking-wide">
					Takes about 3 minutes
				</p>
			</div>
		</div>
	);
};
