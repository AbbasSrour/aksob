import { and, eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { auth } from "@/lib/auth";
import { AKSOB_PROGRAMS } from "@/modules/users/constant/aksob-programs";
import { CONNECTION_TYPE_ELIGIBILITY } from "@/modules/connections/constant/connection-eligibility.constant";
import { generateAndStoreEmbedding } from "@/lib/ai/embedding";
import { logger } from "@/utils/logger";

const DEMO_PASSWORD = "AksobDemo123!";
const USERS_PER_PROGRAM = 64;

const firstNames = [
	"Rami",
	"Maya",
	"Karim",
	"Lea",
	"Nadim",
	"Diana",
	"Jad",
	"Samar",
	"Fadi",
	"Rana",
	"Ralph",
	"Lynn",
];

const lastNames = [
	"Khoury",
	"Haddad",
	"Nasr",
	"Saliba",
	"Younes",
	"Saad",
	"Mansour",
	"Azar",
	"Issa",
	"Farah",
	"Nehme",
	"Hanna",
];

interface DemoUser {
	name: string;
	email: string;
	program: string;
	type: "student" | "alumni" | "faculty";
	company?: string;
	title?: string;
}

const createDemoUsers = (): DemoUser[] => {
	const users: DemoUser[] = [];
	let index = 1;

	for (const program of AKSOB_PROGRAMS) {
		for (let i = 0; i < USERS_PER_PROGRAM; i++) {
			const firstName = firstNames[(index + i) % firstNames.length];
			const lastName = lastNames[(index + i * 2) % lastNames.length];
			const name = `${firstName} ${lastName}`;
			const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${index}@aksob.demo`;

			const type: DemoUser["type"] =
				i < 4 ? "student" : i < 8 ? "alumni" : "faculty";

			users.push({
				name,
				email,
				type,
				program,
				company:
					type === "alumni"
						? ["Deloitte", "KPMG", "PwC", "Bank Audi", "Murex"][i % 5]
						: undefined,
				title:
					type === "student"
						? undefined
						: type === "faculty"
							? ["Professor", "Lecturer", "Program Director"][i % 3]
							: ["Analyst", "Manager", "Consultant", "Founder"][i % 4],
			});
			index++;
		}
	}

	return users;
};

const createProfileForDemoUser = async (userId: string, user: DemoUser) => {
	switch (user.type) {
		case "alumni":
			await db.insert(schema.alumniProfile).values({
				userId,
				company: user.company,
				title: user.title,
			});
			break;
		case "faculty":
			await db.insert(schema.facultyProfile).values({
				userId,
				title: user.title,
			});
			break;
		default:
			break;
	}
};

const seedPrograms = async () => {
	const now = new Date();

	for (const name of AKSOB_PROGRAMS) {
		const existing = await db.query.program.findFirst({
			where: eq(schema.program.name, name),
		});
		if (existing) continue;

		const level = name.startsWith("BS") ? "undergraduate" : "graduate";
		await db.insert(schema.program).values({
			id: crypto.randomUUID(),
			name,
			level,
			isActive: true,
			createdAt: now,
			updatedAt: now,
		});
	}
};

const ensureProgram = async (programName: string) => {
	const program = await db.query.program.findFirst({
		where: eq(schema.program.name, programName),
	});
	return program?.id;
};

const ensureEducation = async (
	userId: string,
	programName: string,
	userType: "student" | "alumni" | "faculty",
	salt: number,
) => {
	const programId = await ensureProgram(programName);
	if (!programId) return;

	// Check if user already has this education entry
	const existing = await db.query.userEducation.findFirst({
		where: and(
			eq(schema.userEducation.userId, userId),
			eq(schema.userEducation.programId, programId),
		),
	});
	if (existing) return;

	await db.insert(schema.userEducation).values({
		id: crypto.randomUUID(),
		userId,
		programId,
		graduationYear: userType === "student" ? null : 2020 + (salt % 5),
		isPrimary: true,
	});
};

const createUserSettingsAndPreferences = async (
	userId: string,
	userType: "student" | "alumni" | "faculty",
) => {
	// Insert user_settings — visible in galaxy by default
	await db
		.insert(schema.userSettings)
		.values({
			userId,
			isVisibleInGalaxy: true,
			emailVisible: false,
			phoneNumberVisible: false,
		})
		.onConflictDoNothing();

	// Insert all eligible connection preferences for this user type
	const eligibleTypes = CONNECTION_TYPE_ELIGIBILITY[userType];
	if (eligibleTypes && eligibleTypes.length > 0) {
		for (const type of eligibleTypes) {
			await db
				.insert(schema.userConnectionPreference)
				.values({ userId, type })
				.onConflictDoNothing();
		}
	}
};

export const seedDemoUsers = async () => {
	// Backfill missing user_settings for any user (not just demo)
	const backfill = await db.run(sql`
		INSERT OR IGNORE INTO user_settings (user_id)
		SELECT id FROM user
		LEFT JOIN user_settings ON user.id = user_settings.user_id
		WHERE user_settings.user_id IS NULL
	`);
	if (backfill.rowsAffected) {
		logger.info("Backfilled missing user_settings", {
			rowsAffected: backfill.rowsAffected,
		});
	}

	await seedPrograms();

	const users = createDemoUsers();
	let created = 0;
	let updated = 0;

	for (const user of users) {
		const existing = await db.query.user.findFirst({
			where: eq(schema.user.email, user.email),
		});

		if (existing) {
			await db
				.update(schema.user)
				.set({
					name: user.name,
					type: user.type,
					emailVerified: true,
				})
				.where(eq(schema.user.id, existing.id));

			// Ensure settings/preferences exist for existing users too
			await createUserSettingsAndPreferences(existing.id, user.type);

			// Ensure education entry exists
			await ensureEducation(existing.id, user.program, user.type, updated);

			// Generate embedding (noop if AI not configured)
			void generateAndStoreEmbedding(existing.id);

			updated++;
			continue;
		}

		await auth.api.signUpEmail({
			body: {
				name: user.name,
				email: user.email,
				password: DEMO_PASSWORD,
				type: user.type,
			},
		});

		const newUser = await db.query.user.findFirst({
			where: eq(schema.user.email, user.email),
		});

		if (newUser) {
			await db
				.update(schema.user)
				.set({ emailVerified: true })
				.where(eq(schema.user.id, newUser.id));

			await createProfileForDemoUser(newUser.id, user);

			await ensureEducation(newUser.id, user.program, user.type, created);

			// Create settings and preferences
			await createUserSettingsAndPreferences(newUser.id, user.type);

			// Generate embedding (fire-and-forget, noop if AI not configured)
			void generateAndStoreEmbedding(newUser.id);
		}

		created++;
	}

	logger.info("Demo user seed completed", {
		created,
		updated,
		total: users.length,
		password: DEMO_PASSWORD,
	});
};

if (import.meta.main) {
	seedDemoUsers()
		.then(() => process.exit(0))
		.catch((error) => {
			logger.error("Failed to seed demo users", { error });
			process.exit(1);
		});
}
