import { z } from "zod";

export const eventTypeValues = ["in_person", "online", "hybrid"] as const;
export const registrationModeValues = ["open", "approval"] as const;

const urlField = z
	.string()
	.url({ message: "Must be a valid URL" })
	.or(z.literal(""));

export const eventFormSchema = z
	.object({
		title: z.string().min(1, { message: "Title is required" }).max(200),
		description: z.string().min(1, { message: "Description is required" }),
		coverImage: urlField,
		eventType: z.enum(eventTypeValues),
		location: z.string().optional().default(""),
		meetingPlatform: z.string().optional().default(""),
		meetingUrl: urlField,
		startDate: z.string().min(1, { message: "Start date is required" }),
		endDate: z.string().min(1, { message: "End date is required" }),
		multiDay: z.boolean().default(false),
		requiresRegistration: z.boolean().default(true),
		registrationDeadline: z.string().optional().default(""),
		registrationMode: z.enum(registrationModeValues).default("open"),
		capacity: z.coerce
			.number()
			.int()
			.min(1, { message: "Capacity must be at least 1" })
			.optional()
			.default(0),
		checkInEnabled: z.boolean().default(false),
		remindersEnabled: z.boolean().default(true),
		attendeeListVisible: z.boolean().default(false),
	})
	.superRefine((data, ctx) => {
		// Location required for in-person and hybrid events
		if (
			(data.eventType === "in_person" || data.eventType === "hybrid") &&
			!data.location
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Location is required for in-person and hybrid events",
				path: ["location"],
			});
		}

		// Meeting URL required for online and hybrid events
		if (
			(data.eventType === "online" || data.eventType === "hybrid") &&
			!data.meetingUrl
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Meeting URL is required for online and hybrid events",
				path: ["meetingUrl"],
			});
		}

		// End date must be after start date (multi-day events only)
		if (
			data.multiDay &&
			data.startDate &&
			data.endDate &&
			data.endDate <= data.startDate
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "End date must be after start date",
				path: ["endDate"],
			});
		}

		// Registration deadline must be before start date
		if (
			data.requiresRegistration &&
			data.registrationDeadline &&
			data.startDate &&
			data.registrationDeadline >= data.startDate
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Registration deadline must be before the event start date",
				path: ["registrationDeadline"],
			});
		}
	});

export type EventFormSchema = z.infer<typeof eventFormSchema>;

export const eventFormDefaultValues: EventFormSchema = {
	title: "",
	description: "",
	coverImage: "",
	eventType: "in_person",
	location: "",
	meetingPlatform: "",
	meetingUrl: "",
	startDate: "",
	endDate: "",
	multiDay: false,
	requiresRegistration: true,
	registrationDeadline: "",
	registrationMode: "open",
	capacity: 0,
	checkInEnabled: false,
	remindersEnabled: true,
	attendeeListVisible: false,
};
