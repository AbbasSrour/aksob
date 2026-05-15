import { AKSOB_PROGRAMS, type AksobProgram } from "@aksob/sdk";
import type { ApiUser } from "~/app/lib/users";

export interface Alumnus {
	id: string;
	name: string;
	program: AksobProgram;
	year: number;
	position: string;
	company: string;
	image: string | null;
	userType: ApiUser["type"];
}

export interface ProgramCluster {
	name: AksobProgram;
	color: string;
	alumni: Alumnus[];
}

const PROGRAM_COLORS: Record<AksobProgram, string> = {
	"BS in Business": "#076951",
	"BS in Economics": "#2E8B57",
	"BS Hospitality Management": "#20B2AA",
	"MBA & Executive MBA": "#D4AF37",
	"MS Data Analytics": "#00CED1",
	"MS Human Resources": "#16876b",
	"MA Applied Economics": "#365951",
	"LLM & Master of Laws": "#4682B4",
};

export const buildGalaxyData = (users: ApiUser[]): ProgramCluster[] => {
	const clusters: ProgramCluster[] = AKSOB_PROGRAMS.map((program) => ({
		name: program,
		color: PROGRAM_COLORS[program],
		alumni: [],
	}));

	const clusterByProgram = new Map(
		clusters.map((cluster) => [cluster.name, cluster]),
	);

	for (const user of users) {
		const cluster = clusterByProgram.get(user.program);
		if (!cluster) {
			continue;
		}

		cluster.alumni.push({
			id: user.id,
			name: user.name,
			program: user.program,
			year: new Date(user.createdAt).getFullYear(),
			position: user.title ?? "",
			company: user.company ?? "",
			image: user.image,
			userType: user.type,
		});
	}

	return clusters;
};
