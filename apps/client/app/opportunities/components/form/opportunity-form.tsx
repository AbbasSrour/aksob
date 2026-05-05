import { Button } from "@aksob/ui/core/button";
import { Input } from "@aksob/ui/core/input";
import { cn } from "@aksob/ui/lib/utils";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import {
	IconBriefcase,
	IconBuilding,
	IconCheck,
	IconCircleCheck,
	IconCircleDashed,
	IconCircleX,
	IconClock,
	IconLink,
	IconMail,
} from "@tabler/icons-react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	type OpportunityFormSchema,
	opportunityFormDefaultValues,
	opportunityFormSchema,
} from "@/app/opportunities/components/form/opportunity-form-schema";
import { opportunityTypeOptions } from "@/app/opportunities/constants/opportunity-type-options";
import type { Opportunity } from "@/app/opportunities/hooks/api/opportunities.functions";
import {
	useCreateOpportunity,
	useUpdateOpportunity,
} from "@/app/opportunities/hooks/api/opportunities.queries";

interface OpportunityFormProps {
	defaultValues?: OpportunityFormSchema;
	opportunityId?: string;
	existingOpportunity?: Opportunity;
}

// -------------------------------------------------------------------> Status Visuals

const statusVisuals: Record<
	string,
	{
		label: string;
		icon: React.ElementType;
		bg: string;
		text: string;
		ring: string;
		description: string;
	}
> = {
	pending: {
		label: "Pending",
		icon: IconCircleDashed,
		bg: "bg-amber-50",
		text: "text-amber-700",
		ring: "ring-amber-200",
		description: "Awaiting review",
	},
	approved: {
		label: "Approved",
		icon: IconCircleCheck,
		bg: "bg-emerald-50",
		text: "text-emerald-700",
		ring: "ring-emerald-200",
		description: "Published and visible",
	},
	rejected: {
		label: "Rejected",
		icon: IconCircleX,
		bg: "bg-rose-50",
		text: "text-rose-700",
		ring: "ring-rose-200",
		description: "Needs revision",
	},
};

// -------------------------------------------------------------------> Component

