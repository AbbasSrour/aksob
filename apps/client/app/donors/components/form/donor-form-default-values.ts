import type { DonorFormSchema } from "@/app/donors/components/form/donor-form-schema";

export const donorFormDefaultValues: DonorFormSchema = {
	name: "",
	position: "",
	company: "",
	donationAmount: "",
	message: "",
	image: "",
};
