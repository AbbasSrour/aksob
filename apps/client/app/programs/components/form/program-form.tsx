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
	programFormSchema,
	type ProgramFormSchema,
} from "@/app/programs/components/form/program-form-schema";
import { programFormDefaultValues } from "@/app/programs/components/form/program-form-default-values";
import {
	useCreateProgram,
	useUpdateProgram,
} from "@/app/programs/hooks/api/programs.queries";
import { m } from "@/paraglide/messages";

const programLevels = [
	{ value: "undergraduate", label: "Undergraduate" },
	{ value: "graduate", label: "Graduate" },
	{ value: "doctorate", label: "Doctorate" },
	{ value: "minor", label: "Minor" },
	{ value: "certificate", label: "Certificate" },
] as const;

interface ProgramFormProps {
	programId?: string;
	defaultValues?: Partial<ProgramFormSchema>;
}

export function ProgramForm({ programId, defaultValues }: ProgramFormProps) {
	const navigate = useNavigate();
	const isEditing = Boolean(programId);
	const { mutate: createProgram, isPending: isCreating } = useCreateProgram();
	const { mutate: updateProgram, isPending: isUpdating } = useUpdateProgram();
	const isPending = isCreating || isUpdating;

	const form = useForm<ProgramFormSchema>({
		resolver: zodResolver(programFormSchema),
		defaultValues: { ...programFormDefaultValues, ...defaultValues },
	});

	const onSubmit = (values: ProgramFormSchema) => {
		if (isEditing && programId) {
			updateProgram(
				{
					id: programId,
					name: values.name,
					level: values.level,
					description: values.description || null,
					credits: values.credits,
					duration: values.duration,
				},
				{
					onSuccess: () => {
						navigate({ to: "/admin/programs" });
					},
				},
			);
		} else {
			createProgram(
				{
					name: values.name,
					level: values.level,
					description: values.description || undefined,
					credits: values.credits,
					duration: values.duration,
				},
				{
					onSuccess: () => {
						navigate({ to: "/admin/programs" });
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
									? m.programs_form_edit_section_title()
									: m.programs_form_create_section_title()}
							</FormSectionTitle>
							<FormSectionDescription>
								{isEditing
									? m.programs_form_edit_section_description()
									: m.programs_form_create_section_description()}
							</FormSectionDescription>
						</FormSectionHeader>

						<FormSectionContent cols={1} spacing="lg">
							<FormRow cols={4}>
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{m.programs_form_name_label()}</FormLabel>
											<FormControl>
												<Input
													placeholder={m.programs_form_name_placeholder()}
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
									name="level"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{m.programs_form_level_label()}</FormLabel>
											<FormControl>
												<Select value={field.value} onValueChange={field.onChange}>
													<SelectTrigger className="w-full">
														<SelectValue placeholder={m.programs_form_level_placeholder()} />
													</SelectTrigger>
													<SelectContent>
														{programLevels.map((level) => (
															<SelectItem key={level.value} value={level.value}>
																{level.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
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
												{m.programs_form_description_label()}
											</FormLabel>
											<FormControl>
												<Textarea
													placeholder={m.programs_form_description_placeholder()}
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
											<FormLabel>{m.programs_form_credits_label()}</FormLabel>
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
											<FormLabel>{m.programs_form_duration_label()}</FormLabel>
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
						onClick={() => navigate({ to: "/admin/programs" })}
					>
						{m.programs_form_cancel_button()}
					</Button>
					<Button type="submit" disabled={isPending}>
						{isEditing
							? m.programs_form_update_button()
							: m.programs_form_create_button()}
					</Button>
				</FormFooter>
			</form>
		</Form>
	);
}