export function OpportunityForm({
	defaultValues,
	opportunityId,
	existingOpportunity,
}: OpportunityFormProps) {
	const location = useLocation();
	const navigate = useNavigate();
	const isCreate = location.pathname.endsWith("/create");

	const [isSubmitting, setIsSubmitting] = useState(false);

	const effectiveDefaults = useMemo(() => {
		if (defaultValues) return defaultValues;
		return opportunityFormDefaultValues;
	}, [defaultValues]);

	const form = useForm<OpportunityFormSchema>({
		mode: "onSubmit",
		reValidateMode: "onChange",
		defaultValues: effectiveDefaults,
		resolver: standardSchemaResolver(opportunityFormSchema),
	});

	const { mutate: createOpportunity, isPending: isCreating } =
		useCreateOpportunity();
	const { mutate: updateOpportunity, isPending: isUpdating } =
		useUpdateOpportunity();
	const isLoading = isSubmitting || isCreating || isUpdating;

	const onSubmit = async (values: OpportunityFormSchema) => {
		setIsSubmitting(true);
		try {
			const payload = {
				...values,
				contactEmail: values.contactEmail || undefined,
				applyUrl: values.applyUrl || undefined,
			};

			const onSuccess = () => {
				void navigate({ to: "/admin/opportunities" });
			};

			if (isCreate) {
				createOpportunity(payload, { onSuccess });
			} else if (opportunityId) {
				updateOpportunity({ id: opportunityId, ...payload }, { onSuccess });
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			console.error("Failed to save opportunity:", message, error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const statusVisual = existingOpportunity
		? statusVisuals[existingOpportunity.status]
		: undefined;

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			className="flex min-h-0 flex-1 flex-col"
		>
			{/* ===== Content ===== */}
			<div className="flex flex-1 overflow-hidden">
				{/* ----- Main Form ----- */}
				<div className="flex-1 overflow-y-auto bg-white">
					<div className="mx-auto max-w-2xl px-8 pb-20 pt-8 lg:px-16 lg:pt-10">
						<div className="space-y-8">
							{/* Type Selection */}
							<div className="space-y-2.5">
								<div className="flex items-center gap-2">
									<IconBriefcase
										size={15}
										className="text-muted-foreground/50"
									/>
									<span className="text-sm font-medium text-foreground/70">
										Opportunity Type
									</span>
								</div>
								<Controller
									control={form.control}
									name="type"
									render={({ field }) => (
										<div className="flex gap-3">
											{opportunityTypeOptions.map((option) => {
												const isSelected = field.value === option.value;
												return (
													<button
														key={option.value}
														type="button"
														onClick={() => field.onChange(option.value)}
														className={cn(
															"flex flex-1 items-center gap-2.5 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-all duration-200",
															isSelected
																? "border-[#076951] bg-[#076951] text-white shadow-sm"
																: "border-[#e8e6e1] bg-white text-foreground/70 hover:border-[#076951]/30 hover:bg-[#076951]/[0.04]",
														)}
													>
														{isSelected && (
															<IconCheck
																size={15}
																className="flex-shrink-0 opacity-80"
															/>
														)}
														<span>{option.label}</span>
													</button>
												);
											})}
										</div>
									)}
								/>
							</div>

							{/* Company */}
							<div className="space-y-2.5">
								<div className="flex items-center gap-2">
									<IconBuilding
										size={15}
										className="text-muted-foreground/50"
									/>
									<label
										htmlFor="company"
										className="text-sm font-medium text-foreground/70"
									>
										Company / Organization
									</label>
								</div>
								<Input
									id="company"
									type="text"
									placeholder="Company name"
									className="h-11 border-[#e8e6e1] bg-white shadow-sm transition-colors focus:border-[#076951]/30 focus:ring-[#076951]/10"
									{...form.register("company")}
								/>
								{form.formState.errors.company && (
									<p className="text-sm font-medium text-destructive">
										{form.formState.errors.company.message}
									</p>
								)}
							</div>

							{/* Contact Email */}
							<div className="space-y-2.5">
								<div className="flex items-center gap-2">
									<IconMail size={15} className="text-muted-foreground/50" />
									<label
										htmlFor="contactEmail"
										className="text-sm font-medium text-foreground/70"
									>
										Contact Email
									</label>
								</div>
								<Input
									id="contactEmail"
									type="email"
									placeholder="contact@company.com"
									className="h-11 border-[#e8e6e1] bg-white shadow-sm transition-colors focus:border-[#076951]/30 focus:ring-[#076951]/10"
									{...form.register("contactEmail")}
								/>
								{form.formState.errors.contactEmail && (
									<p className="text-sm font-medium text-destructive">
										{form.formState.errors.contactEmail.message}
									</p>
								)}
							</div>

							{/* Application URL */}
							<div className="space-y-2.5">
								<div className="flex items-center gap-2">
									<IconLink size={15} className="text-muted-foreground/50" />
									<label
										htmlFor="applyUrl"
										className="text-sm font-medium text-foreground/70"
									>
										Application URL
									</label>
								</div>
								<Input
									id="applyUrl"
									type="text"
									placeholder="https://company.com/apply"
									className="h-11 border-[#e8e6e1] bg-white shadow-sm transition-colors focus:border-[#076951]/30 focus:ring-[#076951]/10"
									{...form.register("applyUrl")}
								/>
								<p className="text-xs text-muted-foreground/50">
									Optional: Direct link to application form or job posting.
								</p>
								{form.formState.errors.applyUrl && (
									<p className="text-sm font-medium text-destructive">
										{form.formState.errors.applyUrl.message}
									</p>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* ----- Right Panel ----- */}
				<div className="hidden w-[320px] flex-shrink-0 overflow-y-auto border-l border-[#e8e6e1] bg-white lg:block">
					<div className="space-y-8 p-6">
						{/* Status Card */}
						{statusVisual && existingOpportunity && (
							<div className="rounded-xl border border-black/[0.06] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
								<div className="flex items-start gap-3.5">
									<div
										className={cn(
											"flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ring-1",
											statusVisual.bg,
											statusVisual.ring,
										)}
									>
										<statusVisual.icon
											size={20}
											className={statusVisual.text}
										/>
									</div>
									<div className="min-w-0">
										<p className="text-sm font-semibold text-foreground">
											{statusVisual.label}
										</p>
										<p className="mt-0.5 text-xs text-muted-foreground/70">
											{statusVisual.description}
										</p>
										<div className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground/40">
											<IconClock size={11} />
											<span>
												Last edited{" "}
												{new Date(
													existingOpportunity.updatedAt,
												).toLocaleDateString(undefined, {
													month: "short",
													day: "numeric",
												})}
											</span>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Summary */}
						<div className="space-y-4">
							<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/40">
								Summary
							</p>
							<div className="space-y-3 text-xs text-muted-foreground/70">
								<div>
									<span className="font-medium text-foreground/60">Type: </span>
									{opportunityTypeOptions.find(
										(o) => o.value === form.watch("type"),
									)?.label ?? form.watch("type")}
								</div>
								<div>
									<span className="font-medium text-foreground/60">
										Company:{" "}
									</span>
									{form.watch("company") || "—"}
								</div>
								<div>
									<span className="font-medium text-foreground/60">
										Contact:{" "}
									</span>
									{form.watch("contactEmail") || "—"}
								</div>
								<div>
									<span className="font-medium text-foreground/60">
										Apply URL:{" "}
									</span>
									{form.watch("applyUrl") ? (
										<span className="break-all">{form.watch("applyUrl")}</span>
									) : (
										"—"
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* ===== Bottom Bar ===== */}
			<div className="flex flex-shrink-0 items-center justify-end gap-x-2 border-t border-black/[0.06] bg-white px-5 py-3">
				<Button
					type="button"
					variant="outline"
					className="min-w-40"
					onClick={() => navigate({ to: "/admin/opportunities" })}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					className="min-w-40 bg-[#076951] hover:bg-[#16876b]"
					disabled={isLoading}
				>
					{isCreate ? "Create Opportunity" : "Save Changes"}
				</Button>
			</div>
		</form>
	);
}
