import { Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";

interface Props {
	isVisibleInGalaxy: boolean;
	emailVisible: boolean;
	phoneNumberVisible: boolean;
	connectionTypes: string[];
	userType: string;
	onSave: (settings: {
		isVisibleInGalaxy: boolean;
		emailVisible: boolean;
		phoneNumberVisible: boolean;
		connectionTypes: string[];
	}) => Promise<void>;
	isEditing?: boolean;
	onDone?: () => void;
}

const CONNECTION_LABELS: Record<string, string> = {
	mentorship: "Mentorship",
	career_coaching: "Career Coaching",
	study_partner: "Study Partner",
	buddy: "Buddy",
	research: "Research",
	project: "Project",
};

const ELIGIBILITY: Record<string, string[]> = {
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

export function SettingsSection({
	isVisibleInGalaxy,
	emailVisible,
	phoneNumberVisible,
	connectionTypes,
	userType,
	onSave,
	isEditing = false,
	onDone,
}: Props) {
	const [draft, setDraft] = useState({
		isVisibleInGalaxy,
		emailVisible,
		phoneNumberVisible,
		connectionTypes: [...connectionTypes],
	});
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (isEditing) {
			setDraft({
				isVisibleInGalaxy,
				emailVisible,
				phoneNumberVisible,
				connectionTypes: [...connectionTypes],
			});
		}
	}, [
		isEditing,
		isVisibleInGalaxy,
		emailVisible,
		phoneNumberVisible,
		connectionTypes,
	]);

	const handleCancel = useCallback(() => {
		onDone?.();
	}, [onDone]);

	const handleSave = useCallback(async () => {
		setSaving(true);
		try {
			await onSave(draft);
			onDone?.();
		} finally {
			setSaving(false);
		}
	}, [draft, onSave, onDone]);

	const eligibleTypes = ELIGIBILITY[userType] ?? [];

	const handleGalaxyChange = useCallback((checked: boolean) => {
		setDraft((prev) => ({
			...prev,
			isVisibleInGalaxy: checked,
			...(checked
				? {}
				: {
						emailVisible: false,
						phoneNumberVisible: false,
						connectionTypes: [],
					}),
		}));
	}, []);

	const toggleConnectionType = useCallback((ct: string) => {
		setDraft((prev) => ({
			...prev,
			connectionTypes: prev.connectionTypes.includes(ct)
				? prev.connectionTypes.filter((t) => t !== ct)
				: [...prev.connectionTypes, ct],
		}));
	}, []);

	return (
		<div className="p-5">
			{isEditing ? (
				<div className="space-y-4">
					{/* Galaxy visibility */}
					<div>
						<div className="flex items-center gap-3">
							<label className="flex items-center gap-2 text-sm cursor-pointer">
								<input
									type="checkbox"
									checked={draft.isVisibleInGalaxy}
									onChange={(e) => handleGalaxyChange(e.target.checked)}
									disabled={saving}
									className="h-5 w-5 rounded border-2 border-[var(--gray-300)] text-[var(--aksob-primary)]"
								/>
								<span>Visible in Galaxy</span>
							</label>
						</div>
						<p className="text-xs text-gray-400 mt-1 ml-8">
							Appear in the 3D Galaxy visualization
						</p>
					</div>

					{/* Email visibility */}
					<div className="flex items-center gap-3">
						<Checkbox
							checked={draft.emailVisible}
							onChange={(e) =>
								setDraft((prev) => ({
									...prev,
									emailVisible: e.target.checked,
								}))
							}
							disabled={saving || !draft.isVisibleInGalaxy}
							label="Show email on profile"
						/>
					</div>

					{/* Phone visibility */}
					<div className="flex items-center gap-3">
						<Checkbox
							checked={draft.phoneNumberVisible}
							onChange={(e) =>
								setDraft((prev) => ({
									...prev,
									phoneNumberVisible: e.target.checked,
								}))
							}
							disabled={saving || !draft.isVisibleInGalaxy}
							label="Show phone on profile"
						/>
					</div>

					{/* Connection types */}
					<div>
						<p className="text-xs text-gray-400 mb-2">Open to connections</p>
						<div className="space-y-2">
							{eligibleTypes.map((ct) => (
								<Checkbox
									key={ct}
									checked={draft.connectionTypes.includes(ct)}
									onChange={() => toggleConnectionType(ct)}
									disabled={saving || !draft.isVisibleInGalaxy}
									label={CONNECTION_LABELS[ct] ?? ct}
								/>
							))}
						</div>
					</div>

					{!draft.isVisibleInGalaxy && (
						<p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
							You are hidden from the Galaxy. Other profile sections are not
							affected.
						</p>
					)}

					<div className="flex items-center gap-3 pt-2">
						<div className="flex-1" />
						<Button
							variant="ghost"
							size="sm"
							onClick={handleCancel}
							disabled={saving}
						>
							Cancel
						</Button>
						<Button
							variant="primary"
							size="sm"
							onClick={handleSave}
							leftIcon={<Save size={14} />}
							isLoading={saving}
						>
							Save
						</Button>
					</div>
				</div>
			) : (
				<div className="space-y-4">
					{/* Galaxy visibility */}
					<div>
						<span className="text-sm text-gray-700">
							{isVisibleInGalaxy ? "Visible in Galaxy" : "Hidden from Galaxy"}
						</span>
					</div>

					{/* Email visibility */}
					<div className="flex items-center gap-3">
						<span className="text-sm text-gray-700">
							{emailVisible ? "Email visible" : "Email hidden"}
						</span>
					</div>

					{/* Phone visibility */}
					<div className="flex items-center gap-3">
						<span className="text-sm text-gray-700">
							{phoneNumberVisible ? "Phone visible" : "Phone hidden"}
						</span>
					</div>

					{/* Connection types */}
					<div>
						<p className="text-xs text-gray-400 mb-2">Open to connections</p>
						<div className="flex flex-wrap gap-1.5">
							{connectionTypes.length === 0 ? (
								<span className="text-sm text-gray-400">None selected</span>
							) : (
								connectionTypes.map((ct) => (
									<span
										key={ct}
										className="inline-flex px-2.5 py-1 rounded-full bg-[var(--aksob-primary)]/10 text-xs text-[var(--aksob-primary)]"
									>
										{CONNECTION_LABELS[ct] ?? ct}
									</span>
								))
							)}
						</div>
					</div>

					{!isVisibleInGalaxy && (
						<p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
							You are hidden from the Galaxy. Other profile sections are not
							affected.
						</p>
					)}
				</div>
			)}
		</div>
	);
}
