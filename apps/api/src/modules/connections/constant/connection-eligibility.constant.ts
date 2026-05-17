import type { ConnectionType } from "@/modules/connections/constant/connection-types.constant";
import type { UserType } from "@/modules/users/constant/user-types";

/**
 * Which connection types each user type is eligible for.
 * Used to validate preferences and match requests.
 */
export const CONNECTION_TYPE_ELIGIBILITY: Record<UserType, ConnectionType[]> = {
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

export function isEligibleForType(
	userType: UserType,
	connectionType: ConnectionType,
): boolean {
	return CONNECTION_TYPE_ELIGIBILITY[userType].includes(connectionType);
}
