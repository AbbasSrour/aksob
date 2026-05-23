import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Camera,
	ChevronLeft,
	ChevronRight,
	Edit2,
	Loader2,
	Plus,
	Trash2,
	X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSession } from "~/app/lib/auth";
import {
	type CreateDonorParams,
	createDonor,
	type Donor,
	deleteDonor,
	listDonors,
	updateDonor,
} from "~/app/lib/donors";
import { useMediaUpload } from "~/app/lib/upload";
import { Button } from "~/components/ui/button";

const WALL_LIMIT = 50; // API max

function initials(name: string) {
	return name
		.split(" ")
		.map((n) => n[0])
		.filter(Boolean)
		.slice(0, 2)
		.join("")
		.toUpperCase();
}

function formatCompact(value: number): string {
	if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
	if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
	return value.toLocaleString();
}

// ─── Wall of Giving ──────────────────────────────────────────────────

export function WallOfGiving() {
	const { data: session } = useSession();
	const isAdmin =
		(session?.user as Record<string, unknown> | undefined)?.role === "admin";

	const queryClient = useQueryClient();
	const sectionRef = useRef<HTMLElement>(null);
	const [isVisible, setIsVisible] = useState(false);
	const [showForm, setShowForm] = useState(false);
	const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
	const [activeIndex, setActiveIndex] = useState(0);

	const { data: response, isPending } = useQuery({
		queryKey: ["donors", "wall"],
		queryFn: () => listDonors({ limit: WALL_LIMIT }),
	});

	const donors = response?.data ?? [];

	// Featured donors are those with messages; rotate the spotlight through them.
	const featuredDonors = donors.filter((d) => d.message);
	const supporting = donors.filter((d) => !d.message);
	const featured =
		featuredDonors[activeIndex % Math.max(featuredDonors.length, 1)];

	const totalContribution = donors.reduce(
		(sum, d) => sum + (d.donationAmount ?? 0),
		0,
	);

	const createMutation = useMutation({
		mutationFn: (body: CreateDonorParams) => createDonor(body),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["donors"] });
			setShowForm(false);
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, body }: { id: string; body: CreateDonorParams }) =>
			updateDonor(id, body),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["donors"] });
			setEditingDonor(null);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string) => deleteDonor(id),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["donors"] }),
	});

	useEffect(() => {
		const el = sectionRef.current;
		if (!el) return;

		const prefersReduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (prefersReduced) {
			setIsVisible(true);
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.05 },
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	const isFormOpen = showForm || editingDonor !== null;

	return (
		<section
			ref={sectionRef}
			className="relative z-10 py-24 md:py-32 bg-(--off-white) overflow-hidden"
		>
			{/* ── Subtle background mark ── */}
			<div
				aria-hidden
				className="pointer-events-none absolute -right-32 -top-32 text-[24rem] font-light leading-none text-(--aksob-primary)/[0.03] select-none hidden lg:block"
				style={{ fontFamily: "var(--font-display)" }}
			>
				W
			</div>

			<div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* ── Section header (top, full width) ── */}
				<div className="mb-14 flex items-start justify-between gap-6 md:mb-20">
					<div className="flex-1">
						<span
							className={`text-xs font-semibold italic tracking-[0.15em] text-[var(--gray-400)] ${isVisible ? "animate-editorial-fade" : "opacity-0"}`}
							style={isVisible ? { animationDelay: "0.1s" } : undefined}
						>
							Wall of Giving
						</span>

						<h2
							className="mt-5 max-w-3xl text-3xl md:text-5xl lg:text-[3.25rem] font-light leading-[1.08] tracking-[-0.01em]"
							style={{ fontFamily: "var(--font-display)" }}
						>
							<span
								className={`text-(--aksob-darkest) ${isVisible ? "animate-editorial-reveal" : "opacity-0"}`}
								style={isVisible ? { animationDelay: "0.2s" } : undefined}
							>
								The names{" "}
							</span>
							<span
								className={`text-(--aksob-primary) ${isVisible ? "animate-editorial-reveal" : "opacity-0"}`}
								style={isVisible ? { animationDelay: "0.35s" } : undefined}
							>
								that built the path.
							</span>
						</h2>

						<p
							className={`mt-6 max-w-lg text-sm text-[var(--gray-500)] leading-relaxed ${isVisible ? "animate-editorial-slide-up" : "opacity-0"}`}
							style={isVisible ? { animationDelay: "0.45s" } : undefined}
						>
							Scholarships funded, research enabled, futures unlocked. These are
							the supporters writing the next chapter of AKSOB.
						</p>
					</div>

					{isAdmin && !isFormOpen && (
						<div
							className={`shrink-0 ${isVisible ? "animate-editorial-fade" : "opacity-0"}`}
							style={isVisible ? { animationDelay: "0.5s" } : undefined}
						>
							<Button
								variant="primary"
								onClick={() => setShowForm(true)}
								leftIcon={<Plus size={16} />}
							>
								Add Donor
							</Button>
						</div>
					)}
				</div>

				{/* ── Admin form panel ── */}
				{isAdmin && isFormOpen && (
					<div className="mb-14 rounded-2xl border border-[var(--gray-200)] bg-white p-6 sm:p-8 shadow-[0_8px_40px_rgba(7,105,81,0.06)]">
						<div className="mb-6 flex items-center justify-between">
							<div>
								<span className="text-xs font-semibold italic tracking-[0.15em] text-[var(--gray-400)]">
									{editingDonor ? "Editing entry" : "New entry"}
								</span>
								<h3
									className="mt-2 text-2xl font-light tracking-[-0.01em] text-(--aksob-darkest)"
									style={{ fontFamily: "var(--font-display)" }}
								>
									{editingDonor ? editingDonor.name : "Add a supporter"}
								</h3>
							</div>
							<button
								type="button"
								onClick={() => {
									setShowForm(false);
									setEditingDonor(null);
								}}
								className="rounded-full p-2 text-[var(--gray-400)] transition-colors hover:bg-[var(--gray-100)] hover:text-(--aksob-darkest)"
								aria-label="Close form"
							>
								<X size={18} />
							</button>
						</div>
						<DonorForm
							key={editingDonor?.id ?? "new"}
							isEditing={!!editingDonor}
							initialValues={
								editingDonor
									? {
											name: editingDonor.name,
											position: editingDonor.position,
											company: editingDonor.company,
											donationAmount: editingDonor.donationAmount ?? undefined,
											message: editingDonor.message ?? undefined,
											image: editingDonor.image ?? undefined,
										}
									: undefined
							}
							onSubmit={(body) => {
								if (editingDonor) {
									updateMutation.mutate({ id: editingDonor.id, body });
								} else {
									createMutation.mutate(body);
								}
							}}
							isPending={createMutation.isPending || updateMutation.isPending}
							onCancel={() => {
								setShowForm(false);
								setEditingDonor(null);
							}}
						/>
					</div>
				)}

				{/* ── Loading state ── */}
				{isPending && (
					<div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_1fr]">
						<div className="aspect-[4/5] animate-pulse rounded-2xl bg-[var(--gray-200)]" />
						<div className="flex flex-col">
							<div className="mb-8 space-y-4">
								<div className="h-3 w-32 animate-pulse rounded bg-[var(--gray-200)]" />
								<div className="h-10 w-3/4 animate-pulse rounded bg-[var(--gray-200)]" />
								<div className="h-4 w-full animate-pulse rounded bg-[var(--gray-200)]" />
							</div>
							<div className="space-y-3">
								{Array.from({ length: 6 }).map((_, i) => (
									<div
										key={i}
										className="h-12 animate-pulse rounded-lg bg-[var(--gray-200)]"
									/>
								))}
							</div>
						</div>
					</div>
				)}

				{/* ── Empty state ── */}
				{!isPending && donors.length === 0 && (
					<div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
						<NoFeatureCard isVisible={isVisible} />
						<div className="flex flex-col justify-center">
							<span className="text-xs font-semibold italic tracking-[0.15em] text-[var(--gray-400)]">
								Wall of Giving
							</span>
							<h2
								className="mt-5 text-3xl md:text-4xl font-light leading-[1.1] tracking-[-0.01em] text-(--aksob-darkest)"
								style={{ fontFamily: "var(--font-display)" }}
							>
								The wall is waiting for its{" "}
								<span className="text-(--aksob-primary)">first name.</span>
							</h2>
							{isAdmin && (
								<button
									type="button"
									onClick={() => setShowForm(true)}
									className="mt-6 inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-widest text-(--aksob-primary) transition-colors hover:text-(--aksob-secondary)"
								>
									<Plus size={14} />
									Add the first supporter
								</button>
							)}
						</div>
					</div>
				)}

				{/* ── Main composition: featured portrait + (header + name roster) ── */}
				{!isPending && donors.length > 0 && (
					<div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
						{/* Featured donor */}
						{featured ? (
							<FeaturedDonorCard
								donor={featured}
								index={activeIndex}
								total={featuredDonors.length}
								isVisible={isVisible}
								onPrev={() =>
									setActiveIndex(
										(i) =>
											(i - 1 + featuredDonors.length) % featuredDonors.length,
									)
								}
								onNext={() =>
									setActiveIndex((i) => (i + 1) % featuredDonors.length)
								}
							/>
						) : (
							<NoFeatureCard isVisible={isVisible} />
						)}

						{/* Right column: featured donor caption above roster */}
						<div className="flex flex-col">
							{featured && (
								<FeaturedDonorCaption
									donor={featured}
									isVisible={isVisible}
									isAdmin={isAdmin}
									onEdit={() => setEditingDonor(featured)}
									onDelete={() => {
										if (
											window.confirm(
												`Remove ${featured.name} from the Wall of Giving?`,
											)
										) {
											deleteMutation.mutate(featured.id);
										}
									}}
								/>
							)}

							{/* Roster */}
							<DonorRoster
								donors={supporting.length > 0 ? supporting : donors}
								isVisible={isVisible}
								isAdmin={isAdmin}
								onEdit={(d) => setEditingDonor(d)}
								onDelete={(d) => {
									if (
										window.confirm(`Remove ${d.name} from the Wall of Giving?`)
									) {
										deleteMutation.mutate(d.id);
									}
								}}
								isDeleting={deleteMutation.isPending}
							/>
						</div>
					</div>
				)}

				{/* ── Footer line + numerals ── */}
				{donors.length > 0 && (
					<div
						className={`mt-20 grid grid-cols-1 gap-8 border-t border-[var(--gray-200)] pt-10 sm:grid-cols-3 ${isVisible ? "animate-editorial-slide-up" : "opacity-0"}`}
						style={
							isVisible
								? { animationDelay: `${0.4 + donors.length * 0.02}s` }
								: undefined
						}
					>
						<FooterStat label="Supporters" value={String(donors.length)} />
						<FooterStat
							label="Featured stories"
							value={String(featuredDonors.length)}
						/>
						<FooterStat
							label={totalContribution > 0 ? "Contributed" : "Companies"}
							value={
								totalContribution > 0
									? `$${formatCompact(totalContribution)}`
									: String(new Set(donors.map((d) => d.company)).size)
							}
							accent
						/>
					</div>
				)}
			</div>
		</section>
	);
}

