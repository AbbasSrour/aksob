import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@aksob/ui/core/button";
import { Input } from "@aksob/ui/core/input";
import { Textarea } from "@aksob/ui/core/textarea";
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
	majorFormSchema,
	type MajorFormSchema,
} from "@/app/majors/components/form/major-form-schema";
import { majorFormDefaultValues } from "@/app/majors/components/form/major-form-default-values";
import {
	useCreateMajor,
	useUpdateMajor,
} from "@/app/majors/hooks/api/majors.queries";
import { m } from "@/paraglide/messages";

interface MajorFormProps {
	majorId?: string;
	defaultValues?: Partial<MajorFormSchema>;
}

export function MajorForm({ majorId, defaultValues }: MajorFormProps) {
	const navigate = useNavigate();
	const isEditing = Boolean(majorId);
	const { mutate: createMajor, isPending: isCreating } = useCreateMajor();
	const { mutate: updateMajor, isPending: isUpdating } = useUpdateMajor();
	const isPending = isCreating || isUpdating;

	const form = useForm<MajorFormSchema>({
		resolver: zodResolver(majorFormSchema),
		defaultValues: { ...majorFormDefaultValues, ...defaultValues },
	});

	const onSubmit = (values: MajorFormSchema) => {
		if (isEditing && majorId) {
			updateMajor(
				{
					id: majorId,
					name: values.name,
					description: values.description || null,
					credits: values.credits,
					duration: values.duration,
				},
				{
					onSuccess: () => {
						navigate({ to: "/admin/majors" });
					},
				},
			);
		} else {
			createMajor(
				{
					name: values.name,
					description: values.description || undefined,
					credits: values.credits,
					duration: values.duration,
				},
				{
					onSuccess: () => {
						navigate({ to: "/admin/majors" });
					},
				},
			);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<FormContent>
					<FormSection layout="vertical">
						<FormSectionHeader>
							<FormSectionTitle>
								{isEditing
									? m.majors_form_edit_section_title()
									: m.majors_form_create_section_title()}
							</FormSectionTitle>
							<FormSectionDescription>
								{isEditing
									? m.majors_form_edit_section_description()
									: m.majors_form_create_section_description()}
							</FormSectionDescription>
						</FormSectionHeader>

						<FormSectionContent cols={1} spacing="lg">
							<FormRow cols={4}>
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{m.majors_form_name_label()}</FormLabel>
											<FormControl>
												<Input
													placeholder={m.majors_form_name_placeholder()}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</FormRow>

							<FormRow cols={4}>
								<FormField
									control={form.control}
									name="description"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												{m.majors_form_description_label()}
											</FormLabel>
											<FormControl>
												<Textarea
													placeholder={m.majors_form_description_placeholder()}
													rows={3}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</FormRow>

							<FormRow cols={4}>
								<FormField
									control={form.control}
									name="credits"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{m.majors_form_credits_label()}</FormLabel>
											<FormControl>
												<Input type="number" min={0} {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="duration"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{m.majors_form_duration_label()}</FormLabel>
											<FormControl>
												<Input
													type="number"
													min={0}
													step={0.5}
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
				</FormContent>

				<FormFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => navigate({ to: "/admin/majors" })}
					>
						{m.majors_form_cancel_button()}
					</Button>
					<Button type="submit" disabled={isPending}>
						{isEditing
							? m.majors_form_update_button()
							: m.majors_form_create_button()}
					</Button>
				</FormFooter>
			</form>
		</Form>
	);
}
