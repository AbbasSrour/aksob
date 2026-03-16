import {
	Body,
	Container,
	Head,
	Hr,
	Html,
	Preview,
	pixelBasedPreset,
	Section,
	Tailwind,
	Text,
} from "@react-email/components";
import type { ReactNode } from "react";

interface EmailLayoutProps {
	children: ReactNode;
	heading: string;
	preview: string;
	footer?: ReactNode;
}

const tailwindConfig = {
	presets: [pixelBasedPreset],
	theme: {
		extend: {
			colors: {
				aksob: {
					primary: "#076951",
					secondary: "#16876b",
					muted: "#365951",
					dark: "#192c27",
					cream: "#f5f3ee",
				},
			},
		},
	},
};

export function EmailLayout({
	children,
	heading,
	preview,
	footer,
}: EmailLayoutProps) {
	return (
		<Html lang="en">
			<Head />
			<Preview>{preview}</Preview>
			<Tailwind config={tailwindConfig}>
				<Body className="m-0 bg-[#edf3f1] px-[16px] py-[32px] font-sans text-aksob-dark">
					<Container className="mx-auto max-w-[600px] overflow-hidden rounded-[20px] border border-solid border-[#d6e4df] bg-white shadow-[0_10px_30px_rgba(25,44,39,0.08)]">
						<Section className="bg-aksob-dark bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_45%),linear-gradient(135deg,_#192c27_0%,_#076951_100%)] px-[32px] py-[28px] text-white">
							<Text className="m-0 text-[12px] font-semibold uppercase tracking-[2px] text-[#c7ece2]">
								AKSOB Community
							</Text>
							<Text className="m-0 mt-[12px] text-[28px] font-semibold leading-[36px] text-white">
								{heading}
							</Text>
						</Section>
						<Section className="px-[32px] py-[32px]">{children}</Section>
						<Hr className="m-0 border-none border-t border-solid border-[#e5ece9]" />
						<Section className="px-[32px] py-[24px]">
							{footer ?? (
								<Text className="m-0 text-[13px] leading-[20px] text-[#5f746d]">
									This message was sent by AKSOB. If you were not expecting it,
									you can safely ignore it.
								</Text>
							)}
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
}
