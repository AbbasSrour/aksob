import { Button, Section, Text } from "@react-email/components";
import { render, toPlainText } from "@react-email/render";
import { EmailLayout } from "./components/email-layout";

export interface SurveyLinkEmailProps {
	name?: string | null;
	eventTitle: string;
	surveyUrl: string;
}

export default function SurveyLinkEmail({
	name,
	eventTitle,
	surveyUrl,
}: SurveyLinkEmailProps) {
	const recipientName = name?.trim() || "there";

	return (
		<EmailLayout
			heading="We'd love your feedback"
			preview={`Share your feedback on ${eventTitle}.`}
		>
			<Text className="m-0 text-[16px] leading-[26px] text-[#314843]">
				Hello {recipientName},
			</Text>
			<Text className="m-0 mt-[16px] text-[16px] leading-[26px] text-[#314843]">
				Thank you for attending <strong>{eventTitle}</strong>. We'd love to hear
				your thoughts.
			</Text>
			<Text className="m-0 mt-[16px] text-[16px] leading-[26px] text-[#314843]">
				Your feedback helps us improve future events for the AKSOB community.
			</Text>

			<Section className="py-[24px] text-center">
				<Button
					href={surveyUrl}
					className="rounded-[10px] bg-aksob-primary px-[24px] py-[14px] text-[15px] font-semibold text-white no-underline"
				>
					Take the survey
				</Button>
			</Section>

			<Text className="m-0 text-[14px] leading-[22px] text-[#5f746d]">
				This survey takes just a few minutes. All responses are anonymous.
			</Text>
		</EmailLayout>
	);
}

export async function generateSurveyLinkEmail(props: SurveyLinkEmailProps) {
	const html = await render(<SurveyLinkEmail {...props} />);

	return {
		subject: `Share your feedback on ${props.eventTitle} - AKSOB`,
		html,
		text: toPlainText(html),
	};
}