// ─── Featured donor card ─────────────────────────────────────────────

function FeaturedDonorCard({
	donor,
	index,
	total,
	isVisible,
	onPrev,
	onNext,
}: {
	donor: Donor;
	index: number;
	total: number;
	isVisible: boolean;
	onPrev: () => void;
	onNext: () => void;
}) {
	return (
		<figure
			className={`relative ${isVisible ? "animate-editorial-slide-up" : "opacity-0"}`}
			style={isVisible ? { animationDelay: "0.55s" } : undefined}
		>
			{/* Portrait */}
			<div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-(--gray-100)">
				{donor.image ? (
					<img
						key={donor.id}
						src={donor.image}
						alt={donor.name}
						className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 animate-ken-burns"
					/>
				) : (
					<div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-(--aksob-darkest) via-(--aksob-primary) to-(--aksob-secondary)">
						<span
							className="text-[8rem] font-light text-white/85 tracking-tight"
							style={{ fontFamily: "var(--font-display)" }}
						>
							{initials(donor.name)}
						</span>
					</div>
				)}

				{/* Index badge */}
				{total > 1 && (
					<div className="absolute top-5 left-5 flex items-baseline gap-1.5 rounded-full bg-black/30 px-3 py-1.5 text-white backdrop-blur-md">
						<span
							className="text-xs font-medium tabular-nums"
							style={{ fontFamily: "var(--font-display)" }}
						>
							{String(index + 1).padStart(2, "0")}
						</span>
						<span className="text-[10px] text-white/60">
							/ {String(total).padStart(2, "0")}
						</span>
					</div>
				)}

				{/* Donation badge */}
				{donor.donationAmount !== null && donor.donationAmount > 0 && (
					<div className="absolute top-5 right-5 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-medium tabular-nums tracking-wide text-white backdrop-blur-md">
						${formatCompact(donor.donationAmount)} contributed
					</div>
				)}

				{/* Carousel nav */}
				{total > 1 && (
					<div className="absolute right-5 bottom-5 flex gap-2">
						<button
							type="button"
							onClick={onPrev}
							className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20"
							aria-label="Previous featured donor"
						>
							<ChevronLeft className="h-5 w-5" />
						</button>
						<button
							type="button"
							onClick={onNext}
							className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20"
							aria-label="Next featured donor"
						>
							<ChevronRight className="h-5 w-5" />
						</button>
					</div>
				)}
			</div>
		</figure>
	);
}

