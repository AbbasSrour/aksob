import type { ApiUser } from "~/app/lib/users";

export interface Alumnus {
	id: string;
	name: string;
	program: string;
	year: number;
	graduationYear: number | null;
	bio: string | null;
	position: string;
	company: string;
	image: string | null;
	userType: ApiUser["type"];
}

export interface ProgramCluster {
	name: string;
	color: string;
	alumni: Alumnus[];
}

// Deterministic color palette — hashed from program name
const CLUSTER_COLORS = [
	"#076951",
	"#2E8B57",
	"#20B2AA",
	"#D4AF37",
	"#00CED1",
	"#16876b",
	"#365951",
	"#4682B4",
	"#8B4513",
	"#6A5ACD",
	"#CD5C5C",
	"#3CB371",
	"#B8860B",
	"#708090",
	"#8FBC8F",
	"#D2691E",
];

function hashProgramName(name: string): number {
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = (hash * 31 + name.charCodeAt(i)) | 0;
	}
	return Math.abs(hash);
}

function colorForProgram(name: string): string {
	return CLUSTER_COLORS[hashProgramName(name) % CLUSTER_COLORS.length]!;
}

export const buildGalaxyData = (users: ApiUser[]): ProgramCluster[] => {
	const clusterMap = new Map<string, ProgramCluster>();

	for (const user of users) {
		for (const major of user.majors) {
			let cluster = clusterMap.get(major.name);
			if (!cluster) {
				cluster = {
					name: major.name,
					color: colorForProgram(major.name),
					alumni: [],
				};
				clusterMap.set(major.name, cluster);
			}

			cluster.alumni.push({
				id: user.id,
				name: user.name,
				program: major.name,
				year: major.graduationYear ?? new Date(user.createdAt).getFullYear(),
				graduationYear: major.graduationYear,
				bio: user.bio,
				position: user.title ?? "",
				company: user.company ?? "",
				image: user.image,
				userType: user.type,
			});
		}
	}

	return [...clusterMap.values()];
};
