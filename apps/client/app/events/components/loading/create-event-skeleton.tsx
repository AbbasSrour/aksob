import { Main } from "@aksob/ui/components/layout/main";
import { PageHeader } from "@aksob/ui/components/layout/page-header";
import { ButtonSkeleton } from "@aksob/ui/components/skeleton/button-skeleton";
import { FormFieldSkeleton } from "@aksob/ui/components/skeleton/form-field-skeleton";
import { FormFooterSkeleton } from "@aksob/ui/components/skeleton/form-footer-skeleton";
import { InputSkeleton } from "@aksob/ui/components/skeleton/input-skeleton";
import {
	FormContent,
	FormRow,
	FormSection,
	FormSectionContent,
	FormSectionDescription,
	FormSectionHeader,
	FormSectionTitle,
} from "@aksob/ui/core/form";

export function CreateEventSkeleton() {
	return (
		<Main>
			<PageHeader
				title="Create Event"
				description="Set up a new event."
				withSeparator
			/>

			<FormContent>
				<FormSection layout="vertical">
					<FormSectionHeader>
						<FormSectionTitle>Event Details</FormSectionTitle>
						<FormSectionDescription>
							Basic information about the event.
						</FormSectionDescription>
					</FormSectionHeader>

					<FormSectionContent cols={1} spacing="lg">
						<FormRow cols={4}>
							<FormFieldSkeleton>
								<FormFieldSkeleton.Label />
								<InputSkeleton />
							</FormFieldSkeleton>
						</FormRow>

						<FormRow cols={4}>
							<FormFieldSkeleton>
								<FormFieldSkeleton.Label />
								<InputSkeleton />
							</FormFieldSkeleton>
						</FormRow>

						<FormRow cols={4}>
							<FormFieldSkeleton>
								<FormFieldSkeleton.Label />
								<InputSkeleton className="h-32" />
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
