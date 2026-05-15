import { Button, Link, Section, Text } from "@react-email/components";
import { render, toPlainText } from "@react-email/render";
import { EmailLayout } from "./components/email-layout";

export interface PasswordResetEmailProps {
	name?: string | null;
	resetUrl: string;
	expiresIn?: string;
}

export default function PasswordResetEmail({
	name,
	resetUrl,
	expiresIn = "1 hour",
}: PasswordResetEmailProps) {
	const recipientName = name?.trim() || "there";

	return (
		<EmailLayout
			heading="Reset your password"
			preview="Create a new password for your AKSOB account."
		>
			<Text className="m-0 text-[16px] leading-[26px] text-[#314843]">
				Hello {recipientName},
			</Text>
			<Text className="m-0 mt-[16px] text-[16px] leading-[26px] text-[#314843]">
				We received a request to reset the password for your AKSOB account. Use
				the button below to choose a new password.
			</Text>
			<Section className="py-[24px] text-center">
				<Button
					href={resetUrl}
					className="rounded-[10px] bg-aksob-primary px-[24px] py-[14px] text-[15px] font-semibold text-white no-underline"
				>
					Reset password
				</Button>
			</Section>
			<Text className="m-0 text-[14px] leading-[22px] text-[#5f746d]">
				This link expires in {expiresIn}.
			</Text>
			<Text className="m-0 mt-[18px] text-[14px] leading-[22px] text-[#5f746d]">
				If the button does not open, copy and paste this link into your browser:
			</Text>
			<Link
				href={resetUrl}
				className="mt-[8px] block break-all text-[14px] leading-[22px] text-aksob-primary underline"
			>
				{resetUrl}
			</Link>
			<Text className="m-0 mt-[24px] text-[14px] leading-[22px] text-[#5f746d]">
				If you did not request a password reset, you can ignore this email. Your
				current password stays the same.
			</Text>
		</EmailLayout>
	);
}

export async function generatePasswordResetEmail(
	props: PasswordResetEmailProps,
) {
	const html = await render(<PasswordResetEmail {...props} />);

	return {
		subject: "Reset Your Password - AKSOB",
		html,
		text: toPlainText(html),
	};
}
