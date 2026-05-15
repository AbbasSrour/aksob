import { Button, Img, Link, Section, Text } from "@react-email/components";
import { render, toPlainText } from "@react-email/render";
import QRCode from "qrcode";
import { EmailLayout } from "./components/email-layout";

export interface RegistrationApprovedEmailProps {
	name?: string | null;
	eventTitle: string;
	eventDate: string;
	eventUrl: string;
	meetingUrl?: string | null;
	meetingPlatform?: string | null;
	ticketToken?: string | null;
	ticketQrDataUri?: string | null;
}

export default function RegistrationApprovedEmail({
	name,
	eventTitle,
	eventDate,
	eventUrl,
	meetingUrl,
	meetingPlatform,
	ticketToken,
	ticketQrDataUri,
}: RegistrationApprovedEmailProps) {
	const recipientName = name?.trim() || "there";

	return (
		<EmailLayout
			heading="Registration approved"
			preview={`You're approved for ${eventTitle}.`}
		>
			<Text className="m-0 text-[16px] leading-[26px] text-[#314843]">
				Hello {recipientName},
			</Text>
			<Text className="m-0 mt-[16px] text-[16px] leading-[26px] text-[#314843]">
				Great news — your registration for <strong>{eventTitle}</strong> has
				been approved.
			</Text>

			<Section className="mt-[20px] rounded-[12px] bg-[#f5f9f7] p-[24px]">
				<Text className="m-0 text-[18px] font-semibold text-aksob-primary">
					{eventTitle}
				</Text>
				<Text className="m-0 mt-[8px] text-[14px] leading-[22px] text-[#5f746d]">
					{eventDate}
				</Text>
			</Section>

			{meetingUrl ? (
				<Section className="mt-[20px] rounded-[12px] border border-solid border-[#c7ece2] bg-white p-[24px]">
					<Text className="m-0 text-[13px] font-semibold uppercase tracking-[1px] text-[#5f746d]">
						Join Link
					</Text>
					<Link
						href={meetingUrl}
						className="mt-[8px] block break-all text-[15px] font-semibold leading-[22px] text-aksob-primary underline"
					>
						{meetingUrl}
					</Link>
					{meetingPlatform ? (
						<Text className="m-0 mt-[6px] text-[13px] leading-[20px] text-[#5f746d]">
							Platform: {meetingPlatform}
						</Text>
					) : null}
				</Section>
			) : null}

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
		</EmailLayout>
	);
}

export async function generateRegistrationApprovedEmail(
	props: RegistrationApprovedEmailProps,
) {
	const ticketQrDataUri = props.ticketToken
		? await QRCode.toDataURL(props.ticketToken, { width: 320 })
		: null;

	const html = await render(
		<RegistrationApprovedEmail {...props} ticketQrDataUri={ticketQrDataUri} />,
	);

	return {
		subject: `Registration approved for ${props.eventTitle} - AKSOB`,
		html,
		text: toPlainText(html),
	};
}
