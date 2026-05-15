import { Button, Section, Text } from "@react-email/components";
import { render, toPlainText } from "@react-email/render";
import { EmailLayout } from "./components/email-layout";

export interface EventUpdatedEmailProps {
	name?: string | null;
	eventTitle: string;
	eventUrl: string;
	changes: string[];
}

export default function EventUpdatedEmail({
	name,
	eventTitle,
	eventUrl,
	changes,
}: EventUpdatedEmailProps) {
	const recipientName = name?.trim() || "there";

	return (
		<EmailLayout
			heading="Event details updated"
			preview={`${eventTitle} has been updated.`}
		>
			<Text className="m-0 text-[16px] leading-[26px] text-[#314843]">
				Hello {recipientName},
			</Text>
			<Text className="m-0 mt-[16px] text-[16px] leading-[26px] text-[#314843]">
				The organizer has updated <strong>{eventTitle}</strong>. Here's what
				changed:
			</Text>

			<Section className="mt-[20px] rounded-[12px] bg-[#f5f9f7] p-[24px]">
				{changes.map((change) => (
					<Text
						key={change}
						className="m-0 text-[15px] leading-[24px] text-[#314843]"
					>
						{change}
					</Text>
				))}
			</Section>

			<Section className="py-[24px] text-center">
				<Button
					href={eventUrl}
					className="rounded-[10px] bg-aksob-primary px-[24px] py-[14px] text-[15px] font-semibold text-white no-underline"
				>
					View updated event
				</Button>
			</Section>
		</EmailLayout>
	);
}

export async function generateEventUpdatedEmail(props: EventUpdatedEmailProps) {
	const html = await render(<EventUpdatedEmail {...props} />);

	return {
		subject: `Updated details for ${props.eventTitle} - AKSOB`,
		html,
		text: toPlainText(html),
	};
}
