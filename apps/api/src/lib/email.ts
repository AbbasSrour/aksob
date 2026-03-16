import { Resend } from "resend";
import { env } from "@/config/env";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export interface SendEmailOptions {
	to: string | string[];
	subject: string;
	html: string;
	text?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
	if (!resend) {
		console.warn(
			"RESEND_API_KEY not configured. Email would have been sent:",
			options,
		);
		return;
	}

	const { data, error } = await resend.emails.send({
		from: env.EMAIL_FROM,
		to: options.to,
		subject: options.subject,
		html: options.html,
		text: options.text,
	});

	if (error) {
		console.error("Failed to send email:", error);
		throw new Error(`Failed to send email: ${error.message}`);
	}

	console.debug("Email sent successfully:", data?.id);
}
