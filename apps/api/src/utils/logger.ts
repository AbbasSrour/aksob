import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { env } from "@/config/env";

const { combine, timestamp, printf, colorize, json } = winston.format;

/**
 * Console format: human-readable standardized output
 */
const consoleFormat = printf(({ level, message, timestamp, ...meta }) => {
	const metaStr = Object.keys(meta).length
		? ` ${Object.entries(meta)
				.map(
					([k, v]) => `${k}=${typeof v === "string" ? v : JSON.stringify(v)}`,
				)
				.join(" ")}`
		: "";

	return `${timestamp} [${level}] ${message}${metaStr}`;
});

/**
 * File format: structured JSON for log aggregation
 */
const fileFormat = combine(
	timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
	json(),
);

export const logger = winston.createLogger({
	level: env.LOG_LEVEL,
	format: fileFormat,
	transports: [
		// Console: standardized human-readable format with colors
		new winston.transports.Console({
			format: combine(
				colorize({ level: true }),
				timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
				consoleFormat,
			),
		}),
		// File: daily rotated structured JSON logs
		new DailyRotateFile({
			filename: "logs/%DATE%.log",
			datePattern: "YYYY-MM-DD",
			format: fileFormat,
			maxFiles: "30d",
		}),
	],
});
