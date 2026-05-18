import { Button } from "@aksob/ui/core/button";
import { Checkbox } from "@aksob/ui/core/checkbox";
import {
	Form,
	FormContent,
	FormControl,
	FormDescription,
	FormField,
	FormFooter,
	FormItem,
	FormLabel,
	FormMessage,
	FormRow,
	FormSection,
	FormSectionContent,
	FormSectionDescription,
	FormSectionHeader,
	FormSectionTitle,
} from "@aksob/ui/core/form";
import { Input } from "@aksob/ui/core/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@aksob/ui/core/select";
import { Textarea } from "@aksob/ui/core/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useForm, useFieldArray } from "react-hook-form";
import {
	type EventFormSchema,
	eventFormDefaultValues,
	eventFormSchema,
} from "@/app/events/components/form/event-form-schema";
import { eventTypeOptions } from "@/app/events/constants/event-type-options";
import {
	useCreateEvent,
	useUpdateEvent,
} from "@/app/events/hooks/api/events.queries";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Add one day to a YYYY-MM-DD date string. */
function addDay(dateStr: string): string {
	if (!dateStr) return dateStr;
	const d = new Date(`${dateStr}T00:00:00`);
	d.setUTCDate(d.getUTCDate() + 1);
	return d.toISOString().slice(0, 10);
}

/** Convert empty string to undefined (omit from create payload). */
function emptyToUndefined(value: string): string | undefined {
	return value ? value : undefined;
}

/** Convert 0 to undefined for create (API defaults to null). */
function capacityOrUndefined(value: number): number | undefined {
	return value > 0 ? value : undefined;
}

