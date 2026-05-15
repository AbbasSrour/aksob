import { Button, Section, Text } from "@react-email/components";
import { render, toPlainText } from "@react-email/render";
import { EmailLayout } from "./components/email-layout";

export interface WaitlistPromotionEmailProps {
	name?: string | null;
	eventTitle: string;
	eventDate: string;
	eventUrl: string;
}

export default function WaitlistPromotionEmail({
	name,
	eventTitle,
	eventDate,
	eventUrl,
}: WaitlistPromotionEmailProps) {
	const recipientName = name?.trim() || "there";

	return (
		<EmailLayout
			heading="You're off the waitlist!"
			preview={`You've been promoted from the waitlist for ${eventTitle}.`}
		>
			<Text className="m-0 text-[16px] leading-[26px] text-[#314843]">
				Hello {recipientName},
			</Text>
			<Text className="m-0 mt-[16px] text-[16px] leading-[26px] text-[#314843]">
				Good news — a spot opened up and you've been promoted from the waitlist
				for <strong>{eventTitle}</strong>. You're now confirmed!
			</Text>

			<Section className="mt-[20px] rounded-[12px] bg-[#f5f9f7] p-[24px]">
				<Text className="m-0 text-[18px] font-semibold text-aksob-primary">
					{eventTitle}
				</Text>
				<Text className="m-0 mt-[8px] text-[14px] leading-[22px] text-[#5f746d]">
					{eventDate}
				</Text>
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
				If your plans have changed and you can no longer attend, please cancel
				your registration so someone else can take your spot.
			</Text>
		</EmailLayout>
	);
}

export async function generateWaitlistPromotionEmail(
	props: WaitlistPromotionEmailProps,
) {
	const html = await render(<WaitlistPromotionEmail {...props} />);

	return {
		subject: `You're off the waitlist for ${props.eventTitle} - AKSOB`,
		html,
		text: toPlainText(html),
	};
}
