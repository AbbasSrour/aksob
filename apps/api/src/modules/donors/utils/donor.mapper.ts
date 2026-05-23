import type { donor } from "@/modules/donors/db/donor.db";

export type DonorDto = {
	id: string;
	name: string;
	position: string;
	company: string;
	donationAmount: number | null;
	message: string | null;
	image: string | null;
	createdAt: string;
	updatedAt: string;
};

export function toDonorDto(row: typeof donor.$inferSelect): DonorDto {
	return {
		id: row.id,
		name: row.name,
		position: row.position,
		company: row.company,
		donationAmount: row.donationAmount,
		message: row.message,
		image: row.image,
		createdAt: new Date(row.createdAt).toISOString(),
		updatedAt: new Date(row.updatedAt).toISOString(),
	};
}
