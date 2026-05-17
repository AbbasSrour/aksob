import { Eye, Mail, Phone, Users } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Checkbox } from "~/components/ui/checkbox";

export interface SettingsData {
	isVisibleInGalaxy: boolean;
	emailVisible: boolean;
	phoneNumberVisible: boolean;
	connectionTypes: string[];
}

interface SettingsStepProps {
	data: SettingsData;
	userType: string;
	onChange: (data: SettingsData) => void;
}

const CONNECTION_TYPE_LABELS: Record<string, string> = {
	mentorship: "Mentorship",
	career_coaching: "Career Coaching",
	study_partner: "Study Partner",
	buddy: "Buddy",
	research: "Research",
	project: "Project",
};

const ELIGIBLE_TYPES: Record<string, string[]> = {
	alumni: ["mentorship", "career_coaching", "research", "project"],
	student: [
		"mentorship",
		"career_coaching",
		"study_partner",
		"buddy",
		"research",
		"project",
	],
	faculty: ["mentorship", "career_coaching", "research", "project"],
};

const Toggle: React.FC<{
	icon: React.ElementType;
	title: string;
	description: string;
	checked: boolean;
	disabled?: boolean;
	onChange: (v: boolean) => void;
}> = ({ icon: Icon, title, description, checked, disabled, onChange }) => (
	<div
		className={`flex items-start gap-4 p-4 rounded-xl border border-(--gray-200) transition-all ${
			disabled ? "opacity-50" : "hover:border-(--gray-300)"
		}`}
	>
		<div className="w-10 h-10 rounded-lg bg-(--gray-100) flex items-center justify-center shrink-0">
			<Icon size={18} className="text-(--gray-600)" />
		</div>
		<div className="flex-1 min-w-0">
			<p className="text-sm font-medium text-(--aksob-darkest)">{title}</p>
			<p className="text-xs text-(--gray-500) mt-0.5">{description}</p>
		</div>
		<button
			type="button"
			disabled={disabled}
			onClick={() => onChange(!checked)}
			className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
				disabled ? "cursor-not-allowed" : "cursor-pointer"
			} ${checked ? "bg-(--aksob-primary)" : "bg-(--gray-300)"}`}
		>
			<span
				className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
					checked ? "translate-x-6" : "translate-x-1"
				}`}
			/>
		</button>
	</div>
);

export const SettingsStep: React.FC<SettingsStepProps> = ({
	data,
	userType,
	onChange,
}) => {
	const [state, setState] = useState(data);

	useEffect(() => {
		onChange(state);
	}, [state, onChange]);

	const eligibleList = ELIGIBLE_TYPES[userType] ?? [];

	const toggleConnectionType = (ct: string) => {
		if (!state.isVisibleInGalaxy) return;
		setState((s) => ({
			...s,
			connectionTypes: s.connectionTypes.includes(ct)
				? s.connectionTypes.filter((t) => t !== ct)
				: [...s.connectionTypes, ct],
		}));
	};

	return (
		<div className="relative">
			<div className="mb-8">
				<h2
					className="text-xl font-light text-(--aksob-darkest) tracking-tight"
					style={{ fontFamily: "var(--font-display)" }}
				>
					Visibility Settings
				</h2>
				<p className="text-sm text-(--gray-500) mt-1 leading-relaxed">
					How would you like to appear to the community?
				</p>
			</div>

			<div className="space-y-3">
				<Toggle
					icon={Eye}
					title="Join the Galaxy"
					description="Your profile will be visible in the 3D galaxy visualization for others to discover."
					checked={state.isVisibleInGalaxy}
					onChange={(v) => {
						setState((s) => ({
							...s,
							isVisibleInGalaxy: v,
							// Turn off dependent settings when hidden
							...(v
								? {}
								: {
										emailVisible: false,
										phoneNumberVisible: false,
										connectionTypes: [],
									}),
						}));
					}}
				/>
				<Toggle
					icon={Mail}
					title="Show email"
					description="Your email will be visible in the galaxy for others to see."
					checked={state.emailVisible}
					disabled={!state.isVisibleInGalaxy}
					onChange={(v) => setState((s) => ({ ...s, emailVisible: v }))}
				/>
				<Toggle
					icon={Phone}
					title="Show phone number"
					description="Your phone number will be visible in the galaxy for others to see."
					checked={state.phoneNumberVisible}
					disabled={!state.isVisibleInGalaxy}
					onChange={(v) => setState((s) => ({ ...s, phoneNumberVisible: v }))}
				/>
			</div>

			{eligibleList.length > 0 && (
				<div
					className={`mt-10 ${!state.isVisibleInGalaxy ? "opacity-40 pointer-events-none" : ""}`}
				>
					<div className="mb-4">
						<h3
							className="text-sm font-medium text-(--aksob-darkest) tracking-wide"
							style={{ fontFamily: "var(--font-display)" }}
						>
							Connection Preferences
						</h3>
						<p className="text-xs text-(--gray-500) mt-0.5">
							What kind of connections are you open to?
						</p>
					</div>
					<div className="space-y-2">
						{eligibleList.map((ct) => (
							<div
								key={ct}
								className={`flex items-center gap-3 p-3 rounded-lg border border-(--gray-200) transition-all ${
									state.isVisibleInGalaxy
										? "hover:border-(--aksob-primary)/30"
										: ""
								}`}
							>
								<Checkbox
									id={`conn-${ct}`}
									label={CONNECTION_TYPE_LABELS[ct] ?? ct}
									checked={state.connectionTypes.includes(ct)}
									onChange={() => toggleConnectionType(ct)}
									disabled={!state.isVisibleInGalaxy}
									className="text-sm text-(--aksob-darkest)"
								/>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};
