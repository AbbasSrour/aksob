import { apiFetch } from "~/app/lib/api";
import { authClient } from "~/app/lib/auth";
import type { EducationEntry } from "~/app/onboarding/components/education-step";
import type { ExperienceEntry } from "~/app/onboarding/components/experience-step";
import type { SettingsData } from "~/app/onboarding/components/settings-step";

export interface UserProfile {
	majors: EducationEntry[];
	experience: ExperienceEntry[];
	tags: { skills: string[]; goals: string[]; hobbies: string[] };
	settings: SettingsData;
}

export async function fetchUserProfile(): Promise<UserProfile | null> {
	try {
		const res = await apiFetch<{
			status: string;
			data: {
				majors: Array<{
					programId: string;
					graduationYear: number | null;
					isPrimary: boolean;
				}>;
				experience: Array<{
					type: string;
					title: string;
					company: string;
					startDate: string;
					endDate: string | null;
					isCurrent: boolean;
				}>;
				tags: { skills: string[]; goals: string[]; hobbies: string[] };
				isVisibleInGalaxy: boolean;
				emailVisible: boolean;
				phoneNumberVisible: boolean;
				connectionTypes: string[];
			};
		}>("/api/users/me");

		return {
			majors: res.data.majors,
			experience: res.data.experience,
			tags: res.data.tags,
			settings: {
				isVisibleInGalaxy: res.data.isVisibleInGalaxy,
				emailVisible: res.data.emailVisible,
				phoneNumberVisible: res.data.phoneNumberVisible,
				connectionTypes: res.data.connectionTypes,
			},
		};
	} catch {
		return null;
	}
}

export async function saveEducation(entries: EducationEntry[]) {
	const filled = entries.filter((e) => e.programId);
	return apiFetch("/api/users/me/education", {
		method: "PUT",
		body: JSON.stringify({ entries: filled }),
	});
}

export async function saveExperience(entries: ExperienceEntry[]) {
	const filled = entries.filter((e) => e.title && e.company);
	return apiFetch("/api/users/me/experience", {
		method: "PUT",
		body: JSON.stringify({ entries: filled }),
	});
}

export async function saveTags(data: {
	skills: string[];
	goals: string[];
	hobbies: string[];
}) {
	return apiFetch("/api/users/me/tags", {
		method: "PUT",
		body: JSON.stringify(data),
	});
}

export async function saveSettings(data: SettingsData) {
	await authClient.updateUser({
		isVisibleInGalaxy: data.isVisibleInGalaxy,
		emailVisible: data.emailVisible,
		phoneNumberVisible: data.phoneNumberVisible,
		connectionTypes: data.connectionTypes,
	});
}

export async function advanceOnboarding(step: string) {
	await authClient.updateUser({ onboarding: step });
}

export async function completeOnboarding() {
	await authClient.updateUser({ onboarding: "complete" });
}
