import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	BookOpen,
	Briefcase,
	Calendar,
	Edit2,
	Link2,
	LogOut,
	Mail,
	Phone,
	Save,
	User,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { authClient, signOut, useSession } from "~/app/lib/auth";
import { getCurrentUser, updateSettings } from "~/app/lib/users";
import { AvatarInput } from "~/components/ui/avatar-input";
import { ConnectionsSection } from "~/app/profile/components/connections-section";
import { EducationSection } from "~/app/profile/components/education-section";
import { EventsSection } from "~/app/profile/components/events-section";
import { ExperienceSection } from "~/app/profile/components/experience-section";
import { LinksSection } from "~/app/profile/components/links-section";
import { SettingsSection } from "~/app/profile/components/settings-section";
import { StoriesSection } from "~/app/profile/components/stories-section";
import { TagsSection } from "~/app/profile/components/tags-section";
import { Badge } from "~/components/ui/badge";

/* ─── Types ─── */

type TabKey = "about" | "connections" | "events" | "stories";

interface TabDef {
	key: TabKey;
	label: string;
	icon: React.ReactNode;
	number: string;
}

/* ─── Horizontal compass lines (profile-specific pattern) ─── */

function CompassLines() {
	return (
		<div className="fixed inset-0 pointer-events-none z-[5]">
			<div className="mx-auto max-w-7xl h-full relative">
				{[25, 50, 75].map((pos, i) => (
					<div
						key={pos}
						className="absolute left-0 right-0 overflow-hidden"
						style={{ top: `${pos}%` }}
					>
						<div
							className="h-px w-full bg-(--aksob-primary)/[0.06] animate-compass-line"
							style={{ animationDelay: `${i * 120}ms` }}
						/>
					</div>
				))}
				{/* Vertical accent at 33% */}
				<div
					className="absolute top-0 bottom-0 overflow-hidden"
					style={{ left: "33.33%" }}
				>
					<div
						className="w-px h-full bg-(--aksob-primary)/[0.04] animate-compass-vline"
						style={{ animationDelay: "200ms" }}
					/>
				</div>
				{/* Vertical accent at 66% */}
				<div
					className="absolute top-0 bottom-0 overflow-hidden"
					style={{ left: "66.66%" }}
				>
					<div
						className="w-px h-full bg-(--aksob-primary)/[0.04] animate-compass-vline"
						style={{ animationDelay: "350ms" }}
					/>
				</div>
			</div>
		</div>
	);
}

/* ─── Section header ─── */

function SectionHeader({
	label,
	action,
}: {
	label: string;
	action?: React.ReactNode;
}) {
	return (
		<div className="mb-6">
			<div className="flex items-center justify-between mb-3">
				<span
					className="text-(--aksob-darkest) text-[10px] tracking-[0.25em] uppercase font-semibold"
					style={{ fontFamily: "var(--font-display)" }}
				>
					{label}
				</span>
				{action}
			</div>
			<div className="h-px bg-(--gray-200)" />
		</div>
	);
}

/* ─── Main Page ─── */

