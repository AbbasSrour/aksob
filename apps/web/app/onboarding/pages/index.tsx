import { ArrowLeft, ArrowRight, Sparkles, SkipForward } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useSession } from "~/app/lib/auth";
import { OnboardingDiagonalLines } from "~/app/onboarding/components/diagonal-lines";
import { WelcomeStep } from "~/app/onboarding/components/welcome-step";
import {
	EducationStep,
	type EducationEntry,
} from "~/app/onboarding/components/education-step";
import {
	ExperienceStep,
	type ExperienceEntry,
} from "~/app/onboarding/components/experience-step";
import { TagsStep } from "~/app/onboarding/components/tags-step";
import {
	SettingsStep,
	type SettingsData,
} from "~/app/onboarding/components/settings-step";
import { DoneStep } from "~/app/onboarding/components/done-step";
import {
	advanceOnboarding,
	completeOnboarding,
	fetchUserProfile,
	saveEducation,
	saveExperience,
	saveSettings,
	saveTags,
} from "~/app/onboarding/lib/onboarding-api";

const STEP_LABELS = [
	"Welcome",
	"Education",
	"Experience",
	"Skills & Goals",
	"Visibility",
	"Done",
];

const STEP_ONBOARDING_VALUES = [
	"welcome",
	"education",
	"experience",
	"tags",
	"settings",
] as const;

const DEFAULT_TAGS = {
	skills: [] as string[],
	goals: [] as string[],
	hobbies: [] as string[],
};
const DEFAULT_SETTINGS: SettingsData = {
	isVisibleInGalaxy: true,
	emailVisible: false,
	phoneNumberVisible: false,
	connectionTypes: [],
};

function ProgressBar({ step, total }: { step: number; total: number }) {
	const progress = ((step + 1) / total) * 100;
	return (
		<div className="w-full">
			<div className="h-1 bg-(--gray-200) rounded-full overflow-hidden">
				<div
					className="h-full bg-(--aksob-primary) rounded-full transition-all duration-700 ease-out"
					style={{ width: `${progress}%` }}
				/>
			</div>
		</div>
	);
}

