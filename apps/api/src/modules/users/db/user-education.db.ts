import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { program } from "@/modules/programs/db/program.db";
import { user } from "@/modules/users/db/user.db";

export const userEducation = sqliteTable(
	"user_education",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id),
		programId: text("program_id")
			.notNull()
			.references(() => program.id),
		graduationYear: integer("graduation_year"),
		isPrimary: integer("is_primary", { mode: "boolean" })
			.default(false)
			.notNull(),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("user_education_user_id_idx").on(table.userId),
		index("user_education_program_id_idx").on(table.programId),
		unique("user_education_user_program_unique").on(
			table.userId,
			table.programId,
		),
	],
);
