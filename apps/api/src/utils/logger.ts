import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { env } from "@/config/env";

const { combine, timestamp, printf, colorize, json } = winston.format;

export const logger = winston.createLogger({
	level: env.LOG_LEVEL,
	format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), json()),
	transports: [
		new winston.transports.Console({
			format: combine(
				colorize({ level: true }),
				timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
				printf(({ level, message, timestamp, ...meta }) => {
					const metaStr = Object.keys(meta).length
						? ` ${Object.entries(meta)
								.map(
									([k, v]) =>
										`${k}=${typeof v === "string" ? v : JSON.stringify(v)}`,
								)
								.join(" ")}`
						: "";

					return `${timestamp} [${level}] ${message}${metaStr}`;
				}),
			),
		}),
		new DailyRotateFile({
			filename: "logs/%DATE%.log",
			datePattern: "YYYY-MM-DD",
			format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), json()),
			maxFiles: "30d",
		}),
	],
});
