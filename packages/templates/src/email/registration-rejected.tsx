import { Section, Text } from "@react-email/components";
import { render, toPlainText } from "@react-email/render";
import { EmailLayout } from "./components/email-layout";

export interface RegistrationRejectedEmailProps {
	name?: string | null;
	eventTitle: string;
	reason?: string | null;
}

export default function RegistrationRejectedEmail({
	name,
	eventTitle,
	reason,
}: RegistrationRejectedEmailProps) {
	const recipientName = name?.trim() || "there";

	return (
		<EmailLayout
			heading="Registration not approved"
			preview={`Your registration for ${eventTitle} was not approved.`}
		>
			<Text className="m-0 text-[16px] leading-[26px] text-[#314843]">
				Hello {recipientName},
			</Text>
			<Text className="m-0 mt-[16px] text-[16px] leading-[26px] text-[#314843]">
				We're sorry, but your registration for <strong>{eventTitle}</strong> was
				not approved.
			</Text>

			{reason ? (
				<Section className="mt-[20px] rounded-[12px] border border-solid border-[#f0e5e5] bg-[#fdf6f6] p-[24px]">
					<Text className="m-0 text-[13px] font-semibold uppercase tracking-[1px] text-[#8b5a5a]">
						Reason
					</Text>
					<Text className="m-0 mt-[8px] text-[15px] leading-[24px] text-[#5a3d3d]">
						{reason}
					</Text>
				</Section>
			) : null}

			<Text className="m-0 mt-[20px] text-[16px] leading-[26px] text-[#314843]">
				If you have questions, feel free to reach out to the event organizers.
			</Text>
		</EmailLayout>
	);
}

export async function generateRegistrationRejectedEmail(
	props: RegistrationRejectedEmailProps,
) {
	const html = await render(<RegistrationRejectedEmail {...props} />);

	return {
		subject: `Registration update for ${props.eventTitle} - AKSOB`,
		html,
		text: toPlainText(html),
	};
}
