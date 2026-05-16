import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	BookOpen,
	Briefcase,
	Calendar,
	Edit2,
	Link2,
	Mail,
	Phone,
	Save,
	User,
} from "lucide-react";
import { useState } from "react";
import { authClient, useSession } from "~/app/lib/auth";
import { getCurrentUser } from "~/app/lib/users";
import { ConnectionsSection } from "~/app/profile/components/connections-section";
import { EducationSection } from "~/app/profile/components/education-section";
import { EventsSection } from "~/app/profile/components/events-section";
import { ExperienceSection } from "~/app/profile/components/experience-section";
import { LinksSection } from "~/app/profile/components/links-section";
import { SettingsSection } from "~/app/profile/components/settings-section";
import { StoriesSection } from "~/app/profile/components/stories-section";
import { TagsSection } from "~/app/profile/components/tags-section";
import { Avatar } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

/* ─── Types ─── */

type TabKey = "about" | "connections" | "events" | "stories";

interface TabDef {
	key: TabKey;
	label: string;
	icon: React.ReactNode;
	count?: number;
}

/* ─── Animated floating star dot ─── */
function StarDot({
	size,
	top,
	left,
	delay,
}: {
	size: number;
	top: string;
	left: string;
	delay: string;
}) {
	return (
		<div
			className="absolute rounded-full animate-pulse"
			style={{
				width: size,
				height: size,
				top,
				left,
				background: "rgba(255,255,255,0.6)",
				boxShadow: `0 0 ${size * 2}px ${size}px rgba(7,105,81,0.25)`,
				animationDelay: delay,
				animationDuration: "3s",
			}}
		/>
	);
}

/* ─── Section header with editorial line ─── */
function SectionHeader({ label, number }: { label: string; number: string }) {
	return (
		<div className="flex items-center gap-4 mb-5">
			<span
				className="text-[var(--gray-400)] text-xs tracking-[0.2em] uppercase"
				style={{ fontFamily: "var(--font-display)" }}
			>
				{number}
			</span>
			<div className="flex-1 h-px bg-[var(--gray-200)]" />
			<span
				className="text-[var(--aksob-darkest)] text-xs tracking-[0.2em] uppercase font-medium"
				style={{ fontFamily: "var(--font-display)" }}
			>
				{label}
			</span>
		</div>
	);
}

/* ─── Glass card wrapper ─── */
function GlassCard({
	children,
	className,
	animate = false,
}: {
	children: React.ReactNode;
	className?: string;
	animate?: boolean;
}) {
	return (
		<div
			className={`
				bg-white/80 backdrop-blur-md
				border border-white/40
				rounded-2xl
				shadow-[0_4px_24px_rgba(0,0,0,0.06)]
				${animate ? "animate-editorial-slide-up" : ""}
				${className || ""}
			`}
		>
			{children}
		</div>
	);
}

/* ─── Main Page ─── */

