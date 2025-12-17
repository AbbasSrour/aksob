export interface Alumnus {
  id: number;
  name: string;
  major: string;
  year: number;
  position: string;
  company: string;
}

export interface MajorCluster {
  name: string;
  color: string;
  alumni: Alumnus[];
}

// Helper to generate random alumni
const generateAlumni = (major: string, count: number): Alumnus[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: Math.random(),
    name: `Alumnus ${i + 1}`,
    major: major,
    year: 2015 + Math.floor(Math.random() * 10),
    position: ["Manager", "Director", "Consultant", "Officer", "Analyst", "Founder"][Math.floor(Math.random() * 6)],
    company: ["Bank Audi", "BLOM Bank", "Murex", "Deloitte", "KPMG", "PwC", "Google", "Amazon"][Math.floor(Math.random() * 8)],
  }));
};

export const galaxyData: MajorCluster[] = [
  {
    name: "BS in Business",
    color: "#076951", // Primary Green - Largest cluster
    alumni: generateAlumni("BS Business", 200),
  },
  {
    name: "BS in Economics",
    color: "#2E8B57", // SeaGreen
    alumni: generateAlumni("BS Economics", 120),
  },
  {
    name: "BS Hospitality Management",
    color: "#20B2AA", // LightSeaGreen
    alumni: generateAlumni("BS Hospitality", 80),
  },
  {
    name: "MBA & Executive MBA",
    color: "#D4AF37", // Gold - Prestige
    alumni: generateAlumni("MBA", 150),
  },
  {
    name: "MS Data Analytics",
    color: "#00CED1", // DarkTurquoise - Tech/Data feel
    alumni: generateAlumni("MS Data Analytics", 60),
  },
  {
    name: "MS Human Resources",
    color: "#16876b", // Secondary Green
    alumni: generateAlumni("MS HRM", 50),
  },
  {
    name: "MA Applied Economics",
    color: "#365951", // Muted Green
    alumni: generateAlumni("MA Applied Econ", 40),
  },
  {
    name: "LLM & Master of Laws",
    color: "#4682B4", // SteelBlue - Law (slight contrast but deep)
    alumni: generateAlumni("Master of Laws", 30),
  },
];
