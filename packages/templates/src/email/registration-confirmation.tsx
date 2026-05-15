import { Button, Img, Section, Text } from "@react-email/components";
import { render, toPlainText } from "@react-email/render";
import QRCode from "qrcode";
import { EmailLayout } from "./components/email-layout";

export interface RegistrationConfirmationEmailProps {
	name?: string | null;
	eventTitle: string;
	eventDate: string;
	eventLocation?: string | null;
	eventUrl: string;
	ticketToken?: string | null;
	ticketQrDataUri?: string | null;
}

export default function RegistrationConfirmationEmail({
	name,
	eventTitle,
	eventDate,
	eventLocation,
	eventUrl,
	ticketToken,
	ticketQrDataUri,
}: RegistrationConfirmationEmailProps) {
	const recipientName = name?.trim() || "there";

	return (
		<EmailLayout
			heading="You're registered!"
			preview={`You're registered for ${eventTitle}.`}
		>
			<Text className="m-0 text-[16px] leading-[26px] text-[#314843]">
				Hello {recipientName},
			</Text>
			<Text className="m-0 mt-[16px] text-[16px] leading-[26px] text-[#314843]">
				You're all set for <strong>{eventTitle}</strong>. Here are the details:
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

			{ticketToken ? (
				<Section className="mt-[20px] rounded-[12px] border border-dashed border-[#c7ece2] bg-white p-[24px] text-center">
					<Text className="m-0 text-[13px] font-semibold uppercase tracking-[1px] text-[#5f746d]">
						Your Check-in Token
					</Text>
					{ticketQrDataUri ? (
						<Img
							src={ticketQrDataUri}
							alt="Check-in QR code"
							className="mx-auto my-[12px] block"
							width={160}
							height={160}
						/>
					) : null}
					<Text className="m-0 mt-[8px] font-mono text-[22px] font-bold tracking-[2px] text-aksob-dark">
						{ticketToken}
					</Text>
					<Text className="m-0 mt-[8px] text-[13px] leading-[20px] text-[#5f746d]">
						Show this token at the event entrance for quick check-in.
					</Text>
				</Section>
			) : null}

			<Section className="py-[24px] text-center">
				<Button
					href={eventUrl}
					className="rounded-[10px] bg-aksob-primary px-[24px] py-[14px] text-[15px] font-semibold text-white no-underline"
				>
					View event details
				</Button>
			</Section>

			<Text className="m-0 text-[14px] leading-[22px] text-[#5f746d]">
				If you can no longer attend, please cancel your registration so someone
				on the waitlist can take your spot.
			</Text>
		</EmailLayout>
	);
}

export async function generateRegistrationConfirmationEmail(
	props: RegistrationConfirmationEmailProps,
) {
	const ticketQrDataUri = props.ticketToken
		? await QRCode.toDataURL(props.ticketToken, { width: 320 })
		: null;

	const html = await render(
		<RegistrationConfirmationEmail
			{...props}
			ticketQrDataUri={ticketQrDataUri}
		/>,
	);

	return {
		subject: `You're registered for ${props.eventTitle} - AKSOB`,
		html,
		text: toPlainText(html),
	};
}