/** Convert 0 to null for update (API uses null to clear capacity). */
function capacityOrNull(value: number): number | null {
	return value > 0 ? value : null;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface EventFormProps {
	eventId?: string;
	defaultValues?: EventFormSchema;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EventForm({ eventId, defaultValues }: EventFormProps) {
	const navigate = useNavigate();
	const isEditing = Boolean(eventId);
	const { mutate: createEvent, isPending: isCreating } = useCreateEvent();
	const { mutate: updateEvent, isPending: isUpdating } = useUpdateEvent();
	const isPending = isCreating || isUpdating;

	const form = useForm<EventFormSchema>({
		resolver: zodResolver(eventFormSchema),
		defaultValues: { ...eventFormDefaultValues, ...defaultValues },
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "surveys",
	});

	const eventType = form.watch("eventType");
	const requiresRegistration = form.watch("requiresRegistration");
	const multiDay = form.watch("multiDay");

	const onSubmit = (values: EventFormSchema) => {
		const endDate = values.multiDay ? values.endDate : addDay(values.startDate);

		const surveys = values.surveys.map((s) => ({
			audience: s.audience,
			url: s.url,
			sendAt: s.sendAt,
		}));

		if (isEditing && eventId) {
			updateEvent(
				{
					id: eventId,
					title: values.title,
					description: values.description,
					coverImage: values.coverImage || null,
					eventType: values.eventType,
					location: values.location || null,
					meetingPlatform: values.meetingPlatform || null,
					meetingUrl: values.meetingUrl || null,
					startDate: values.startDate,
					endDate,
					requiresRegistration: values.requiresRegistration,
					registrationDeadline: values.registrationDeadline || null,
					registrationMode: values.registrationMode,
					capacity: capacityOrNull(values.capacity),
					checkInEnabled: values.checkInEnabled,
					remindersEnabled: values.remindersEnabled,
					attendeeListVisible: values.attendeeListVisible,
					notifyAttendees: false,
					surveys,
				},
				{
					onSuccess: () => navigate({ to: "/admin/events" }),
				},
			);
		} else {
			createEvent(
				{
					title: values.title,
					description: values.description,
					coverImage: emptyToUndefined(values.coverImage),
					eventType: values.eventType,
					location: emptyToUndefined(values.location),
					meetingPlatform: emptyToUndefined(values.meetingPlatform),
					meetingUrl: emptyToUndefined(values.meetingUrl),
					startDate: values.startDate,
					endDate,
					requiresRegistration: values.requiresRegistration,
					registrationDeadline: emptyToUndefined(values.registrationDeadline),
					registrationMode: values.registrationMode,
					capacity: capacityOrUndefined(values.capacity),
					checkInEnabled: values.checkInEnabled,
					remindersEnabled: values.remindersEnabled,
					attendeeListVisible: values.attendeeListVisible,
					surveys,
				},
				{
					onSuccess: () => navigate({ to: "/admin/events" }),
				},
			);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<FormContent>
					{/* Event Details */}
					<FormSection layout="vertical">
						<FormSectionHeader>
							<FormSectionTitle>Event Details</FormSectionTitle>
							<FormSectionDescription>
								Basic information about the event.
							</FormSectionDescription>
						</FormSectionHeader>

						<FormSectionContent cols={1} spacing="lg">
							<FormRow cols={4}>
								<FormField
									control={form.control}
									name="title"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Title</FormLabel>
											<FormControl>
												<Input placeholder="Event title" {...field} />
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
											<FormLabel>Description</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Event description..."
													rows={4}
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
									name="coverImage"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Cover Image URL</FormLabel>
											<FormControl>
												<Input placeholder="https://..." {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</FormRow>

							<FormRow cols={4}>
								<FormField
									control={form.control}
									name="eventType"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Event Type</FormLabel>
											<FormControl>
												<Select
													value={field.value}
													onValueChange={field.onChange}
												>
													<SelectTrigger>
														<SelectValue placeholder="Select type" />
													</SelectTrigger>
													<SelectContent>
														{eventTypeOptions.map((opt) => (
															<SelectItem key={opt.value} value={opt.value}>
																{opt.label}
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
									name="multiDay"
									render={({ field }) => (
										<FormItem className="flex flex-row items-start gap-3 rounded-lg border p-4">
											<FormControl>
												<Checkbox
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
											<div className="space-y-1 leading-none">
												<FormLabel>Multi-Day Event</FormLabel>
												<FormDescription>
													The event spans multiple days.
												</FormDescription>
											</div>
										</FormItem>
									)}
								/>
							</FormRow>

							<FormRow cols={multiDay ? 2 : 1}>
								<FormField
									control={form.control}
									name="startDate"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												{multiDay ? "Start Date" : "Event Date"}
											</FormLabel>
											<FormControl>
												<Input type="date" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								{multiDay && (
									<FormField
										control={form.control}
										name="endDate"
										render={({ field }) => (
											<FormItem>
												<FormLabel>End Date</FormLabel>
												<FormControl>
													<Input type="date" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								)}
							</FormRow>

							{(eventType === "in_person" || eventType === "hybrid") && (
								<FormRow cols={4}>
									<FormField
										control={form.control}
										name="location"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Location</FormLabel>
												<FormControl>
													<Input placeholder="Venue address..." {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</FormRow>
							)}

							{(eventType === "online" || eventType === "hybrid") && (
								<>
									<FormRow cols={4}>
										<FormField
											control={form.control}
											name="meetingPlatform"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Meeting Platform</FormLabel>
													<FormControl>
														<Input
															placeholder="Zoom, Google Meet..."
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
											name="meetingUrl"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Meeting URL</FormLabel>
													<FormControl>
														<Input placeholder="https://..." {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</FormRow>
								</>
							)}
						</FormSectionContent>
					</FormSection>

					{/* Registration & Settings */}
					<FormSection layout="vertical">
						<FormSectionHeader>
							<FormSectionTitle>Registration & Settings</FormSectionTitle>
							<FormSectionDescription>
								Configure how attendees can register and interact with this
								event.
							</FormSectionDescription>
						</FormSectionHeader>

						<FormSectionContent cols={1} spacing="lg">
							<FormRow cols={4}>
								<FormField
									control={form.control}
									name="requiresRegistration"
									render={({ field }) => (
										<FormItem className="flex flex-row items-start gap-3 rounded-lg border p-4">
											<FormControl>
												<Checkbox
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
											<div className="space-y-1 leading-none">
												<FormLabel>Requires Registration</FormLabel>
												<FormDescription>
													Attendees must register to participate in this event.
												</FormDescription>
											</div>
										</FormItem>
									)}
								/>
							</FormRow>

							{requiresRegistration && (
								<>
									<FormRow cols={4}>
										<FormField
											control={form.control}
											name="registrationMode"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Registration Mode</FormLabel>
													<FormControl>
														<Select
															value={field.value}
															onValueChange={field.onChange}
														>
															<SelectTrigger>
																<SelectValue placeholder="Select mode" />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="open">
																	Open Registration
																</SelectItem>
																<SelectItem value="approval">
																	Requires Approval
																</SelectItem>
															</SelectContent>
														</Select>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</FormRow>

									<FormRow cols={2}>
										<FormField
											control={form.control}
											name="registrationDeadline"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Registration Deadline</FormLabel>
													<FormControl>
														<Input type="date" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="capacity"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Capacity</FormLabel>
													<FormControl>
														<Input
															type="number"
															min={1}
															placeholder="Leave empty for unlimited"
															{...field}
															onChange={(e) =>
																field.onChange(
																	e.target.value ? Number(e.target.value) : 0,
																)
															}
															value={field.value || ""}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</FormRow>
								</>
							)}

							<FormRow cols={3}>
								<FormField
									control={form.control}
									name="checkInEnabled"
									render={({ field }) => (
										<FormItem className="flex flex-row items-start gap-3 rounded-lg border p-4">
											<FormControl>
												<Checkbox
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
											<div className="space-y-1 leading-none">
												<FormLabel>Check-in Enabled</FormLabel>
												<FormDescription>
													Allow attendees to check in via QR code.
												</FormDescription>
											</div>
										</FormItem>
									)}
								/>
							</FormRow>

							<FormRow cols={3}>
								<FormField
									control={form.control}
									name="remindersEnabled"
									render={({ field }) => (
										<FormItem className="flex flex-row items-start gap-3 rounded-lg border p-4">
											<FormControl>
												<Checkbox
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
											<div className="space-y-1 leading-none">
												<FormLabel>Reminders Enabled</FormLabel>
												<FormDescription>
													Automatically send reminder emails before the event.
												</FormDescription>
											</div>
										</FormItem>
									)}
								/>
							</FormRow>

							<FormRow cols={3}>
								<FormField
									control={form.control}
									name="attendeeListVisible"
									render={({ field }) => (
										<FormItem className="flex flex-row items-start gap-3 rounded-lg border p-4">
											<FormControl>
												<Checkbox
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
											<div className="space-y-1 leading-none">
												<FormLabel>Attendee List Visible</FormLabel>
												<FormDescription>
													Show the attendee list publicly.
												</FormDescription>
											</div>
										</FormItem>
									)}
								/>
							</FormRow>
						</FormSectionContent>
					</FormSection>

					{/* Surveys */}
					<FormSection layout="vertical">
						<FormSectionHeader>
							<FormSectionTitle>Surveys</FormSectionTitle>
							<FormSectionDescription>
								Add post-event surveys to collect feedback.
							</FormSectionDescription>
						</FormSectionHeader>

						<FormSectionContent cols={1} spacing="lg">
							{fields.map((field, index) => (
								<div key={field.id} className="space-y-4 rounded-lg border p-4">
									<div className="flex items-center justify-between">
										<FormLabel>Survey {index + 1}</FormLabel>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => remove(index)}
										>
											Remove
										</Button>
									</div>

									<FormRow cols={3}>
										<FormField
											control={form.control}
											name={`surveys.${index}.audience`}
											render={({ field }) => (
												<FormItem>
													<FormLabel>Audience</FormLabel>
													<FormControl>
														<Select
															value={field.value}
															onValueChange={field.onChange}
														>
															<SelectTrigger>
																<SelectValue placeholder="Select audience" />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="attendees">
																	Attendees
																</SelectItem>
																<SelectItem value="organizers">
																	Organizers
																</SelectItem>
																<SelectItem value="all">All</SelectItem>
															</SelectContent>
														</Select>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name={`surveys.${index}.sendAt`}
											render={({ field }) => (
												<FormItem>
													<FormLabel>Send Date</FormLabel>
													<FormControl>
														<Input type="date" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name={`surveys.${index}.url`}
											render={({ field }) => (
												<FormItem>
													<FormLabel>Survey URL</FormLabel>
													<FormControl>
														<Input placeholder="https://..." {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</FormRow>
								</div>
							))}

							<Button
								type="button"
								variant="outline"
								onClick={() =>
									append({
										audience: "attendees",
										url: "",
										sendAt: "",
									})
								}
							>
								Add Survey
							</Button>
						</FormSectionContent>
					</FormSection>
				</FormContent>

				<FormFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => navigate({ to: "/admin/events" })}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={isPending}>
						{isEditing ? "Update Event" : "Create Event"}
					</Button>
				</FormFooter>
			</form>
		</Form>
	);
}
