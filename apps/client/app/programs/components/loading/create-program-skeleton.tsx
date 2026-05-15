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
	FormSectionDescription,
	FormSectionHeader,
	FormSectionTitle,
	FormRow,
} from "@aksob/ui/core/form";

export function CreateProgramSkeleton() {
	return (
		<Main>
			<PageHeader
				title="New Program"
				description="Add a new academic program to the system."
				withSeparator
			/>

			<FormContent>
				<FormSection layout="vertical">
					<FormSectionHeader>
						<FormSectionTitle>Program Details</FormSectionTitle>
						<FormSectionDescription>
							Enter the program's name, level, description, credits, and duration.
						</FormSectionDescription>
					</FormSectionHeader>

					<FormSectionContent cols={1} spacing="lg">
						<FormRow cols={1}>
							<FormFieldSkeleton>
								<FormFieldSkeleton.Label />
								<InputSkeleton />
							</FormFieldSkeleton>
						</FormRow>

						<FormRow cols={1}>
							<FormFieldSkeleton>
								<FormFieldSkeleton.Label />
								<InputSkeleton />
							</FormFieldSkeleton>
						</FormRow>

						<FormRow cols={1}>
							<FormFieldSkeleton>
								<FormFieldSkeleton.Label />
								<InputSkeleton className="h-20" />
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
			</FormContent>

			<FormFooterSkeleton>
				<ButtonSkeleton className="h-9 w-24" />
				<ButtonSkeleton className="h-9 w-32" />
			</FormFooterSkeleton>
		</Main>
	);
}
