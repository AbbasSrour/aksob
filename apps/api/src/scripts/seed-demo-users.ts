import { AKSOB_MAJORS } from "@aksob/shared";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { auth } from "@/lib/auth";

const DEMO_PASSWORD = "AksobDemo123!";
const USERS_PER_MAJOR = 64;

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

const createDemoUsers = () => {
	const users: Array<{
		name: string;
		email: string;
		major: string;
		userType: "student" | "alumni" | "faculty";
		company?: string;
		title?: string;
	}> = [];
	let index = 1;

	for (const major of AKSOB_MAJORS) {
		for (let i = 0; i < USERS_PER_MAJOR; i++) {
			const firstName = firstNames[(index + i) % firstNames.length];
			const lastName = lastNames[(index + i * 2) % lastNames.length];
			const name = `${firstName} ${lastName}`;
			const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${index}@aksob.demo`;

			const userType: "student" | "alumni" | "faculty" =
				i < 4 ? "student" : i < 8 ? "alumni" : "faculty";

			users.push({
				name,
				email,
				userType,
				major,
				company:
					userType === "alumni"
						? ["Deloitte", "KPMG", "PwC", "Bank Audi", "Murex"][i % 5]
						: undefined,
				title:
					userType === "student"
						? undefined
						: userType === "faculty"
							? ["Professor", "Lecturer", "Program Director"][i % 3]
							: ["Analyst", "Manager", "Consultant", "Founder"][i % 4],
			});
			index++;
		}
	}

	return users;
};

const seedDemoUsers = async () => {
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
					userType: user.userType,
					major: user.major,
					company: user.company ?? null,
					title: user.title ?? null,
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
				userType: user.userType,
				major: user.major,
				company: user.company,
				title: user.title,
			},
		});

		await db
			.update(schema.user)
			.set({ emailVerified: true })
			.where(eq(schema.user.email, user.email));

		created++;
	}

	console.info("Demo user seed completed", {
		created,
		updated,
		total: users.length,
		password: DEMO_PASSWORD,
	});
};

seedDemoUsers()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("Failed to seed demo users", error);
		process.exit(1);
	});
