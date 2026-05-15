import { Button, Section, Text } from "@react-email/components";
import { render, toPlainText } from "@react-email/render";
import { EmailLayout } from "./components/email-layout";

export interface RegistrationPendingEmailProps {
	name?: string | null;
	eventTitle: string;
	eventDate: string;
	eventUrl: string;
}

export default function RegistrationPendingEmail({
	name,
	eventTitle,
	eventDate,
	eventUrl,
}: RegistrationPendingEmailProps) {
	const recipientName = name?.trim() || "there";

	return (
		<EmailLayout
			heading="Registration pending"
			preview={`Your registration for ${eventTitle} is pending approval.`}
		>
			<Text className="m-0 text-[16px] leading-[26px] text-[#314843]">
				Hello {recipientName},
			</Text>
			<Text className="m-0 mt-[16px] text-[16px] leading-[26px] text-[#314843]">
				Thank you for your interest in <strong>{eventTitle}</strong>. Your
				registration is currently pending organizer approval.
			</Text>

			<Section className="mt-[20px] rounded-[12px] bg-[#f5f9f7] p-[24px]">
				<Text className="m-0 text-[18px] font-semibold text-aksob-primary">
					{eventTitle}
				</Text>
				<Text className="m-0 mt-[8px] text-[14px] leading-[22px] text-[#5f746d]">
					{eventDate}
				</Text>
			</Section>

			<Text className="m-0 mt-[20px] text-[16px] leading-[26px] text-[#314843]">
				You'll receive another email once your registration has been reviewed.
				There's no action needed from you right now.
			</Text>

			<Section className="py-[24px] text-center">
				<Button
					href={eventUrl}
					className="rounded-[10px] bg-aksob-primary px-[24px] py-[14px] text-[15px] font-semibold text-white no-underline"
				>
					View event details
				</Button>
			</Section>
		</EmailLayout>
	);
}

export async function generateRegistrationPendingEmail(
	props: RegistrationPendingEmailProps,
) {
	const html = await render(<RegistrationPendingEmail {...props} />);

	return {
		subject: `Registration pending for ${props.eventTitle} - AKSOB`,
		html,
		text: toPlainText(html),
	};
}