// ─── Featured donor caption (lives in right column, above roster) ────

function FeaturedDonorCaption({
	donor,
	isVisible,
	isAdmin,
	onEdit,
	onDelete,
}: {
	donor: Donor;
	isVisible: boolean;
	isAdmin: boolean;
	onEdit: () => void;
	onDelete: () => void;
}) {
	return (
		<div
			key={donor.id}
			className={`mb-10 md:mb-12 ${isVisible ? "animate-editorial-slide-up" : "opacity-0"}`}
			style={isVisible ? { animationDelay: "0.6s" } : undefined}
		>
			<span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--gray-400)]">
				Featured supporter
			</span>

			<div className="mt-3 flex items-start justify-between gap-4">
				<div className="min-w-0 flex-1">
					<h3
						className="text-3xl md:text-4xl lg:text-[2.5rem] font-light leading-[1.1] tracking-[-0.01em] text-(--aksob-darkest)"
						style={{ fontFamily: "var(--font-display)" }}
					>
						{donor.name}
					</h3>
					<div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
						<span className="font-medium text-(--aksob-primary)">
							{donor.position}
						</span>
						{donor.company && (
							<>
								<span className="text-[var(--gray-300)]">·</span>
								<span className="text-[var(--gray-500)]">{donor.company}</span>
							</>
						)}
					</div>
				</div>

				{isAdmin && (
					<div className="flex shrink-0 gap-1">
						<button
							type="button"
							onClick={onEdit}
							className="rounded-full p-2 text-[var(--gray-400)] transition-colors hover:bg-[var(--gray-100)] hover:text-(--aksob-primary)"
							aria-label="Edit donor"
						>
							<Edit2 size={14} />
						</button>
						<button
							type="button"
							onClick={onDelete}
							className="rounded-full p-2 text-[var(--gray-400)] transition-colors hover:bg-[var(--gray-100)] hover:text-red-500"
							aria-label="Delete donor"
						>
							<Trash2 size={14} />
						</button>
					</div>
				)}
			</div>

			{donor.message && (
				<blockquote className="mt-5 border-l-2 border-(--aksob-primary)/40 pl-5">
					<p
						className="text-base md:text-lg font-light italic leading-relaxed text-[var(--gray-600)]"
						style={{ fontFamily: "var(--font-display)" }}
					>
						"{donor.message}"
					</p>
				</blockquote>
			)}

			{/* Divider between featured caption and roster */}
			<div className="mt-10 h-px w-16 bg-(--aksob-primary)/40" />
		</div>
	);
}

