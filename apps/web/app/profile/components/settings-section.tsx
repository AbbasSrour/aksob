import { Edit2, Save } from "lucide-react";
import { useCallback, useState } from "react";
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
}: Props) {
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState({
		isVisibleInGalaxy,
		emailVisible,
		phoneNumberVisible,
		connectionTypes: [...connectionTypes],
	});
	const [saving, setSaving] = useState(false);

	const eligibleTypes = ELIGIBILITY[userType] ?? [];

	const handleEdit = useCallback(() => {
		setDraft({
			isVisibleInGalaxy,
			emailVisible,
			phoneNumberVisible,
			connectionTypes: [...connectionTypes],
		});
		setEditing(true);
	}, [isVisibleInGalaxy, emailVisible, phoneNumberVisible, connectionTypes]);

	const handleCancel = useCallback(() => setEditing(false), []);

	const handleSave = useCallback(async () => {
		setSaving(true);
		try {
			await onSave(draft);
			setEditing(false);
		} finally {
			setSaving(false);
		}
	}, [draft, onSave]);

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
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-sm font-semibold text-gray-900">
					Privacy & Connectivity
				</h3>
				{!editing ? (
					<Button
						variant="secondary"
						size="sm"
						onClick={handleEdit}
						leftIcon={<Edit2 size={14} />}
					>
						Edit
					</Button>
				) : (
					<div className="flex gap-2">
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
				)}
			</div>

			<div className="space-y-4">
				{/* Galaxy visibility */}
				<div>
					<div className="flex items-center gap-3">
						{editing ? (
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
						) : (
							<span className="text-sm text-gray-700">
								{isVisibleInGalaxy ? "Visible in Galaxy" : "Hidden from Galaxy"}
							</span>
						)}
					</div>
					{editing ? (
						<p className="text-xs text-gray-400 mt-1 ml-8">
							Appear in the 3D Galaxy visualization
						</p>
					) : null}
				</div>

				{/* Email visibility */}
				<div className="flex items-center gap-3">
					{editing ? (
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
					) : (
						<span className="text-sm text-gray-700">
							{emailVisible ? "Email visible" : "Email hidden"}
						</span>
					)}
				</div>

				{/* Phone visibility */}
				<div className="flex items-center gap-3">
					{editing ? (
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
					) : (
						<span className="text-sm text-gray-700">
							{phoneNumberVisible ? "Phone visible" : "Phone hidden"}
						</span>
					)}
				</div>

				{/* Connection types */}
				<div>
					<p className="text-xs text-gray-400 mb-2">Open to connections</p>
					{editing ? (
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
					) : (
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
					)}
				</div>

				{!editing && !isVisibleInGalaxy ? (
					<p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
						You are hidden from the Galaxy. Other profile sections are not
						affected.
					</p>
				) : null}
			</div>
		</div>
	);
}