export default function OnboardingPage() {
	const navigate = useNavigate();
	const { data: session, isPending } = useSession();
	const [step, setStep] = useState(0);
	const [saving, setSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [direction, setDirection] = useState<"forward" | "back">("forward");

	const educationRef = useRef<EducationEntry[]>([]);
	const experienceRef = useRef<ExperienceEntry[]>([]);
	const tagsRef = useRef(DEFAULT_TAGS);
	const settingsRef = useRef(DEFAULT_SETTINGS);

	useEffect(() => {
		if (isPending) return;
		if (!session?.user) {
			navigate("/auth/login");
			return;
		}
		if (session.user.onboarding === "complete") {
			navigate("/galaxy");
			return;
		}
		const current = (session.user.onboarding as string) ?? "welcome";
		const idx = STEP_ONBOARDING_VALUES.indexOf(
			current as (typeof STEP_ONBOARDING_VALUES)[number],
		);
		if (idx >= 0 && idx > step) {
			setStep(idx + 1);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isPending, session?.user]);

	// Pre-populate refs with saved data from the API
	useEffect(() => {
		let cancelled = false;
		fetchUserProfile().then((profile) => {
			if (cancelled || !profile) return;
			// Only populate if refs are still empty (don't overwrite unsaved changes)
			if (educationRef.current.length === 0 && profile.majors.length > 0) {
				educationRef.current = profile.majors;
			}
			if (experienceRef.current.length === 0 && profile.experience.length > 0) {
				experienceRef.current = profile.experience;
			}
			if (
				tagsRef.current.skills.length === 0 &&
				tagsRef.current.goals.length === 0 &&
				tagsRef.current.hobbies.length === 0 &&
				(profile.tags.skills.length > 0 ||
					profile.tags.goals.length > 0 ||
					profile.tags.hobbies.length > 0)
			) {
				tagsRef.current = profile.tags;
			}
			// Only overwrite settings if they're still the defaults
			if (
				settingsRef.current.isVisibleInGalaxy === true &&
				settingsRef.current.emailVisible === false &&
				settingsRef.current.phoneNumberVisible === false &&
				settingsRef.current.connectionTypes.length === 0
			) {
				settingsRef.current = profile.settings;
			}
		});
		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const saveCurrentStep = useCallback(
		async (targetStep: string): Promise<boolean> => {
			try {
				switch (targetStep) {
					case "education":
						await saveEducation(educationRef.current);
						break;
					case "experience":
						await saveExperience(experienceRef.current);
						break;
					case "tags":
						await saveTags(tagsRef.current);
						break;
					case "settings":
						await saveSettings(settingsRef.current);
						break;
				}
				await advanceOnboarding(targetStep);
				return true;
			} catch {
				return false;
			}
		},
		[],
	);

	const handleNext = useCallback(async () => {
		if (step < STEP_LABELS.length - 1) {
			setSaveError(null);
			setSaving(true);
			const ok = await saveCurrentStep(STEP_ONBOARDING_VALUES[step]);
			setSaving(false);
			if (ok) {
				setDirection("forward");
				setStep((s) => s + 1);
			} else {
				setSaveError("Failed to save. Please try again.");
			}
		}
	}, [step, saveCurrentStep]);

	const handleBack = () => {
		setSaveError(null);
		if (step > 0) {
			setDirection("back");
			setStep((s) => s - 1);
		}
	};

	const handleSkip = () => {
		navigate("/galaxy");
	};

	const handleFinish = async () => {
		setSaveError(null);
		setSaving(true);
		try {
			await completeOnboarding();
			setSaving(false);
			navigate("/galaxy");
		} catch {
			setSaving(false);
			setSaveError("Failed to complete setup. Please try again.");
		}
	};

	if (isPending || !session?.user) {
		return (
			<div className="relative min-h-screen flex items-center justify-center bg-(--off-white)">
				<OnboardingDiagonalLines />
				<div className="w-6 h-6 border-2 border-(--gray-200) border-t-(--aksob-primary) rounded-full animate-spin" />
			</div>
		);
	}

	const isLastDataStep = step === STEP_LABELS.length - 2;
	const userType = (session.user.type as string) ?? "student";
	const animationClass =
		direction === "forward"
			? "animate-editorial-reveal"
			: "animate-slide-in-left";

	return (
		<div className="relative min-h-screen w-full bg-(--off-white)">
			<OnboardingDiagonalLines />
			<div className="relative z-10 mx-auto min-h-screen w-full max-w-3xl flex flex-col px-8 py-12 sm:py-20">
				{/* Header */}
				<div className="flex items-center justify-between mb-12">
					<span
						className="text-[10px] tracking-[0.25em] uppercase text-(--aksob-primary) font-medium"
						style={{ fontFamily: "var(--font-display)" }}
					>
						Profile Setup
					</span>
					{step < STEP_LABELS.length - 1 && (
						<button
							type="button"
							onClick={handleSkip}
							className="text-[10px] tracking-[0.15em] uppercase text-(--gray-400) hover:text-(--aksob-primary) flex items-center gap-1.5 transition-colors cursor-pointer"
							style={{ fontFamily: "var(--font-display)" }}
						>
							<SkipForward size={12} />
							Skip
						</button>
					)}
				</div>

				{/* Progress bar */}
				<div className="mb-8">
					<ProgressBar step={step} total={STEP_LABELS.length} />
					<div className="flex justify-between mt-2">
						<span
							className="text-[10px] tracking-[0.2em] uppercase text-(--gray-400)"
							style={{ fontFamily: "var(--font-display)" }}
						>
							{STEP_LABELS[step]}
						</span>
						<span className="text-[10px] text-(--gray-400)">
							{step + 1} / {STEP_LABELS.length}
						</span>
					</div>
				</div>

				{/* Decorative step number */}
				{step > 0 && step < STEP_LABELS.length - 1 && (
					<div className="flex justify-center mb-6">
						<span
							className="text-7xl font-extralight text-(--aksob-darkest)/[0.04] leading-none select-none"
							style={{ fontFamily: "var(--font-display)" }}
						>
							0{step}
						</span>
					</div>
				)}

				{/* Content */}
				<div className={`flex-1 ${animationClass}`} key={step}>
					{step === 0 && <WelcomeStep onNext={handleNext} />}
					{step === 1 && (
						<EducationStep
							data={educationRef.current}
							onChange={(v) => {
								educationRef.current = v;
							}}
						/>
					)}
					{step === 2 && (
						<ExperienceStep
							data={experienceRef.current}
							onChange={(v) => {
								experienceRef.current = v;
							}}
						/>
					)}
					{step === 3 && (
						<TagsStep
							data={tagsRef.current}
							onChange={(v) => {
								tagsRef.current = v;
							}}
						/>
					)}
					{step === 4 && (
						<SettingsStep
							data={settingsRef.current}
							userType={userType}
							onChange={(v) => {
								settingsRef.current = v;
							}}
						/>
					)}
					{step === 5 && <DoneStep onFinish={handleFinish} />}
				</div>

				{/* Error */}
				{saveError && (
					<div className="mt-6 flex items-center justify-center gap-2 animate-editorial-fade">
						<Sparkles size={12} className="text-(--error)" />
						<p className="text-sm text-(--error)">{saveError}</p>
					</div>
				)}

				{/* Navigation */}
				{step > 0 && step < STEP_LABELS.length - 1 && (
					<div className="flex justify-between items-center mt-12 pt-8 border-t border-(--gray-200)">
						<button
							type="button"
							onClick={handleBack}
							className="group flex items-center gap-2 text-(--gray-400) hover:text-(--aksob-darkest) transition-colors cursor-pointer"
						>
							<ArrowLeft
								size={16}
								className="group-hover:-translate-x-1 transition-transform"
							/>
							<span
								className="text-[11px] tracking-[0.15em] uppercase"
								style={{ fontFamily: "var(--font-display)" }}
							>
								Back
							</span>
						</button>

						<button
							type="button"
							onClick={handleNext}
							disabled={saving}
							className="group flex items-center gap-3 px-7 py-3.5 bg-(--aksob-primary) text-white text-[11px] tracking-[0.15em] uppercase font-medium rounded-full hover:bg-(--aksob-secondary) transition-colors disabled:opacity-60 cursor-pointer"
							style={{ fontFamily: "var(--font-display)" }}
						>
							{saving ? (
								<span className="flex items-center gap-2">
									<span className="w-1 h-1 bg-white rounded-full animate-pulse" />
									<span className="w-1 h-1 bg-white rounded-full animate-pulse [animation-delay:0.15s]" />
									<span className="w-1 h-1 bg-white rounded-full animate-pulse [animation-delay:0.3s]" />
								</span>
							) : (
								<>
									{isLastDataStep ? "Finish" : "Continue"}
									<ArrowRight
										size={14}
										className="group-hover:translate-x-1 transition-transform"
									/>
								</>
							)}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
