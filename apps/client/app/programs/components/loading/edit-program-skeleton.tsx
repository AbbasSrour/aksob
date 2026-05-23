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
import { Skeleton } from "@aksob/ui/core/skeleton";

export function EditProgramSkeleton() {
	return (
		<Main>
			<PageHeader
				title={
					<span className="inline-flex items-center gap-2">
						Edit
						<Skeleton className="h-5 w-28" />
					</span>
				}
				description="Update the program details."
				withSeparator
			>
				<ButtonSkeleton className="h-8 w-24" />
			</PageHeader>

			<FormContent>
				<FormSection layout="vertical">
					<FormSectionHeader>
						<FormSectionTitle>Program Details</FormSectionTitle>
						<FormSectionDescription>
							Update the program's name, level, description, credits, and
							duration.
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
