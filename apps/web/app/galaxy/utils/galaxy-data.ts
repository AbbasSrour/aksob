import { AKSOB_MAJORS, type AksobMajor } from "@aksob/shared";
import type { ApiUser } from "~/app/lib/users";

export interface Alumnus {
	id: string;
	name: string;
	major: AksobMajor;
	year: number;
	position: string;
	company: string;
	image: string | null;
	userType: ApiUser["userType"];
}

export interface MajorCluster {
	name: AksobMajor;
	color: string;
	alumni: Alumnus[];
}

const MAJOR_COLORS: Record<AksobMajor, string> = {
	"BS in Business": "#076951",
	"BS in Economics": "#2E8B57",
	"BS Hospitality Management": "#20B2AA",
	"MBA & Executive MBA": "#D4AF37",
	"MS Data Analytics": "#00CED1",
	"MS Human Resources": "#16876b",
	"MA Applied Economics": "#365951",
	"LLM & Master of Laws": "#4682B4",
};

export const buildGalaxyData = (users: ApiUser[]): MajorCluster[] => {
	const clusters: MajorCluster[] = AKSOB_MAJORS.map((major) => ({
		name: major,
		color: MAJOR_COLORS[major],
		alumni: [],
	}));

	const clusterByMajor = new Map(
		clusters.map((cluster) => [cluster.name, cluster]),
	);

	for (const user of users) {
		const cluster = clusterByMajor.get(user.major);
		if (!cluster) {
			continue;
		}

		cluster.alumni.push({
			id: user.id,
			name: user.name,
			major: user.major,
			year: new Date(user.createdAt).getFullYear(),
			position: user.title ?? "",
			company: user.company ?? "",
			image: user.image,
			userType: user.userType,
		});
	}

	return clusters;
};
