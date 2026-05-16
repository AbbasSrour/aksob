import { eq } from "drizzle-orm";
import { db, schema } from "@/db";

export async function buildProfileText(userId: string): Promise<string> {
	const [user] = await db
		.select({
			type: schema.user.type,
			bio: schema.user.bio,
		})
		.from(schema.user)
		.where(eq(schema.user.id, userId));

	if (!user) return "";

	const educationRows = await db
		.select({
			name: schema.program.name,
			level: schema.program.level,
			graduationYear: schema.userEducation.graduationYear,
		})
		.from(schema.userEducation)
		.innerJoin(
			schema.program,
			eq(schema.userEducation.programId, schema.program.id),
		)
		.where(eq(schema.userEducation.userId, userId));

	const experienceRows = await db
		.select()
		.from(schema.experience)
		.where(eq(schema.experience.userId, userId));

	const tagRows = await db
		.select({
			category: schema.userTag.category,
			value: schema.userTag.value,
		})
		.from(schema.userTag)
		.where(eq(schema.userTag.userId, userId));

	const skills = tagRows.filter((t) => t.category === "skill").map((t) => t.value);
	const goals = tagRows.filter((t) => t.category === "goal").map((t) => t.value);
	const hobbies = tagRows.filter((t) => t.category === "hobby").map((t) => t.value);

	const parts: string[] = [];
	parts.push(`User type: ${user.type}`);
	if (user.bio) parts.push(`Bio: ${user.bio}`);
	if (skills.length > 0) parts.push(`Skills: ${skills.join(", ")}`);
	if (hobbies.length > 0) parts.push(`Hobbies: ${hobbies.join(", ")}`);

	if (goals.length > 0) {
		parts.push("Goals:");
		for (const g of goals) parts.push(`- ${g}`);
	}

	if (educationRows.length > 0) {
		parts.push("Education:");
		for (const e of educationRows) {
			const year = e.graduationYear ? `, ${e.graduationYear}` : "";
			parts.push(`- ${e.name} (${e.level ?? "undergraduate"}${year})`);
		}
	}

	if (experienceRows.length > 0) {
		parts.push("Work History:");
		for (const exp of experienceRows) {
			const end = exp.isCurrent ? "present" : (exp.endDate ?? "present");
			parts.push(
				`- ${exp.title} at ${exp.company} [${exp.type}] (${exp.startDate ?? "N/A"} - ${end})`,
			);
		}
	}

	return parts.join("\n");
}