export default function Profile() {
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
		await authClient.updateUser({
			isVisibleInGalaxy: settings.isVisibleInGalaxy,
			emailVisible: settings.emailVisible,
			phoneNumberVisible: settings.phoneNumberVisible,
			connectionTypes: settings.connectionTypes,
		});
		refetch();
	};

	/* ─── Loading skeleton ─── */
	if (isLoading) {
		return (
			<div className="min-h-screen bg-[var(--off-white)]">
				<div className="relative w-full h-56 sm:h-64 bg-[var(--aksob-darkest)] animate-pulse" />
				<div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-16 relative z-10">
					<div className="h-40 bg-gray-200 rounded-2xl animate-pulse" />
				</div>
			</div>
		);
	}

	/* ─── Error state ─── */
	if (error || !user) {
		return (
			<div className="min-h-screen bg-[var(--off-white)] flex items-center justify-center">
				<div className="text-center animate-editorial-reveal">
					<p
						className="text-2xl font-light text-[var(--aksob-darkest)]"
						style={{ fontFamily: "var(--font-display)" }}
					>
						Failed to load profile
					</p>
					<p className="text-sm text-[var(--gray-500)] mt-2">
						Please try refreshing the page.
					</p>
				</div>
			</div>
		);
	}

	const userType = user.type || "student";

	const tabs: TabDef[] = [
		{ key: "about", label: "About", icon: <User size={14} /> },
		{
			key: "connections",
			label: "Connections",
			icon: <Link2 size={14} />,
		},
		{ key: "events", label: "Events", icon: <Calendar size={14} /> },
		{ key: "stories", label: "Stories", icon: <BookOpen size={14} /> },
	];

	return (
		<div className="min-h-screen bg-[var(--off-white)] pb-20">
			{/* ═══ GALAXY HERO ═══ */}
			<div className="relative w-full h-52 sm:h-64 overflow-hidden">
				{/* Radial galaxy background */}
				<div
					className="absolute inset-0"
					style={{
						background: "var(--galaxy-bg)",
					}}
				/>

				{/* Animated orbit rings */}
				<div className="absolute inset-0 pointer-events-none">
					<svg
						className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] animate-orbit-drift opacity-10"
						viewBox="0 0 800 800"
						fill="none"
					>
						<circle
							cx="400"
							cy="400"
							r="398"
							stroke="#076951"
							strokeWidth="1"
						/>
						<circle
							cx="400"
							cy="400"
							r="320"
							stroke="#076951"
							strokeWidth="1"
						/>
					</svg>
				</div>

				{/* Floating star dots */}
				<StarDot size={3} top="20%" left="15%" delay="0s" />
				<StarDot size={2} top="35%" left="75%" delay="0.7s" />
				<StarDot size={4} top="60%" left="25%" delay="1.2s" />
				<StarDot size={2} top="45%" left="60%" delay="1.8s" />
				<StarDot size={3} top="75%" left="85%" delay="2.3s" />
				<StarDot size={2} top="15%" left="45%" delay="0.4s" />

				{/* Top-left label */}
				<div className="absolute top-6 left-4 sm:left-6 z-10">
					<span
						className="text-white/30 text-[10px] tracking-[0.3em] uppercase"
						style={{ fontFamily: "var(--font-display)" }}
					>
						Profile
					</span>
				</div>
			</div>

			{/* ═══ PROFILE CARD ═══ */}
			<div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-20 sm:-mt-24 relative z-10">
				<GlassCard className="p-6 sm:p-8 animate-editorial-slide-up" animate>
					<div className="flex flex-col sm:flex-row gap-6 items-start">
						{/* Avatar */}
						<div className="flex-shrink-0 mx-auto sm:mx-0">
							<div className="relative">
								<Avatar
									name={user.name}
									src={user.image ?? undefined}
									size="xl"
									className="w-24 h-24 sm:w-28 sm:h-28 text-2xl ring-[3px] ring-white/60 shadow-xl"
								/>
								{/* Online indicator */}
								<div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[var(--success)] border-[2.5px] border-white" />
							</div>
						</div>

						{/* Info */}
						<div className="flex-1 min-w-0 text-center sm:text-left">
							{editing ? (
								<div className="space-y-3 max-w-md">
									<input
										value={draftName}
										onChange={(e) => setDraftName(e.target.value)}
										className="w-full text-xl sm:text-2xl font-medium bg-transparent border-b border-[var(--gray-300)] focus:border-[var(--aksob-primary)] focus:outline-none text-[var(--aksob-darkest)] pb-1"
										style={{ fontFamily: "var(--font-display)" }}
										placeholder="Your name"
									/>
									<textarea
										value={draftBio}
										onChange={(e) => setDraftBio(e.target.value)}
										rows={2}
										className="w-full p-3 text-sm bg-[var(--gray-50)] border border-[var(--gray-200)] rounded-xl focus:ring-2 focus:ring-[var(--aksob-primary)]/20 focus:border-[var(--aksob-primary)] transition resize-none text-[var(--gray-600)]"
										placeholder="About yourself..."
									/>
									<div className="flex gap-2 justify-center sm:justify-start">
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setEditing(false)}
											disabled={saving}
										>
											Cancel
										</Button>
										<Button
											variant="primary"
											size="sm"
											onClick={handleHeaderSave}
											leftIcon={<Save size={14} />}
											isLoading={saving}
										>
											Save
										</Button>
									</div>
								</div>
							) : (
								<>
									{/* Name row */}
									<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
										<h1
											className="text-2xl sm:text-3xl font-medium text-[var(--aksob-darkest)] tracking-tight"
											style={{ fontFamily: "var(--font-display)" }}
										>
											{user.name}
										</h1>
										<Badge
											variant="primary"
											className="text-[10px] px-2.5 py-0.5 w-fit mx-auto sm:mx-0 capitalize tracking-wide"
										>
											{userType}
										</Badge>
									</div>

									{/* Title */}
									{user.title ? (
										<p
											className="text-sm text-[var(--gray-500)] mt-1 font-light"
											style={{ fontFamily: "var(--font-display)" }}
										>
											{user.title}
										</p>
									) : null}

									{/* Bio */}
									{user.bio ? (
										<p className="text-sm text-[var(--gray-600)] mt-3 leading-relaxed max-w-lg">
											{user.bio}
										</p>
									) : null}

									{/* Meta row */}
									<div className="flex flex-wrap justify-center sm:justify-start gap-x-5 gap-y-1.5 mt-4 text-xs text-[var(--gray-500)]">
										<span className="flex items-center gap-1.5">
											<Mail size={11} className="text-[var(--gray-400)]" />
											{user.email}
										</span>
										{sessionUser?.phoneNumber ? (
											<span className="flex items-center gap-1.5">
												<Phone size={11} className="text-[var(--gray-400)]" />
												{sessionUser.phoneNumber as string}
											</span>
										) : null}
										{user.company ? (
											<span className="flex items-center gap-1.5">
												<Briefcase
													size={11}
													className="text-[var(--gray-400)]"
												/>
												{user.company}
											</span>
										) : null}
									</div>
								</>
							)}
						</div>

						{/* Edit button */}
						{!editing && (
							<div className="flex-shrink-0 mx-auto sm:mx-0">
								<Button
									variant="secondary"
									size="sm"
									onClick={handleHeaderEdit}
									leftIcon={<Edit2 size={13} />}
									className="rounded-full px-5"
								>
									Edit
								</Button>
							</div>
						)}
					</div>
				</GlassCard>
			</div>

			{/* ═══ TABS ═══ */}
			<div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
				<div className="flex items-center gap-1 border-b border-[var(--gray-200)]">
					{tabs.map((t) => (
						<button
							type="button"
							key={t.key}
							onClick={() => setActiveTab(t.key)}
							className={`relative px-4 py-3 text-xs tracking-[0.1em] uppercase font-medium transition-colors cursor-pointer ${
								activeTab === t.key
									? "text-[var(--aksob-darkest)]"
									: "text-[var(--gray-400)] hover:text-[var(--gray-600)]"
							}`}
							style={{ fontFamily: "var(--font-display)" }}
						>
							<span className="flex items-center gap-2">
								{t.icon}
								{t.label}
							</span>
							{activeTab === t.key && (
								<div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--aksob-primary)]" />
							)}
						</button>
					))}
				</div>
			</div>

			{/* ═══ TAB CONTENT ═══ */}
			<div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
				{activeTab === "about" && (
					<div className="space-y-10">
						{/* Education */}
						<section className="animate-editorial-slide-up">
							<SectionHeader label="Education" number="01" />
							<GlassCard>
								<EducationSection entries={user.majors} onRefetch={refetch} />
							</GlassCard>
						</section>

						{/* Experience */}
						<section
							className="animate-editorial-slide-up"
							style={{ animationDelay: "0.1s" }}
						>
							<SectionHeader label="Experience" number="02" />
							<GlassCard>
								<ExperienceSection
									entries={user.experience ?? []}
									onRefetch={refetch}
								/>
							</GlassCard>
						</section>

						{/* Skills */}
						<section
							className="animate-editorial-slide-up"
							style={{ animationDelay: "0.2s" }}
						>
							<SectionHeader label="Skills & Interests" number="03" />
							<GlassCard>
								<TagsSection
									tags={
										user.tags ?? {
											skills: [],
											goals: [],
											hobbies: [],
										}
									}
									onRefetch={refetch}
								/>
							</GlassCard>
						</section>

						{/* Links */}
						<section
							className="animate-editorial-slide-up"
							style={{ animationDelay: "0.3s" }}
						>
							<SectionHeader label="Links" number="04" />
							<GlassCard>
								<LinksSection links={user.links ?? []} onRefetch={refetch} />
							</GlassCard>
						</section>

						{/* Settings */}
						<section
							className="animate-editorial-slide-up"
							style={{ animationDelay: "0.4s" }}
						>
							<SectionHeader label="Privacy" number="05" />
							<GlassCard>
								<SettingsSection
									isVisibleInGalaxy={user.isVisibleInGalaxy ?? true}
									emailVisible={user.emailVisible ?? false}
									phoneNumberVisible={user.phoneNumberVisible ?? false}
									connectionTypes={user.connectionTypes ?? []}
									userType={userType}
									onSave={handleSettingsSave}
								/>
							</GlassCard>
						</section>
					</div>
				)}

				{activeTab === "connections" && (
					<div className="animate-editorial-slide-up">
						<SectionHeader label="My Connections" number="01" />
						<GlassCard>
							<ConnectionsSection userId={user.id} />
						</GlassCard>
					</div>
				)}

				{activeTab === "events" && (
					<div className="animate-editorial-slide-up">
						<SectionHeader label="My Events" number="01" />
						<GlassCard>
							<EventsSection />
						</GlassCard>
					</div>
				)}

				{activeTab === "stories" && (
					<div className="animate-editorial-slide-up">
						<SectionHeader label="My Stories" number="01" />
						<GlassCard>
							<StoriesSection userId={user.id} />
						</GlassCard>
					</div>
				)}
			</div>
		</div>
	);
}
