import { Button, Section, Text } from "@react-email/components";
import { render, toPlainText } from "@react-email/render";
import { EmailLayout } from "./components/email-layout";

export interface EventReminderEmailProps {
	name?: string | null;
	eventTitle: string;
	eventDate: string;
	eventLocation?: string | null;
	eventUrl: string;
	reminderLabel: string;
}

export default function EventReminderEmail({
	name,
	eventTitle,
	eventDate,
	eventLocation,
	eventUrl,
	reminderLabel,
}: EventReminderEmailProps) {
	const recipientName = name?.trim() || "there";

	return (
		<EmailLayout
			heading="Event reminder"
			preview={`${eventTitle} starts ${reminderLabel}.`}
		>
			<Text className="m-0 text-[16px] leading-[26px] text-[#314843]">
				Hello {recipientName},
			</Text>
			<Text className="m-0 mt-[16px] text-[16px] leading-[26px] text-[#314843]">
				Just a friendly reminder that <strong>{eventTitle}</strong> starts{" "}
				<strong>{reminderLabel}</strong>.
			</Text>

			<Section className="mt-[20px] rounded-[12px] bg-[#f5f9f7] p-[24px]">
				<Text className="m-0 text-[18px] font-semibold text-aksob-primary">
					{eventTitle}
				</Text>
				<Text className="m-0 mt-[8px] text-[14px] leading-[22px] text-[#5f746d]">
					{eventDate}
				</Text>
				{eventLocation ? (
					<Text className="m-0 mt-[4px] text-[14px] leading-[22px] text-[#5f746d]">
						{eventLocation}
					</Text>
				) : null}
			</Section>

			<Section className="py-[24px] text-center">
				<Button
					href={eventUrl}
					className="rounded-[10px] bg-aksob-primary px-[24px] py-[14px] text-[15px] font-semibold text-white no-underline"
				>
					View event details
				</Button>
			</Section>

			<Text className="m-0 text-[14px] leading-[22px] text-[#5f746d]">
				We look forward to seeing you there!
			</Text>
		</EmailLayout>
	);
}

export async function generateEventReminderEmail(
	props: EventReminderEmailProps,
) {
	const html = await render(<EventReminderEmail {...props} />);

	return {
		subject: `Reminder: ${props.eventTitle} starts ${props.reminderLabel} - AKSOB`,
		html,
		text: toPlainText(html),
	};
}
