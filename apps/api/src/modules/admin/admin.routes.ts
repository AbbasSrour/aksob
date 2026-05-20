import { hashPassword } from "better-auth/crypto";
import { Elysia, t } from "elysia";
import * as XLSX from "xlsx";
import { db, schema } from "@/db";
import { CONNECTION_TYPE_ELIGIBILITY } from "@/modules/connections/constant/connection-eligibility.constant";
import type { ConnectionType } from "@/modules/connections/constant/connection-types.constant";
import { authContext } from "@/plugins/auth";
import { logger } from "@/utils/logger";

const IMPORT_PASSWORD = "AksobDemo123!";
const BATCH_SIZE = 500;

const ALUMNI_MAJOR_TO_PROGRAM: Record<string, string> = {
	"Business - Management": "BS in Business - Management",
	"Business - Marketing": "BS in Business - Marketing",
	"Business - Banking & Finance": "BS in Business - Banking And Finance",
	"Business Administration": "BS in Business - Management",
	"Business - Accounting": "BS in Business - Accounting",
	"Business - International Business":
		"BS in Business - International Business",
	"Business Computer": "BS in Business - ITM",
	Economics: "BS in Economics",
	"Business Studies": "BS in Business - Management",
	"Business - Hospitality Management": "BS in Hospitality",
	"Business - Information Technology Mgt.": "BS in Business - ITM",
	"Business - MIS": "BS in Business - ITM",
	"Business - Economics": "BS in Economics",
	"Hospitality & Tourism Management": "BS in Hospitality",
	"Business - Family & Entrepreneurial Business":
		"BS in Business - Family and Entrepreneurial Business Management",
	"Business Emph. Hosp.& Tour.Mgt": "BS in Hospitality",
	"Applied Economics": "BS in Economics",
	"Business - Family & Entrepren. Bus. Mgt.":
		"BS in Business - Family and Entrepreneurial Business Management",
	"Hosp. & Tourism Management": "BS in Hospitality",
	Business: "BS in Business - Management",
	"Business Finance": "BS in Business - Banking And Finance",
	"Business Finance & Accounting": "BS in Business - Banking And Finance",
	"General Business": "BS in Business - Management",
	"Business Education": "BS in Business - Management",
	"Business Studies- Computer and Managment": "BS in Business - ITM",
	"Interdisciplinary -Bus.Mgt / Pol.Sc.": "BS in Business - Management",
};

// ── Shared types ─────────────────────────────────────────

interface AlumniRow {
	"Constituent ID": string | number | null;
	Name: string | null;
	"Class of": string | number | null;
	Major: string | null;
	Country: string | null;
	Mobile: string | null;
	Mobile_US: string | null;
	"LinkedIn URL": string | null;
	"Organization Name": string | null;
	Position: string | null;
	"Person Full Name": string | null;
	"E-mail 1": string | null;
	"E-mail 2": string | null;
	"E-mail 3": string | null;
	"E-mail 4": string | null;
	"E-mail 5": string | null;
	"Email 6": string | null;
}

interface ImportStats {
	total: number;
	imported: number;
	importedAlumni: number;
	importedStudents: number;
	createdPrograms: number;
	skippedNoEmail: number;
	skippedNoProgram: number;
	skippedExistingUser: number;
	errors: number;
	unmatchedMajors: string[];
}

// ── Normalization & matching ─────────────────────────────

