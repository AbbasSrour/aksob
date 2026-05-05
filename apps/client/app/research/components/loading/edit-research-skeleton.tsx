import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { ButtonSkeleton } from "@aksob/ui/components/skeleton/button-skeleton";
import { FormFieldSkeleton } from "@aksob/ui/components/skeleton/form-field-skeleton";
import { FormFooterSkeleton } from "@aksob/ui/components/skeleton/form-footer-skeleton";
import { InputSkeleton } from "@aksob/ui/components/skeleton/input-skeleton";
import {
	FormContent,
	FormSection,
	FormSectionContent,
	FormSectionHeader,
	FormSectionTitle,
	FormSectionDescription,
	FormRow,
} from "@aksob/ui/core/form";

export function EditResearchSkeleton() {
	return (
		<Main>
			<PageHeader
				title="Edit Research Program"
				description="Update the research program details."
				withSeparator
			/>

			<FormContent>
				<FormSection layout="vertical">
					<FormSectionHeader>
						<FormSectionTitle>
							Basic Information
						</FormSectionTitle>
					</FormSectionHeader>
					<FormSectionContent cols={1} spacing="lg">
						<FormRow cols={1}>
							<FormFieldSkeleton>
								<FormFieldSkeleton.Label />
								<InputSkeleton />
							</FormFieldSkeleton>
						</FormRow>
						<FormRow cols={2}>
							<FormFieldSkeleton>
								<FormFieldSkeleton.Label />
								<InputSkeleton />
							</FormFieldSkeleton>
							<FormFieldSkeleton>
								<FormFieldSkeleton.Label />
								<InputSkeleton />
							</FormFieldSkeleton>
						</FormRow>
					</FormSectionContent>
				</FormSection>

				<FormSection layout="vertical">
					<FormSectionHeader>
						<FormSectionTitle>
							Institution Details
						</FormSectionTitle>
					</FormSectionHeader>
					<FormSectionContent cols={1} spacing="lg">
						<FormRow cols={1}>
							<FormFieldSkeleton>
								<FormFieldSkeleton.Label />
								<InputSkeleton />
							</FormFieldSkeleton>
						</FormRow>
						<FormRow cols={2}>
							<FormFieldSkeleton>
								<FormFieldSkeleton.Label />
								<InputSkeleton />
							</FormFieldSkeleton>
							<FormFieldSkeleton>
								<FormFieldSkeleton.Label />
								<InputSkeleton />
							</FormFieldSkeleton>
						</FormRow>
					</FormSectionContent>
				</FormSection>

				<FormSection layout="vertical">
					<FormSectionHeader>
						<FormSectionTitle>Description</FormSectionTitle>
						<FormSectionDescription>
							Provide the full description of the research
							program.
						</FormSectionDescription>
					</FormSectionHeader>
					<FormSectionContent cols={1} spacing="lg">
						<FormRow cols={1}>
							<FormFieldSkeleton>
								<FormFieldSkeleton.Label />
								<InputSkeleton className="h-40" />
							</FormFieldSkeleton>
						</FormRow>
					</FormSectionContent>
				</FormSection>
			</FormContent>

			<FormFooterSkeleton>
				<ButtonSkeleton className="h-9 w-24" />
				<ButtonSkeleton className="h-9 w-32" />
			</FormFooterSkeleton>
		</Main>
	);
}
