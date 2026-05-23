import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const donor = sqliteTable(
	"donor",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull(),
		position: text("position").notNull(),
		company: text("company").notNull(),
		donationAmount: integer("donation_amount"),
		message: text("message"),
		image: text("image"),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("donor_created_at_idx").on(table.createdAt)],
);

export const donorRelations = relations(donor, () => ({}));
