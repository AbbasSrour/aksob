import { Button, Link, Section, Text } from "@react-email/components";
import { render, toPlainText } from "@react-email/render";
import { EmailLayout } from "../components/email-layout";

export interface EmailVerificationEmailProps {
	name?: string | null;
	verificationUrl: string;
	expiresIn?: string;
}

export function EmailVerificationEmail({
	name,
	verificationUrl,
	expiresIn = "1 hour",
}: EmailVerificationEmailProps) {
	const recipientName = name?.trim() || "there";

	return (
		<EmailLayout
			heading="Confirm your email"
			preview="Verify your email address for your AKSOB account."
		>
			<Text className="m-0 text-[16px] leading-[26px] text-[#314843]">
				Hello {recipientName},
			</Text>
			<Text className="m-0 mt-[16px] text-[16px] leading-[26px] text-[#314843]">
				Use the button below to confirm this email address for your AKSOB
				account. If you did not request this change, you can ignore this message.
			</Text>
			<Section className="py-[24px] text-center">
				<Button
					href={verificationUrl}
					className="rounded-[10px] bg-aksob-primary px-[24px] py-[14px] text-[15px] font-semibold text-white no-underline"
				>
					Confirm email
				</Button>
			</Section>
			<Text className="m-0 text-[14px] leading-[22px] text-[#5f746d]">
				This link expires in {expiresIn}.
			</Text>
			<Text className="m-0 mt-[18px] text-[14px] leading-[22px] text-[#5f746d]">
				If the button does not open, copy and paste this link into your browser:
			</Text>
			<Link
				href={verificationUrl}
				className="mt-[8px] block break-all text-[14px] leading-[22px] text-aksob-primary underline"
			>
				{verificationUrl}
			</Link>
		</EmailLayout>
	);
}

export async function generateEmailVerificationEmail(
	props: EmailVerificationEmailProps,
) {
	const html = await render(<EmailVerificationEmail {...props} />);

	return {
		subject: "Confirm Your Email - AKSOB",
		html,
		text: toPlainText(html),
	};
}
