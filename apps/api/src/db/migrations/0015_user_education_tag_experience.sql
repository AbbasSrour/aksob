-- 0015_user_education_tag_experience
-- Creates program table (seeded from major), user_education, user_tag, experience.
-- Migrates data from user.major, profile graduation_year/title/company.
-- Drops replaced columns from student_profile and alumni_profile.

-----------------------------------------------------------------------
-- Step 1: Create program table, seed from existing major table
-----------------------------------------------------------------------
CREATE TABLE "program" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"level" text NOT NULL,
	"description" text,
	"credits" integer,
	"duration" real,
	"is_active" integer DEFAULT true NOT NULL,
	"created_at" integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	"updated_at" integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);

INSERT INTO "program" ("id", "name", "level", "description", "credits", "duration", "is_active")
SELECT
	lower(hex(randomblob(16))),
	"name",
	CASE
		WHEN "name" LIKE 'BS %' OR "name" LIKE 'BA %' THEN 'undergraduate'
		WHEN "name" LIKE 'MS %' OR "name" LIKE 'MA %' OR "name" LIKE 'MBA %' OR "name" LIKE 'LLM %' THEN 'graduate'
		ELSE 'other'
	END,
	"description",
	"credits",
	"duration",
	"is_active"
FROM "major"
WHERE "name" NOT IN (SELECT "name" FROM "program");

CREATE INDEX "program_is_active_idx" ON "program" ("is_active");
CREATE INDEX "program_name_idx" ON "program" ("name");
CREATE INDEX "program_level_idx" ON "program" ("level");

-----------------------------------------------------------------------
-- Step 2: Create user_education table
-----------------------------------------------------------------------
CREATE TABLE "user_education" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL REFERENCES "user"("id"),
	"program_id" text NOT NULL REFERENCES "program"("id"),
	"graduation_year" integer,
	"is_primary" integer DEFAULT false NOT NULL,
	"created_at" integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	"updated_at" integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);

CREATE INDEX "user_education_user_id_idx" ON "user_education" ("user_id");
CREATE INDEX "user_education_program_id_idx" ON "user_education" ("program_id");

-----------------------------------------------------------------------
-- Step 3: Create user_tag table
-----------------------------------------------------------------------
CREATE TABLE "user_tag" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL REFERENCES "user"("id"),
	"category" text NOT NULL,
	"value" text NOT NULL,
	"created_at" integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);

CREATE INDEX "user_tag_user_id_idx" ON "user_tag" ("user_id");
CREATE INDEX "user_tag_category_idx" ON "user_tag" ("category");

-----------------------------------------------------------------------
-- Step 4: Create experience table
-----------------------------------------------------------------------
CREATE TABLE "experience" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL REFERENCES "user"("id"),
	"type" text NOT NULL,
	"title" text NOT NULL,
	"company" text NOT NULL,
	"start_date" text,
	"end_date" text,
	"is_current" integer DEFAULT false NOT NULL,
	"created_at" integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	"updated_at" integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);

CREATE INDEX "experience_user_id_idx" ON "experience" ("user_id");

-----------------------------------------------------------------------
-- Step 5: Migrate user.major → user_education (where program name matches)
-----------------------------------------------------------------------
INSERT INTO "user_education" ("id", "user_id", "program_id", "graduation_year", "is_primary")
SELECT
	lower(hex(randomblob(16))),
	u."id",
	p."id",
	NULL,
	true
FROM "user" u
INNER JOIN "program" p ON p."name" = u."major"
WHERE u."major" IS NOT NULL;

-----------------------------------------------------------------------
-- Step 6: Migrate student_profile.graduation_year → user_education
-----------------------------------------------------------------------
-- Update existing user_education rows (from step 5) if student has one
UPDATE "user_education"
SET "graduation_year" = (
	SELECT sp."graduation_year"
	FROM "student_profile" sp
	WHERE sp."user_id" = "user_education"."user_id"
)
WHERE "user_id" IN (SELECT "user_id" FROM "student_profile" WHERE "graduation_year" IS NOT NULL);

-- Insert user_education rows for students who have graduation_year but no major-based row
INSERT INTO "user_education" ("id", "user_id", "program_id", "graduation_year", "is_primary")
SELECT
	lower(hex(randomblob(16))),
	sp."user_id",
	(SELECT "id" FROM "program" ORDER BY "created_at" LIMIT 1),
	sp."graduation_year",
	true
FROM "student_profile" sp
WHERE sp."graduation_year" IS NOT NULL
  AND sp."user_id" NOT IN (SELECT "user_id" FROM "user_education");

-----------------------------------------------------------------------
-- Step 7: Migrate alumni_profile.graduation_year → user_education
-----------------------------------------------------------------------
UPDATE "user_education"
SET "graduation_year" = COALESCE("user_education"."graduation_year", (
	SELECT ap."graduation_year"
	FROM "alumni_profile" ap
	WHERE ap."user_id" = "user_education"."user_id"
))
WHERE "user_id" IN (SELECT "user_id" FROM "alumni_profile" WHERE "graduation_year" IS NOT NULL);

INSERT INTO "user_education" ("id", "user_id", "program_id", "graduation_year", "is_primary")
SELECT
	lower(hex(randomblob(16))),
	ap."user_id",
	(SELECT "id" FROM "program" ORDER BY "created_at" LIMIT 1),
	ap."graduation_year",
	true
FROM "alumni_profile" ap
WHERE ap."graduation_year" IS NOT NULL
  AND ap."user_id" NOT IN (SELECT "user_id" FROM "user_education");

-----------------------------------------------------------------------
-- Step 8: Migrate alumni_profile.title + company → experience
-----------------------------------------------------------------------
INSERT INTO "experience" ("id", "user_id", "type", "title", "company", "is_current")
SELECT
	lower(hex(randomblob(16))),
	ap."user_id",
	'full-time',
	ap."title",
	ap."company",
	true
FROM "alumni_profile" ap
WHERE ap."title" IS NOT NULL OR ap."company" IS NOT NULL;

-----------------------------------------------------------------------
-- Step 9: Drop replaced columns from profile tables
-----------------------------------------------------------------------
ALTER TABLE "student_profile" DROP COLUMN "graduation_year";
ALTER TABLE "alumni_profile" DROP COLUMN "graduation_year";
ALTER TABLE "alumni_profile" DROP COLUMN "title";
ALTER TABLE "alumni_profile" DROP COLUMN "company";
