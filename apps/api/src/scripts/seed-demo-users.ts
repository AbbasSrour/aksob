import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { auth } from "@/lib/auth";
import { AKSOB_PROGRAMS } from "@/modules/users/constant/aksob-programs";
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

export const seedDemoUsers = async () => {
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