// ─── No-feature fallback ─────────────────────────────────────────────

function NoFeatureCard({ isVisible }: { isVisible: boolean }) {
	return (
		<div
			className={`flex aspect-[4/5] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--gray-300)] bg-white p-8 text-center ${isVisible ? "animate-editorial-slide-up" : "opacity-0"}`}
			style={isVisible ? { animationDelay: "0.55s" } : undefined}
		>
			<p
				className="text-xl font-light italic text-[var(--gray-400)]"
				style={{ fontFamily: "var(--font-display)" }}
			>
				"A featured story will live here."
			</p>
			<p className="mt-3 max-w-xs text-xs text-[var(--gray-400)]">
				When a donor shares a message with us, their portrait and words take
				this place.
			</p>
		</div>
	);
}

// ─── Donor roster (the list of names) ────────────────────────────────

function DonorRoster({
	donors,
	isVisible,
	isAdmin,
	onEdit,
	onDelete,
	isDeleting,
}: {
	donors: Donor[];
	isVisible: boolean;
	isAdmin: boolean;
	onEdit: (donor: Donor) => void;
	onDelete: (donor: Donor) => void;
	isDeleting: boolean;
}) {
	return (
		<div
			className={`flex flex-col ${isVisible ? "animate-editorial-fade" : "opacity-0"}`}
			style={isVisible ? { animationDelay: "0.65s" } : undefined}
		>
			<div className="mb-5 flex items-baseline justify-between">
				<span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--gray-400)]">
					In gratitude
				</span>
				<span className="text-[10px] tabular-nums text-[var(--gray-400)]">
					{String(donors.length).padStart(2, "0")} supporters
				</span>
			</div>

			<ul className="flex flex-col">
				{donors.map((donor, idx) => (
					<RosterRow
						key={donor.id}
						donor={donor}
						index={idx}
						isVisible={isVisible}
						isAdmin={isAdmin}
						onEdit={() => onEdit(donor)}
						onDelete={() => onDelete(donor)}
						isDeleting={isDeleting}
					/>
				))}
			</ul>
		</div>
	);
}

