import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import {
	educationLevels,
	fundingOptions,
	researchStatuses,
	researchTypes,
} from "@/modules/research/constant/research-types.constant";
import { user } from "@/modules/users/db/user.db";

export const research = sqliteTable(
	"research",
	{
		id: text("id").primaryKey(),
		title: text("title").notNull(),
		content: text("content").notNull(),
		researchType: text("research_type", { enum: researchTypes }).notNull(),
		institution: text("institution").notNull(),
		department: text("department"),
		duration: text("duration"),
		funding: text("funding", { enum: fundingOptions }),
		location: text("location"),
		startDate: integer("start_date", { mode: "timestamp_ms" }),
		deadline: integer("deadline", { mode: "timestamp_ms" }),
		educationLevel: text("education_level", { enum: educationLevels }),
		fieldOfStudy: text("field_of_study"),
		experienceRequired: text("experience_required"),
		skillsRequired: text("skills_required"),
		additionalRequirements: text("additional_requirements"),
		status: text("status", { enum: researchStatuses })
			.default("pending")
			.notNull(),
		rejectionReason: text("rejection_reason"),
		authorId: text("author_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		reviewedBy: text("reviewed_by").references(() => user.id),
		reviewedAt: integer("reviewed_at", { mode: "timestamp_ms" }),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("research_type_idx").on(table.researchType),
		index("research_status_idx").on(table.status),
		index("research_author_idx").on(table.authorId),
		index("research_created_at_idx").on(table.createdAt),
	],
);

export const researchRelations = relations(research, ({ one }) => ({
	author: one(user, {
		fields: [research.authorId],
		references: [user.id],
	}),
	reviewer: one(user, {
		fields: [research.reviewedBy],
		references: [user.id],
	}),
}));