function normalize(s: string): string {
	return s
		.toLowerCase()
		.replace(/[.,/#!$%^&*;:{}=_`~()-]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

/** Extract first non-null email from alumni row. */
function pickFirstEmail(row: AlumniRow): string | null {
	return (
		row["E-mail 1"]?.trim() ||
		row["E-mail 2"]?.trim() ||
		row["E-mail 3"]?.trim() ||
		row["E-mail 4"]?.trim() ||
		row["E-mail 5"]?.trim() ||
		row["Email 6"]?.trim() ||
		null
	);
}

function parseGraduationYear(value: string | number | null): number | null {
	if (typeof value === "number" && Number.isInteger(value)) return value;
	if (typeof value !== "string") return null;
	const parsed = Number.parseInt(value.trim(), 10);
	return Number.isInteger(parsed) ? parsed : null;
}

function cleanOptionalField(value: string | null): string | null {
	const cleaned = value?.trim();
	if (!cleaned || cleaned === "<None Specified>") return null;
	return cleaned;
}

function matchAlumniMajorToProgram(
	majorName: string,
	dbPrograms: Array<{ id: string; name: string }>,
): { id: string; name: string } | null {
	const programName = ALUMNI_MAJOR_TO_PROGRAM[majorName];
	if (!programName) return null;

	const normalizedProgramName = normalize(programName);
	return (
		dbPrograms.find((p) => normalize(p.name) === normalizedProgramName) ?? null
	);
}

async function ensureMappedPrograms() {
	const targetProgramNames = [
		...new Set(Object.values(ALUMNI_MAJOR_TO_PROGRAM)),
	];
	const existingPrograms = await db.query.program.findMany({
		columns: { id: true, name: true },
	});
	const existingProgramNames = new Set(
		existingPrograms.map((program) => normalize(program.name)),
	);
	const missingProgramNames = targetProgramNames.filter(
		(programName) => !existingProgramNames.has(normalize(programName)),
	);

	if (missingProgramNames.length > 0) {
		const now = new Date();
		await db
			.insert(schema.program)
			.values(
				missingProgramNames.map((programName) => ({
					id: crypto.randomUUID(),
					name: programName,
					level: "undergraduate",
					description: null,
					credits: null,
					duration: null,
					isActive: true,
					createdAt: now,
					updatedAt: now,
				})),
			)
			.onConflictDoNothing({ target: schema.program.name });
	}

	return {
		programs: await db.query.program.findMany({
			columns: { id: true, name: true },
		}),
		createdPrograms: missingProgramNames.length,
	};
}

// ── Bulk insert ──────────────────────────────────────────

interface PreparedRow {
	userId: string;
	name: string;
	email: string;
	phoneNumber: string | null;
	programId: string;
	userType: "student" | "alumni";
	graduationYear: number | null;
	linkedInUrl: string | null;
	organizationName: string | null;
	position: string | null;
}

async function flushBatch(
	batch: PreparedRow[],
	hashedPassword: string,
	now: Date,
) {
	if (batch.length === 0) return;

	// Users
	await db
		.insert(schema.user)
		.values(
			batch.map((u) => ({
				id: u.userId,
				name: u.name,
				email: u.email,
				type: u.userType,
				emailVerified: true,
				phoneNumber: u.phoneNumber,
				createdAt: now,
				updatedAt: now,
			})),
		)
		.onConflictDoNothing({ target: schema.user.email });

	// Accounts
	await db
		.insert(schema.account)
		.values(
			batch.map((u) => ({
				id: crypto.randomUUID(),
				accountId: u.email,
				providerId: "credential",
				userId: u.userId,
				password: hashedPassword,
				createdAt: now,
				updatedAt: now,
			})),
		)
		.onConflictDoNothing();

	// Student profiles (for student type)
	const students = batch.filter((u) => u.userType === "student");
	if (students.length > 0) {
		await db
			.insert(schema.studentProfile)
			.values(
				students.map((u) => ({
					userId: u.userId,
					createdAt: now,
					updatedAt: now,
				})),
			)
			.onConflictDoNothing();
	}

	// Alumni profiles (for alumni type)
	const alumni = batch.filter((u) => u.userType === "alumni");
	if (alumni.length > 0) {
		await db
			.insert(schema.alumniProfile)
			.values(
				alumni.map((u) => ({
					userId: u.userId,
					createdAt: now,
					updatedAt: now,
				})),
			)
			.onConflictDoNothing();
	}

	// User education
	await db
		.insert(schema.userEducation)
		.values(
			batch.map((u) => ({
				id: crypto.randomUUID(),
				userId: u.userId,
				programId: u.programId,
				graduationYear: u.graduationYear,
				isPrimary: true,
			})),
		)
		.onConflictDoNothing();

	const linksRows = batch
		.filter((u) => u.linkedInUrl)
		.map((u) => ({
			id: crypto.randomUUID(),
			userId: u.userId,
			platform: "linkedin",
			url: u.linkedInUrl!,
			createdAt: now,
		}));
	if (linksRows.length > 0) {
		await db.insert(schema.links).values(linksRows).onConflictDoNothing();
	}

	const experienceRows = batch
		.filter((u) => u.organizationName || u.position)
		.map((u) => ({
			id: crypto.randomUUID(),
			userId: u.userId,
			type: "work",
			title: u.position || "Unknown",
			company: u.organizationName || "Unknown",
			startDate: null,
			endDate: null,
			isCurrent: true,
			createdAt: now,
			updatedAt: now,
		}));
	if (experienceRows.length > 0) {
		await db
			.insert(schema.experience)
			.values(experienceRows)
			.onConflictDoNothing();
	}

	// User settings
	await db
		.insert(schema.userSettings)
		.values(
			batch.map((u) => ({
				userId: u.userId,
				isVisibleInGalaxy: true,
				emailVisible: false,
				phoneNumberVisible: false,
			})),
		)
		.onConflictDoNothing();

	// Connection preferences
	const prefRows: Array<{ userId: string; type: ConnectionType }> = [];
	for (const u of batch) {
		const eligible =
			CONNECTION_TYPE_ELIGIBILITY[u.userType] ??
			CONNECTION_TYPE_ELIGIBILITY.student;
		for (const type of eligible) {
			prefRows.push({ userId: u.userId, type });
		}
	}
	if (prefRows.length > 0) {
		await db
			.insert(schema.userConnectionPreference)
			.values(prefRows)
			.onConflictDoNothing();
	}
}

// ── Routes ───────────────────────────────────────────────

export const adminModule = new Elysia({ prefix: "/admin" })
	.use(authContext)

	// ── Import AKSOB Excel ────────────────────────────────
	.post(
		"/import-excel",
		async ({ body, set }) => {
			const file = body.file;
			if (!file) {
				set.status = 400;
				return { status: "error", error: "No file provided" };
			}

			let rows: AlumniRow[];
			try {
				const buffer = Buffer.from(await file.arrayBuffer());
				const wb = XLSX.read(buffer, { type: "buffer" });
				const sheet = wb.Sheets[wb.SheetNames[0]];
				const raw = XLSX.utils.sheet_to_json(sheet, {
					defval: null,
				}) as AlumniRow[];
				rows = raw.filter((r) => r.Name);
			} catch {
				set.status = 400;
				return { status: "error", error: "Failed to parse Excel file" };
			}

			const { programs: dbPrograms, createdPrograms } =
				await ensureMappedPrograms();
			const existingEmails = new Set(
				(await db.select({ email: schema.user.email }).from(schema.user)).map(
					(r) => r.email.toLowerCase(),
				),
			);
			const existingPhones = new Set(
				(
					await db
						.select({ phoneNumber: schema.user.phoneNumber })
						.from(schema.user)
				)
					.map((r) => r.phoneNumber?.trim())
					.filter((phoneNumber): phoneNumber is string => Boolean(phoneNumber)),
			);

			const hashedPassword = await hashPassword(IMPORT_PASSWORD);
			const now = new Date();
			const stats: ImportStats = {
				total: rows.length,
				imported: 0,
				importedAlumni: 0,
				importedStudents: 0,
				createdPrograms,
				skippedNoEmail: 0,
				skippedNoProgram: 0,
				skippedExistingUser: 0,
				errors: 0,
				unmatchedMajors: [],
			};

			let batch: PreparedRow[] = [];

			for (const row of rows) {
				const email = pickFirstEmail(row)?.toLowerCase();
				if (!email) {
					stats.skippedNoEmail++;
					continue;
				}
				if (existingEmails.has(email)) {
					stats.skippedExistingUser++;
					continue;
				}

				const major = row.Major?.trim();
				if (!major) {
					stats.skippedNoProgram++;
					continue;
				}

				const matched = matchAlumniMajorToProgram(major, dbPrograms);
				if (!matched) {
					stats.skippedNoProgram++;
					if (!stats.unmatchedMajors.includes(major))
						stats.unmatchedMajors.push(major);
					continue;
				}

				const hasClassOf = Boolean(String(row["Class of"] ?? "").trim());
				const graduationYear = parseGraduationYear(row["Class of"]);
				const userType = hasClassOf ? "alumni" : "student";
				const name = row.Name?.trim() || "Unknown";
				const rawPhoneNumber =
					row.Mobile?.trim() || row.Mobile_US?.trim() || null;
				const phoneNumber =
					rawPhoneNumber && !existingPhones.has(rawPhoneNumber)
						? rawPhoneNumber
						: null;

				batch.push({
					userId: crypto.randomUUID(),
					name,
					email,
					phoneNumber,
					programId: matched.id,
					userType,
					graduationYear,
					linkedInUrl: cleanOptionalField(row["LinkedIn URL"]),
					organizationName: cleanOptionalField(row["Organization Name"]),
					position: cleanOptionalField(row.Position),
				});
				existingEmails.add(email);
				if (userType === "alumni") stats.importedAlumni++;
				else stats.importedStudents++;
				if (phoneNumber) existingPhones.add(phoneNumber);

				if (batch.length >= BATCH_SIZE) {
					await flushBatch(batch, hashedPassword, now);
					stats.imported += batch.length;
					batch = [];
				}
			}
			if (batch.length > 0) {
				await flushBatch(batch, hashedPassword, now);
				stats.imported += batch.length;
			}

			logger.info("Excel import done", {
				imported: stats.imported,
				skipped:
					stats.skippedNoEmail +
					stats.skippedNoProgram +
					stats.skippedExistingUser,
			});
			return { status: "ok", data: stats };
		},
		{
			auth: true,
			role: "admin",
			body: t.Object({ file: t.File() }),
			detail: { tags: ["Admin"], summary: "Import mixed users from Excel" },
		},
	);