function RosterRow({
	donor,
	index,
	isVisible,
	isAdmin,
	onEdit,
	onDelete,
	isDeleting,
}: {
	donor: Donor;
	index: number;
	isVisible: boolean;
	isAdmin: boolean;
	onEdit: () => void;
	onDelete: () => void;
	isDeleting: boolean;
}) {
	return (
		<li
			className={`group relative ${isVisible ? "animate-editorial-slide-up" : "opacity-0"}`}
			style={
				isVisible
					? { animationDelay: `${0.7 + Math.min(index, 20) * 0.04}s` }
					: undefined
			}
		>
			<div className="absolute top-0 left-0 right-0 h-px bg-[var(--gray-200)]" />

			<div className="flex items-center gap-4 py-4 transition-colors hover:bg-[var(--pale-mint)]/30">
				{/* Avatar */}
				<div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-(--gray-100)">
					{donor.image ? (
						<img
							src={donor.image}
							alt={donor.name}
							className="h-full w-full object-cover"
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-(--aksob-primary) to-(--aksob-secondary) text-[11px] font-medium text-white">
							{initials(donor.name)}
						</div>
					)}
				</div>

				{/* Name + role */}
				<div className="min-w-0 flex-1">
					<div
						className="truncate text-sm md:text-base font-medium tracking-tight text-(--aksob-darkest)"
						style={{ fontFamily: "var(--font-display)" }}
					>
						{donor.name}
					</div>
					<div className="mt-0.5 truncate text-[11px] text-[var(--gray-500)]">
						{donor.position}
						{donor.company ? ` · ${donor.company}` : ""}
					</div>
				</div>

				{/* Donation pill */}
				{donor.donationAmount !== null && donor.donationAmount > 0 && (
					<span className="shrink-0 text-[11px] font-medium tabular-nums text-(--aksob-primary)">
						${formatCompact(donor.donationAmount)}
					</span>
				)}

				{/* Admin actions */}
				{isAdmin && (
					<div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
						<button
							type="button"
							onClick={onEdit}
							className="rounded-full p-1.5 text-[var(--gray-400)] transition-colors hover:bg-white hover:text-(--aksob-primary)"
							aria-label="Edit donor"
						>
							<Edit2 size={12} />
						</button>
						<button
							type="button"
							onClick={onDelete}
							disabled={isDeleting}
							className="rounded-full p-1.5 text-[var(--gray-400)] transition-colors hover:bg-white hover:text-red-500 disabled:opacity-50"
							aria-label="Delete donor"
						>
							{isDeleting ? (
								<Loader2 size={12} className="animate-spin" />
							) : (
								<Trash2 size={12} />
							)}
						</button>
					</div>
				)}
			</div>
		</li>
	);
}

