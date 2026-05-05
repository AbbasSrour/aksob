import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@aksob/ui/core/button";
import { Input } from "@aksob/ui/core/input";
import { Textarea } from "@aksob/ui/core/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@aksob/ui/core/select";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@aksob/ui/core/form";
import {
	FormContent,
	FormSection,
	FormSectionContent,
	FormSectionDescription,
	FormSectionHeader,
	FormSectionTitle,
	FormRow,
	FormFooter,
} from "@aksob/ui/core/form";
import {
	researchFormSchema,
	type ResearchFormSchema,
	researchFormDefaultValues,
} from "@/app/research/components/form/research-form-schema";
import { TipTapEditor } from "@/app/stories/components/form/tip-tap-editor";
import {
	educationLevelOptions,
	fundingOptions,
	researchTypeOptions,
} from "@/app/research/constants/research-type-options";
import type { Research } from "@/app/research/hooks/api/research.functions";
import {
	useCreateResearch,
	useUpdateResearch,
} from "@/app/research/hooks/api/research.queries";
import { m } from "@/paraglide/messages";

interface ResearchFormProps {
	researchId?: string;
	existingResearch?: Research;
}

export function ResearchForm({
	researchId,
	existingResearch,
}: ResearchFormProps) {
	const navigate = useNavigate();
	const isEditing = Boolean(researchId);
	const { mutate: createResearch, isPending: isCreating } =
		useCreateResearch();
	const { mutate: updateResearch, isPending: isUpdating } =
		useUpdateResearch();
	const isPending = isCreating || isUpdating;

	const defaultValues = existingResearch
		? {
				title: existingResearch.title,
				content: existingResearch.content,
				researchType: existingResearch.researchType,
				institution: existingResearch.institution,
				department: existingResearch.department ?? "",
				duration: existingResearch.duration ?? "",
				funding: existingResearch.funding ?? undefined,
				location: existingResearch.location ?? "",
				startDate: existingResearch.startDate ?? "",
				deadline: existingResearch.deadline ?? "",
				educationLevel: existingResearch.educationLevel ?? undefined,
				fieldOfStudy: existingResearch.fieldOfStudy ?? "",
				experienceRequired: existingResearch.experienceRequired ?? "",
				skillsRequired: existingResearch.skillsRequired ?? "",
				additionalRequirements:
					existingResearch.additionalRequirements ?? "",
			}
		: researchFormDefaultValues;

	const form = useForm<ResearchFormSchema>({
		resolver: zodResolver(researchFormSchema),
		defaultValues,
	});

	const onSubmit = (values: ResearchFormSchema) => {
		if (isEditing && researchId) {
			updateResearch(
				{ id: researchId, ...values },
				{
					onSuccess: () => {
						navigate({ to: "/admin/research" });
					},
				},
			);
		} else {
			createResearch(values, {
				onSuccess: () => {
					navigate({ to: "/admin/research" });
				},
			});
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<FormContent>
					{/* Basic Information */}
					<FormSection>
						<FormSectionHeader>
							<FormSectionTitle>
								{m.research_form_basic_section_title()}
							</FormSectionTitle>
							<FormSectionDescription>
								{m.research_form_basic_section_description()}
							</FormSectionDescription>
						</FormSectionHeader>
						<FormSectionContent>
							<FormRow cols={1}>
								<FormField
									control={form.control}
									name="title"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												{m.research_form_title_label()}
											</FormLabel>
											<FormControl>
												<Input
													placeholder={m.research_form_title_placeholder()}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</FormRow>

							<FormRow cols={2}>
								<FormField
									control={form.control}
									name="researchType"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												{m.research_form_type_label()}
											</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue
															placeholder={m.research_form_select_placeholder()}
														/>
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{researchTypeOptions.map(
														(option) => (
															<SelectItem
																key={option.value}
																value={option.value}
															>
																{option.label}
															</SelectItem>
														),
													)}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="educationLevel"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												{m.research_form_education_level_label()}
											</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue
															placeholder={m.research_form_select_placeholder()}
														/>
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{educationLevelOptions.map(
														(option) => (
															<SelectItem
																key={option.value}
																value={option.value}
															>
																{option.label}
															</SelectItem>
														),
													)}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</FormRow>
						</FormSectionContent>
					</FormSection>

					{/* Institution Details */}
					<FormSection>
						<FormSectionHeader>
							<FormSectionTitle>
								{m.research_form_institution_section_title()}
							</FormSectionTitle>
						</FormSectionHeader>
						<FormSectionContent>
							<FormRow cols={1}>
								<FormField
									control={form.control}
									name="institution"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												{m.research_form_institution_label()}
												<span className="text-destructive">
													*
												</span>
											</FormLabel>
											<FormControl>
												<Input
													placeholder={m.research_form_institution_placeholder()}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</FormRow>

							<FormRow cols={2}>
								<FormField
									control={form.control}
									name="department"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												{m.research_form_department_label()}
											</FormLabel>
											<FormControl>
												<Input
													placeholder={m.research_form_department_placeholder()}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="fieldOfStudy"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												{m.research_form_field_of_study_label()}
											</FormLabel>
											<FormControl>
												<Input
													placeholder={m.research_form_field_of_study_placeholder()}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</FormRow>

							<FormRow cols={1}>
								<FormField
									control={form.control}
									name="location"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												{m.research_form_location_label()}
											</FormLabel>
											<FormControl>
												<Input
													placeholder={m.research_form_location_placeholder()}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</FormRow>
						</FormSectionContent>
					</FormSection>

					{/* Timeline & Funding */}
					<FormSection>
						<FormSectionHeader>
							<FormSectionTitle>
								{m.research_form_timeline_section_title()}
							</FormSectionTitle>
						</FormSectionHeader>
						<FormSectionContent>
							<FormRow cols={2}>
								<FormField
									control={form.control}
									name="startDate"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												{m.research_form_start_date_label()}
											</FormLabel>
											<FormControl>
												<Input
													type="date"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="deadline"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												{m.research_form_deadline_label()}
											</FormLabel>
											<FormControl>
												<Input
													type="date"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</FormRow>

							<FormRow cols={2}>
								<FormField
									control={form.control}
									name="duration"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												{m.research_form_duration_label()}
											</FormLabel>
											<FormControl>
												<Input
													placeholder={m.research_form_duration_placeholder()}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="funding"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												{m.research_form_funding_label()}
											</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue
															placeholder={m.research_form_select_placeholder()}
														/>
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{fundingOptions.map(
														(option) => (
															<SelectItem
																key={option.value}
																value={option.value}
															>
																{option.label}
															</SelectItem>
														),
													)}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</FormRow>
						</FormSectionContent>
					</FormSection>

					{/* Requirements */}
					<FormSection>
						<FormSectionHeader>
							<FormSectionTitle>
								{m.research_form_requirements_section_title()}
							</FormSectionTitle>
							<FormSectionDescription>
								{m.research_form_requirements_section_description()}
							</FormSectionDescription>
						</FormSectionHeader>
						<FormSectionContent>
							<FormRow cols={1}>
								<FormField
									control={form.control}
									name="experienceRequired"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												{m.research_form_experience_label()}
											</FormLabel>
											<FormControl>
												<Textarea
													rows={3}
													placeholder={m.research_form_experience_placeholder()}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</FormRow>

							<FormRow cols={1}>
								<FormField
									control={form.control}
									name="skillsRequired"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												{m.research_form_skills_label()}
											</FormLabel>
											<FormControl>
												<Textarea
													rows={3}
													placeholder={m.research_form_skills_placeholder()}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</FormRow>

							<FormRow cols={1}>
								<FormField
									control={form.control}
									name="additionalRequirements"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												{m.research_form_additional_label()}
											</FormLabel>
											<FormControl>
												<Textarea
													rows={3}
													placeholder={m.research_form_additional_placeholder()}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</FormRow>
						</FormSectionContent>
					</FormSection>

					{/* Description */}
					<FormSection>
						<FormSectionHeader>
							<FormSectionTitle>
								{m.research_form_description_section_title()}
							</FormSectionTitle>
							<FormSectionDescription>
								{m.research_form_description_section_description()}
							</FormSectionDescription>
						</FormSectionHeader>
						<FormSectionContent>
							<FormRow cols={1}>
								<FormField
									control={form.control}
									name="content"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												{m.research_form_description_label()}
												<span className="text-destructive">
													*
												</span>
											</FormLabel>
											<FormControl>
												<TipTapEditor
													placeholder={m.research_form_description_placeholder()}
													value={field.value}
													onChange={field.onChange}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</FormRow>
						</FormSectionContent>
					</FormSection>
				</FormContent>

				<FormFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => navigate({ to: "/admin/research" })}
						disabled={isPending}
					>
						{m.research_form_cancel_button()}
					</Button>
					<Button type="submit" disabled={isPending}>
						{isEditing
							? m.research_form_update_button()
							: m.research_form_create_button_submit()}
					</Button>
				</FormFooter>
			</form>
		</Form>
	);
}
