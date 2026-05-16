import { ArrowRight, CheckCircle } from "lucide-react";
import type React from "react";
import { Button } from "~/components/ui/button";

interface DoneStepProps {
	onFinish: () => void;
}

export const DoneStep: React.FC<DoneStepProps> = ({ onFinish }) => {
	return (
		<div className="flex flex-col items-center text-center px-4 py-12">
			<div className="w-16 h-16 rounded-full bg-[var(--success)]/10 flex items-center justify-center mb-6">
				<CheckCircle size={32} className="text-[var(--success)]" />
			</div>
			<h2 className="text-2xl font-bold text-[var(--aksob-darkest)] mb-3">
				You're all set!
			</h2>
			<p className="text-sm text-[var(--gray-600)] max-w-md leading-relaxed mb-8">
				Your profile is ready. AKSOB will use this information to find the best
				connections for you.
			</p>

			<Button
				onClick={onFinish}
				size="lg"
				variant="primary"
				className="rounded-full px-8"
			>
				Find My First Connection
				<ArrowRight size={18} className="ml-2" />
			</Button>
		</div>
	);
};
