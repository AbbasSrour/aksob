import { Section, Text } from "@react-email/components";
import { render, toPlainText } from "@react-email/render";
import { EmailLayout } from "./components/email-layout";

export interface EventCancelledEmailProps {
	name?: string | null;
	eventTitle: string;
	reason?: string | null;
}

export default function EventCancelledEmail({
	name,
	eventTitle,
	reason,
}: EventCancelledEmailProps) {
	const recipientName = name?.trim() || "there";

	return (
		<EmailLayout
			heading="Event cancelled"
			preview={`${eventTitle} has been cancelled.`}
		>
			<Text className="m-0 text-[16px] leading-[26px] text-[#314843]">
				Hello {recipientName},
			</Text>
			<Text className="m-0 mt-[16px] text-[16px] leading-[26px] text-[#314843]">
				We're sorry to let you know that <strong>{eventTitle}</strong> has been
				cancelled.
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
				We apologize for any inconvenience. If you have questions, please reach
				out to the event organizers.
			</Text>
		</EmailLayout>
	);
}

export async function generateEventCancelledEmail(
	props: EventCancelledEmailProps,
) {
	const html = await render(<EventCancelledEmail {...props} />);

	return {
		subject: `Event cancelled: ${props.eventTitle} - AKSOB`,
		html,
		text: toPlainText(html),
	};
}