// ─── Footer stat ─────────────────────────────────────────────────────

function FooterStat({
	label,
	value,
	accent,
}: {
	label: string;
	value: string;
	accent?: boolean;
}) {
	return (
		<div>
			<span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--gray-400)]">
				{label}
			</span>
			<div
				className={`mt-2 text-4xl md:text-5xl font-light tabular-nums tracking-[-0.02em] ${accent ? "text-(--aksob-primary)" : "text-(--aksob-darkest)"}`}
				style={{ fontFamily: "var(--font-display)" }}
			>
				{value}
			</div>
		</div>
	);
}

// ─── Image uploader ──────────────────────────────────────────────────

function DonorImageInput({
	currentUrl,
	name,
	onSuccess,
	onError,
}: {
	currentUrl?: string | null;
	name: string;
	onSuccess: (url: string) => void;
	onError: (message: string) => void;
}) {
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [uploading, setUploading] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const { startUpload } = useMediaUpload("media");

	useEffect(() => {
		return () => {
			if (previewUrl?.startsWith("blob:")) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	}, [previewUrl]);

	const displaySrc = previewUrl ?? currentUrl ?? undefined;

	const handleFile = async (file: File) => {
		setUploading(true);
		const localUrl = URL.createObjectURL(file);
		setPreviewUrl(localUrl);

		try {
			const result = await startUpload([file]);
			const mediaUrl = result?.[0]?.serverData?.mediaUrl;
			if (!mediaUrl) throw new Error("Upload failed");
			setPreviewUrl(null);
			onSuccess(mediaUrl);
		} catch (err) {
			setPreviewUrl(currentUrl ?? null);
			onError(err instanceof Error ? err.message : "Failed to upload");
		} finally {
			setUploading(false);
		}
	};

	return (
		<div className="flex items-center gap-4">
			<button
				type="button"
				onClick={() => inputRef.current?.click()}
				disabled={uploading}
				className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border-2 border-dashed border-[var(--gray-300)] bg-(--off-white) transition-colors hover:border-(--aksob-primary) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--aksob-primary) disabled:cursor-not-allowed"
			>
				{displaySrc ? (
					<img
						src={displaySrc}
						alt={name || "Donor"}
						className="absolute inset-0 h-full w-full object-cover"
					/>
				) : (
					<div className="flex h-full w-full flex-col items-center justify-center gap-1 text-[var(--gray-400)]">
						<Camera size={20} strokeWidth={1.5} />
						<span className="text-[10px] font-medium uppercase tracking-wider">
							Photo
						</span>
					</div>
				)}
				<div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
					{uploading ? (
						<Loader2 size={18} className="animate-spin text-white" />
					) : displaySrc ? (
						<Camera
							size={18}
							className="text-white opacity-0 transition-opacity group-hover:opacity-100"
						/>
					) : null}
				</div>
			</button>
			<div className="min-w-0 flex-1">
				<p className="text-sm font-medium text-(--aksob-darkest)">
					Donor portrait
				</p>
				<p className="mt-0.5 text-xs text-[var(--gray-500)]">
					Square image works best. Falls back to initials if omitted.
				</p>
			</div>
			<input
				ref={inputRef}
				type="file"
				accept="image/*"
				className="hidden"
				onChange={(e) => {
					const file = e.target.files?.[0];
					if (file) handleFile(file);
					e.target.value = "";
				}}
			/>
		</div>
	);
}

// ─── Donor form ──────────────────────────────────────────────────────