export default function Profile() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: sessionData, refetch: refetchSession } = useSession();
	const sessionUser = sessionData?.user as Record<string, unknown> | undefined;
	const [activeTab, setActiveTab] = useState<TabKey>("about");

	const { data, isLoading, error } = useQuery({
		queryKey: ["profile-me"],
		queryFn: () => getCurrentUser().then((r) => r.data),
	});

	const user = data;
	const refetch = () =>
		queryClient.invalidateQueries({ queryKey: ["profile-me"] });

	/* Header editing */
	const [editing, setEditing] = useState(false);
	const [draftName, setDraftName] = useState("");
	const [draftBio, setDraftBio] = useState("");
	const [saving, setSaving] = useState(false);

	/* Section editing */
	const [editingSection, setEditingSection] = useState<string | null>(null);

	const handleHeaderEdit = () => {
		if (!user) return;
		setDraftName(user.name);
		setDraftBio(user.bio ?? "");
		setEditing(true);
	};

	const handleHeaderSave = async () => {
		if (!user) return;
		setSaving(true);
		try {
			await authClient.updateUser({ name: draftName, bio: draftBio });
			await refetchSession();
			refetch();
			setEditing(false);
		} finally {
			setSaving(false);
		}
	};

	const handleSettingsSave = async (settings: {
		isVisibleInGalaxy: boolean;
		emailVisible: boolean;
		phoneNumberVisible: boolean;
		connectionTypes: string[];
	}) => {
		await updateSettings(settings);
		refetch();
	};

	const handleLogout = async () => {
		await signOut({
			fetchOptions: {
				onSuccess: () => {
					navigate("/auth/login");
				},
			},
		});
	};

	const handleAvatarSuccess = async (url: string) => {
		await authClient.updateUser({ image: url });
		await refetchSession();
		refetch();
	};

	const handleAvatarError = (message: string) => {
		console.error("Avatar upload failed:", message);
	};

	/* ─── Loading skeleton ─── */

	if (isLoading) {
		return (
			<div className="min-h-screen bg-(--off-white)">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
					<div className="animate-pulse space-y-8">
						<div className="h-8 w-48 bg-gray-200 rounded" />
						<div className="h-64 bg-gray-200 rounded-2xl" />
						<div className="grid grid-cols-3 gap-6">
							<div className="h-32 bg-gray-200 rounded-xl" />
							<div className="h-32 bg-gray-200 rounded-xl" />
							<div className="h-32 bg-gray-200 rounded-xl" />
						</div>
					</div>
				</div>
			</div>
		);
	}

	/* ─── Error state ─── */

	if (error || !user) {
		return (
			<div className="min-h-screen bg-(--off-white) flex items-center justify-center">
				<div className="text-center">
					<p
						className="text-2xl font-light text-(--aksob-darkest)"
						style={{ fontFamily: "var(--font-display)" }}
					>
						Failed to load profile
					</p>
					<p className="text-sm text-(--gray-500) mt-2">
						Please try refreshing the page.
					</p>
				</div>
			</div>
		);
	}

	const userType = user.type || "student";

	const tabs: TabDef[] = [
		{ key: "about", label: "About", icon: <User size={14} />, number: "01" },
		{
			key: "connections",
			label: "Connections",
			icon: <Link2 size={14} />,
			number: "02",
		},
		{
			key: "events",
			label: "Events",
			icon: <Calendar size={14} />,
			number: "03",
		},
		{
			key: "stories",
			label: "Stories",
			icon: <BookOpen size={14} />,
			number: "04",
		},
	];

	return (
		<div className="min-h-screen bg-(--off-white) relative">
			{/* ═══ COMPASS LINES ═══ */}
			<CompassLines />

			{/* ═══ HERO ═══ */}
			<section className="relative z-20 pt-20 pb-0 sm:pt-28 sm:pb-0 px-4 sm:px-6 lg:px-8 overflow-hidden">
				{/* Rotating compass ring */}
				<div className="absolute top-24 right-[10%] pointer-events-none z-0">
					<svg
						width="500"
						height="500"
						viewBox="0 0 500 500"
						fill="none"
						className="animate-compass-spin opacity-[0.07]"
					>
						<title>Compass decoration</title>
						<circle
							cx="250"
							cy="250"
							r="248"
							stroke="#076951"
							strokeWidth="1"
						/>
						<circle
							cx="250"
							cy="250"
							r="200"
							stroke="#076951"
							strokeWidth="0.5"
						/>
						<circle
							cx="250"
							cy="250"
							r="150"
							stroke="#076951"
							strokeWidth="0.5"
						/>
						{/* Cross hairs */}
						<line
							x1="250"
							y1="0"
							x2="250"
							y2="500"
							stroke="#076951"
							strokeWidth="0.5"
						/>
						<line
							x1="0"
							y1="250"
							x2="500"
							y2="250"
							stroke="#076951"
							strokeWidth="0.5"
						/>
						{/* Diagonal marks */}
						<line
							x1="75"
							y1="75"
							x2="425"
							y2="425"
							stroke="#076951"
							strokeWidth="0.3"
						/>
						<line
							x1="425"
							y1="75"
							x2="75"
							y2="425"
							stroke="#076951"
							strokeWidth="0.3"
						/>
						{/* Tick marks */}
						{[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(
							(deg) => {
								const rad = (deg * Math.PI) / 180;
								const x1 = 250 + 238 * Math.cos(rad);
								const y1 = 250 + 238 * Math.sin(rad);
								const x2 = 250 + 248 * Math.cos(rad);
								const y2 = 250 + 248 * Math.sin(rad);
								return (
									<line
										key={deg}
										x1={x1}
										y1={y1}
										x2={x2}
										y2={y2}
										stroke="#076951"
										strokeWidth="1"
									/>
								);
							},
						)}
					</svg>
				</div>

				<div className="max-w-5xl mx-auto relative">
					{/* Top label */}
					<div className="flex items-center gap-3 mb-8 animate-profile-fade">
						<div className="w-6 h-px bg-(--aksob-primary)" />
						<span
							className="text-(--aksob-secondary) text-[10px] tracking-[0.3em] uppercase font-semibold"
							style={{ fontFamily: "var(--font-display)" }}
						>
							Alumni Profile
						</span>
					</div>

					{/* Profile info grid */}
					<div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-8 lg:gap-12 items-start">
						{/* Avatar */}
						<div className="animate-profile-slide-right mx-auto lg:mx-0">
							<AvatarInput
								currentUrl={user.image}
								name={user.name}
								onSuccess={handleAvatarSuccess}
								onError={handleAvatarError}
							/>
						</div>

						{/* Info */}
						<div className="text-center lg:text-left animate-profile-slide-up">
							{editing ? (
								<div className="space-y-4 max-w-md mx-auto lg:mx-0">
									<input
										value={draftName}
										onChange={(e) => setDraftName(e.target.value)}
										className="w-full text-2xl sm:text-3xl font-light bg-transparent border-b border-(--gray-300) focus:border-(--aksob-primary) focus:outline-none text-(--aksob-darkest) pb-2 tracking-tight"
										style={{ fontFamily: "var(--font-display)" }}
										placeholder="Your name"
									/>
									<textarea
										value={draftBio}
										onChange={(e) => setDraftBio(e.target.value)}
										rows={3}
										className="w-full p-3 text-sm bg-(--gray-50) border border-(--gray-200) rounded-xl focus:ring-2 focus:ring-(--aksob-primary)/20 focus:border-(--aksob-primary) transition resize-none text-(--gray-600) leading-relaxed"
										placeholder="About yourself..."
									/>
									<div className="flex gap-3 justify-center lg:justify-start">
										<button
											type="button"
											className="px-4 py-2 text-xs tracking-[0.1em] uppercase text-(--gray-500) hover:text-(--aksob-darkest) transition-colors cursor-pointer"
											style={{ fontFamily: "var(--font-display)" }}
											onClick={() => setEditing(false)}
											disabled={saving}
										>
											Cancel
										</button>
										<button
											type="button"
											className="px-5 py-2 bg-(--aksob-primary) text-white text-xs tracking-[0.1em] uppercase font-medium rounded-full hover:bg-(--aksob-secondary) transition-colors cursor-pointer flex items-center gap-2"
											style={{ fontFamily: "var(--font-display)" }}
											onClick={handleHeaderSave}
											disabled={saving}
										>
											<Save size={12} />
											{saving ? "Saving..." : "Save"}
										</button>
									</div>
								</div>
							) : (
								<>
									<div className="flex items-center gap-3 justify-center lg:justify-start mb-2">
										<h1
											className="text-3xl sm:text-4xl font-light tracking-tight text-(--aksob-darkest)"
											style={{ fontFamily: "var(--font-display)" }}
										>
											{user.name}
										</h1>
										<Badge
											variant="primary"
											className="text-[10px] px-3 py-0.5 capitalize tracking-wide"
										>
											{userType}
										</Badge>
									</div>

									{user.title ? (
										<p
											className="text-sm text-(--gray-500) font-light tracking-wide"
											style={{ fontFamily: "var(--font-display)" }}
										>
											{user.title}
										</p>
									) : null}

									{user.bio ? (
										<p className="text-sm text-(--gray-600) mt-4 leading-relaxed max-w-lg mx-auto lg:mx-0">
											{user.bio}
										</p>
									) : null}

									<div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 mt-5 text-xs text-(--gray-500)">
										<span className="flex items-center gap-1.5">
											<Mail size={11} className="text-(--gray-400)" />
											{user.email}
										</span>
										{sessionUser?.phoneNumber ? (
											<span className="flex items-center gap-1.5">
												<Phone size={11} className="text-(--gray-400)" />
												{sessionUser.phoneNumber as string}
											</span>
										) : null}
										{user.company ? (
											<span className="flex items-center gap-1.5">
												<Briefcase size={11} className="text-(--gray-400)" />
												{user.company}
											</span>
										) : null}
									</div>
								</>
							)}
						</div>

						{/* Edit + Sign out */}
						{!editing && (
							<div className="animate-profile-fade mx-auto lg:mx-0 lg:pt-2 flex items-center gap-3">
								<button
									type="button"
									className="group flex items-center gap-2 px-5 py-2.5 border border-(--aksob-primary)/30 text-(--aksob-primary) text-[10px] tracking-[0.15em] uppercase font-semibold rounded-full hover:bg-(--aksob-primary) hover:text-white transition-all cursor-pointer"
									style={{ fontFamily: "var(--font-display)" }}
									onClick={handleHeaderEdit}
								>
									<Edit2
										size={11}
										className="group-hover:rotate-12 transition-transform"
									/>
									Edit
								</button>
								<button
									type="button"
									onClick={handleLogout}
									className="group flex items-center gap-2 px-5 py-2.5 border border-red-300 text-red-500 text-[10px] tracking-[0.15em] uppercase font-semibold rounded-full hover:bg-red-500 hover:text-white transition-all cursor-pointer"
									style={{ fontFamily: "var(--font-display)" }}
								>
									<LogOut
										size={11}
										className="group-hover:-rotate-12 transition-transform"
									/>
									Sign out
								</button>
							</div>
						)}
					</div>

					{/* Bottom divider */}
					<div className="mt-12 sm:mt-16 flex items-center gap-4 animate-profile-fade">
						<div className="flex-1 h-px bg-(--gray-200)" />
						<div className="w-1.5 h-1.5 rounded-full bg-(--aksob-primary)/30" />
						<div className="flex-1 h-px bg-(--gray-200)" />
					</div>
				</div>
			</section>

			{/* ═══ TABS ═══ */}
			<div className="sticky top-0 z-30 bg-(--off-white)/95 backdrop-blur-md border-b border-(--gray-200)">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center gap-0">
						{tabs.map((t) => {
							const isActive = activeTab === t.key;
							return (
								<button
									type="button"
									key={t.key}
									onClick={() => setActiveTab(t.key)}
									className={`relative flex items-center gap-3 px-5 py-4 text-[10px] tracking-[0.15em] uppercase font-semibold transition-all cursor-pointer ${
										isActive
											? "text-(--aksob-darkest)"
											: "text-(--gray-400) hover:text-(--gray-600)"
									}`}
									style={{ fontFamily: "var(--font-display)" }}
								>
									<span
										className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-all ${
											isActive
												? "bg-(--aksob-primary) text-white"
												: "bg-(--gray-100) text-(--gray-400)"
										}`}
									>
										{t.number}
									</span>
									<span className="flex items-center gap-2">
										{t.icon}
										{t.label}
									</span>
								</button>
							);
						})}
					</div>
				</div>
			</div>

			{/* ═══ TAB CONTENT ═══ */}
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-20">
				{activeTab === "about" && (
					<div className="space-y-16 sm:space-y-20">
						{/* Education */}
						<section className="animate-profile-slide-up">
							<SectionHeader
								label="Education"
								action={
									editingSection !== "education" ? (
										<button
											type="button"
											className="flex items-center gap-1.5 text-xs text-(--gray-400) hover:text-(--aksob-primary) transition-colors cursor-pointer"
											style={{ fontFamily: "var(--font-display)" }}
											onClick={() => setEditingSection("education")}
										>
											<Edit2 size={12} />
											Edit
										</button>
									) : null
								}
							/>
							<EducationSection
								entries={user.majors}
								onRefetch={refetch}
								isEditing={editingSection === "education"}
								onDone={() => setEditingSection(null)}
							/>
						</section>

						{/* Experience */}
						<section
							className="animate-profile-slide-up"
							style={{ animationDelay: "0.1s" }}
						>
							<SectionHeader
								label="Experience"
								action={
									editingSection !== "experience" ? (
										<button
											type="button"
											className="flex items-center gap-1.5 text-xs text-(--gray-400) hover:text-(--aksob-primary) transition-colors cursor-pointer"
											style={{ fontFamily: "var(--font-display)" }}
											onClick={() => setEditingSection("experience")}
										>
											<Edit2 size={12} />
											Edit
										</button>
									) : null
								}
							/>
							<ExperienceSection
								entries={user.experience ?? []}
								onRefetch={refetch}
								isEditing={editingSection === "experience"}
								onDone={() => setEditingSection(null)}
							/>
						</section>

						{/* Skills */}
						<section
							className="animate-profile-slide-up"
							style={{ animationDelay: "0.2s" }}
						>
							<SectionHeader
								label="Skills & Interests"
								action={
									editingSection !== "tags" ? (
										<button
											type="button"
											className="flex items-center gap-1.5 text-xs text-(--gray-400) hover:text-(--aksob-primary) transition-colors cursor-pointer"
											style={{ fontFamily: "var(--font-display)" }}
											onClick={() => setEditingSection("tags")}
										>
											<Edit2 size={12} />
											Edit
										</button>
									) : null
								}
							/>
							<TagsSection
								tags={
									user.tags ?? {
										skills: [],
										goals: [],
										hobbies: [],
									}
								}
								onRefetch={refetch}
								isEditing={editingSection === "tags"}
								onDone={() => setEditingSection(null)}
							/>
						</section>

						{/* Links */}
						<section
							className="animate-profile-slide-up"
							style={{ animationDelay: "0.3s" }}
						>
							<SectionHeader
								label="Links"
								action={
									editingSection !== "links" ? (
										<button
											type="button"
											className="flex items-center gap-1.5 text-xs text-(--gray-400) hover:text-(--aksob-primary) transition-colors cursor-pointer"
											style={{ fontFamily: "var(--font-display)" }}
											onClick={() => setEditingSection("links")}
										>
											<Edit2 size={12} />
											Edit
										</button>
									) : null
								}
							/>
							<LinksSection
								links={user.links ?? []}
								onRefetch={refetch}
								isEditing={editingSection === "links"}
								onDone={() => setEditingSection(null)}
							/>
						</section>

						{/* Settings */}
						<section
							className="animate-profile-slide-up"
							style={{ animationDelay: "0.4s" }}
						>
							<SectionHeader
								label="Privacy"
								action={
									editingSection !== "settings" ? (
										<button
											type="button"
											className="flex items-center gap-1.5 text-xs text-(--gray-400) hover:text-(--aksob-primary) transition-colors cursor-pointer"
											style={{ fontFamily: "var(--font-display)" }}
											onClick={() => setEditingSection("settings")}
										>
											<Edit2 size={12} />
											Edit
										</button>
									) : null
								}
							/>
							<SettingsSection
								isVisibleInGalaxy={user.isVisibleInGalaxy ?? true}
								emailVisible={user.emailVisible ?? false}
								phoneNumberVisible={user.phoneNumberVisible ?? false}
								connectionTypes={user.connectionTypes ?? []}
								userType={userType}
								onSave={handleSettingsSave}
								isEditing={editingSection === "settings"}
								onDone={() => setEditingSection(null)}
							/>
						</section>
					</div>
				)}

				{activeTab === "connections" && (
					<div className="animate-profile-slide-up">
						<SectionHeader label="My Connections" number="01" />
						<ConnectionsSection userId={user.id} />
					</div>
				)}

				{activeTab === "events" && (
					<div className="animate-profile-slide-up">
						<SectionHeader label="My Events" number="01" />
						<EventsSection />
					</div>
				)}

				{activeTab === "stories" && (
					<div className="animate-profile-slide-up">
						<SectionHeader label="My Stories" number="01" />
						<StoriesSection userId={user.id} />
					</div>
				)}
			</div>

			{/* ═══ FOOTER ═══ */}
			<div className="h-24" />
		</div>
	);
}
