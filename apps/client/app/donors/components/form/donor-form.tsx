import { Button } from "@aksob/ui/core/button";
import {
	Form,
	FormContent,
	FormControl,
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
import { Textarea } from "@aksob/ui/core/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconCamera, IconLoader2, IconTrash } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { donorFormDefaultValues } from "@/app/donors/components/form/donor-form-default-values";
import {
	type DonorFormSchema,
	donorFormSchema,
} from "@/app/donors/components/form/donor-form-schema";
import {
	useCreateDonor,
	useUpdateDonor,
} from "@/app/donors/hooks/api/donors.queries";
import { useMediaUpload } from "@/lib/media";

interface DonorFormProps {
	donorId?: string;
	defaultValues?: Partial<DonorFormSchema>;
}

export function DonorForm({ donorId, defaultValues }: DonorFormProps) {
	const navigate = useNavigate();
	const isEditing = Boolean(donorId);
	const { mutate: createDonor, isPending: isCreating } = useCreateDonor();
	const { mutate: updateDonor, isPending: isUpdating } = useUpdateDonor();
	const isPending = isCreating || isUpdating;

	const form = useForm<DonorFormSchema>({
		resolver: zodResolver(donorFormSchema),
		defaultValues: { ...donorFormDefaultValues, ...defaultValues },
	});

	const onSubmit = (values: DonorFormSchema) => {
		const body = {
			name: values.name,
			position: values.position,
			company: values.company,
			donationAmount: values.donationAmount
				? Number(values.donationAmount)
				: undefined,
			message: values.message?.trim() || undefined,
			image: values.image?.trim() || undefined,
		};

		if (isEditing && donorId) {
			updateDonor(
				{ id: donorId, ...body },
				{
					onSuccess: () => {
						navigate({ to: "/admin/donors" });
					},
				},
			);
		} else {
			createDonor(body, {
				onSuccess: () => {
					navigate({ to: "/admin/donors" });
				},
			});
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<FormContent>
					<FormSection layout="vertical">
						<FormSectionHeader>
							<FormSectionTitle>
								{isEditing ? "Edit Donor" : "Donor Details"}
							</FormSectionTitle>
							<FormSectionDescription>
								{isEditing
									? "Update this donor's information for the Wall of Giving."
									: "Add a supporter to the Wall of Giving on the public website."}
							</FormSectionDescription>
						</FormSectionHeader>

						<FormSectionContent cols={1} spacing="lg">
							<FormRow cols={1}>
								<FormField
									control={form.control}
									name="image"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Portrait</FormLabel>
											<FormControl>
												<DonorImagePicker
													value={field.value ?? ""}
													name={form.watch("name") || "Donor"}
													onChange={field.onChange}
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
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Name</FormLabel>
											<FormControl>
												<Input placeholder="Full name" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="position"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Position</FormLabel>
											<FormControl>
												<Input
													placeholder="e.g. CEO, Managing Director"
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
									name="company"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Company</FormLabel>
											<FormControl>
												<Input placeholder="Company name" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="donationAmount"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Donation amount (USD, optional)</FormLabel>
											<FormControl>
												<Input
													type="number"
													min={0}
													step="0.01"
													placeholder="0"
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
									name="message"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Message (optional — featured as a large tile)
											</FormLabel>
											<FormControl>
												<Textarea
													placeholder="A few words from the donor…"
													rows={4}
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
						onClick={() => navigate({ to: "/admin/donors" })}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={isPending}>
						{isEditing ? "Save changes" : "Add donor"}
					</Button>
				</FormFooter>
			</form>
		</Form>
	);
}

// ---------------------------------------------------------------------------
// Image picker
// ---------------------------------------------------------------------------

interface DonorImagePickerProps {
	value: string;
	name: string;
	onChange: (url: string) => void;
}

function DonorImagePicker({ value, name, onChange }: DonorImagePickerProps) {
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [uploading, setUploading] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const { startUpload } = useMediaUpload("media");

	useEffect(() => {
		return () => {
			if (previewUrl?.startsWith("blob:")) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	}, [previewUrl]);

	const displaySrc = previewUrl ?? value ?? "";

	const handleFile = async (file: File) => {
		setUploading(true);
		const localUrl = URL.createObjectURL(file);
		setPreviewUrl(localUrl);

		try {
			const result = await startUpload([file]);
			const mediaUrl = result?.[0]?.serverData?.mediaUrl;
			if (!mediaUrl) throw new Error("Upload failed");
			setPreviewUrl(null);
			onChange(mediaUrl);
		} catch (err) {
			setPreviewUrl(null);
			toast.error(
				err instanceof Error ? err.message : "Failed to upload image",
			);
		} finally {
			setUploading(false);
		}
	};

	return (
		<div className="flex items-center gap-4">
			<button
				type="button"
				onClick={() => inputRef.current?.click()}
				disabled={uploading}
				className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-[#076951] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#076951] disabled:cursor-not-allowed"
			>
				{displaySrc ? (
					<img
						src={displaySrc}
						alt={name}
						className="absolute inset-0 h-full w-full object-cover"
					/>
				) : (
					<div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
						<IconCamera size={20} strokeWidth={1.5} />
						<span className="text-[10px] font-medium uppercase tracking-wider">
							Photo
						</span>
					</div>
				)}
				<div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
					{uploading ? (
						<IconLoader2 size={18} className="animate-spin text-white" />
					) : displaySrc ? (
						<IconCamera
							size={18}
							className="text-white opacity-0 transition-opacity group-hover:opacity-100"
						/>
					) : null}
				</div>
			</button>
			<div className="flex min-w-0 flex-1 flex-col gap-1">
				<p className="text-sm font-medium">Donor portrait</p>
				<p className="text-xs text-muted-foreground">
					Square image works best. Falls back to initials if omitted.
				</p>
				{value && (
					<button
						type="button"
						onClick={() => onChange("")}
						className="inline-flex w-fit items-center gap-1 text-xs font-medium text-muted-foreground hover:text-destructive"
					>
						<IconTrash size={12} /> Remove
					</button>
				)}
			</div>
			<input
				ref={inputRef}
				type="file"
				accept="image/*"
				className="hidden"
				onChange={(e) => {
					const file = e.target.files?.[0];
					if (file) void handleFile(file);
					e.target.value = "";
				}}
			/>
		</div>
	);
}