function DonorForm({
	initialValues,
	onSubmit,
	isPending,
	onCancel,
	isEditing,
}: {
	initialValues?: CreateDonorParams;
	onSubmit: (body: CreateDonorParams) => void;
	isPending: boolean;
	onCancel: () => void;
	isEditing?: boolean;
}) {
	const [form, setForm] = useState({
		name: initialValues?.name ?? "",
		position: initialValues?.position ?? "",
		company: initialValues?.company ?? "",
		donationAmount: initialValues?.donationAmount?.toString() ?? "",
		message: initialValues?.message ?? "",
		image: initialValues?.image ?? "",
	});
	const [error, setError] = useState<string | null>(null);

	const inputClass =
		"w-full h-11 rounded-lg border border-[var(--gray-200)] bg-(--off-white) px-3.5 text-sm text-[var(--gray-700)] focus:ring-2 focus:ring-[var(--aksob-primary)]/20 focus:border-[var(--aksob-primary)] focus:bg-white transition";
	const labelClass =
		"mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--gray-500)]";

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!form.name.trim() || !form.position.trim() || !form.company.trim()) {
			setError("Name, position, and company are required");
			return;
		}

		const body: CreateDonorParams = {
			name: form.name.trim(),
			position: form.position.trim(),
			company: form.company.trim(),
		};

		if (form.donationAmount) {
			body.donationAmount = parseFloat(form.donationAmount);
		}
		if (form.message.trim()) {
			body.message = form.message.trim();
		}
		if (form.image.trim()) {
			body.image = form.image.trim();
		}

		onSubmit(body);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-5">
			<div className="rounded-xl border border-[var(--gray-200)] bg-(--off-white)/50 p-4">
				<DonorImageInput
					currentUrl={form.image || null}
					name={form.name || "Donor"}
					onSuccess={(url) => setForm((f) => ({ ...f, image: url }))}
					onError={(msg) => setError(msg)}
				/>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div>
					<label className={labelClass} htmlFor="donor-name">
						Name
					</label>
					<input
						id="donor-name"
						className={inputClass}
						value={form.name}
						onChange={(e) => setForm({ ...form, name: e.target.value })}
						placeholder="Full name"
						required
					/>
				</div>
				<div>
					<label className={labelClass} htmlFor="donor-position">
						Position
					</label>
					<input
						id="donor-position"
						className={inputClass}
						value={form.position}
						onChange={(e) => setForm({ ...form, position: e.target.value })}
						placeholder="e.g. CEO, Managing Director"
						required
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div>
					<label className={labelClass} htmlFor="donor-company">
						Company
					</label>
					<input
						id="donor-company"
						className={inputClass}
						value={form.company}
						onChange={(e) => setForm({ ...form, company: e.target.value })}
						placeholder="Company name"
						required
					/>
				</div>
				<div>
					<label className={labelClass} htmlFor="donor-amount">
						Donation amount{" "}
						<span className="font-normal normal-case tracking-normal text-[var(--gray-400)]">
							(optional)
						</span>
					</label>
					<input
						id="donor-amount"
						className={inputClass}
						type="number"
						min="0"
						value={form.donationAmount}
						onChange={(e) =>
							setForm({ ...form, donationAmount: e.target.value })
						}
						placeholder="0"
					/>
				</div>
			</div>

			<div>
				<label className={labelClass} htmlFor="donor-message">
					Message{" "}
					<span className="font-normal normal-case tracking-normal text-[var(--gray-400)]">
						(optional — shown as the featured story with portrait)
					</span>
				</label>
				<textarea
					id="donor-message"
					className={`${inputClass} h-auto min-h-[88px] py-3 resize-none`}
					rows={3}
					value={form.message}
					onChange={(e) => setForm({ ...form, message: e.target.value })}
					placeholder="A few words from the donor…"
				/>
			</div>

			{error && (
				<div className="rounded-lg border border-red-200 bg-red-50 p-3">
					<p className="text-sm text-red-700">{error}</p>
				</div>
			)}

			<div className="flex justify-end gap-3 pt-2">
				<Button variant="ghost" type="button" onClick={onCancel}>
					Cancel
				</Button>
				<Button variant="primary" type="submit" isLoading={isPending}>
					{isPending
						? isEditing
							? "Saving…"
							: "Adding…"
						: isEditing
							? "Save changes"
							: "Add to wall"}
				</Button>
			</div>
		</form>
	);
}
