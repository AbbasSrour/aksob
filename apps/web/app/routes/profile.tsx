import { Briefcase, Camera, Edit2, GraduationCap, Mail, MapPin, Phone, Save } from "lucide-react";
import { useState } from "react";
import { Avatar, Badge, Button, Card, Divider, Input } from "~/components/ui";

export default function Profile() {
	const [isEditing, setIsEditing] = useState(false);
	const [user, setUser] = useState({
		name: "Alex Johnson",
		headline: "Senior Software Engineer at TechCorp",
		bio: "Passionate about building scalable web applications and mentoring junior developers. Alumni of AKSOB class of 2018.",
		location: "Beirut, Lebanon",
		email: "alex.johnson@example.com",
		phone: "+961 3 123 456",
		major: "BS in Business",
		year: 2018,
		company: "TechCorp",
		position: "Senior Engineer",
		skills: ["Project Management", "Financial Analysis", "Strategic Planning", "React", "Node.js"],
	});

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault();
		setIsEditing(false);
		// Logic to save to backend would go here
	};

	return (
		<div className="w-full h-full overflow-y-auto bg-[var(--off-white)] pb-20 no-scrollbar">
			{/* Cover Image */}
			<div className="h-48 md:h-64 w-full bg-gradient-to-r from-[var(--aksob-primary)] to-[var(--aksob-secondary)] relative">
				<button className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/30 transition">
					<Camera size={20} />
				</button>
			</div>

			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
				<div className="flex flex-col md:flex-row gap-6 items-start">
					{/* Left Column: Avatar & Quick Info */}
					<div className="flex flex-col items-center md:items-start space-y-4 w-full md:w-auto">
						<div className="relative group">
							<div className="p-1 bg-white rounded-full shadow-lg">
								<Avatar name={user.name} size="xl" className="w-40 h-40 text-4xl" />
							</div>
							{isEditing && (
								<button className="absolute bottom-2 right-2 bg-[var(--aksob-primary)] text-white p-2 rounded-full shadow-md hover:bg-[var(--aksob-secondary)]">
									<Camera size={18} />
								</button>
							)}
						</div>
					</div>

					{/* Right Column: Content */}
					<div className="flex-1 mt-2 md:mt-20 w-full">
						<div className="flex justify-between items-start">
							<div>
								{isEditing ? (
									<input
										value={user.name}
										onChange={(e) => setUser({ ...user, name: e.target.value })}
										className="text-3xl font-bold bg-transparent border-b border-[var(--gray-300)] focus:border-[var(--aksob-primary)] focus:outline-none w-full mb-2"
									/>
								) : (
									<h1 className="text-3xl font-bold text-[var(--aksob-darkest)]">{user.name}</h1>
								)}

								{isEditing ? (
									<input
										value={user.headline}
										onChange={(e) => setUser({ ...user, headline: e.target.value })}
										className="text-lg text-[var(--gray-600)] bg-transparent border-b border-[var(--gray-300)] focus:border-[var(--aksob-primary)] focus:outline-none w-full"
									/>
								) : (
									<p className="text-lg text-[var(--gray-600)]">{user.headline}</p>
								)}

								<div className="flex flex-wrap gap-4 mt-3 text-sm text-[var(--gray-500)]">
									<span className="flex items-center gap-1">
										<MapPin size={16} />
										{user.location}
									</span>
									<span className="flex items-center gap-1">
										<Briefcase size={16} />
										{user.position} at {user.company}
									</span>
									<span className="flex items-center gap-1">
										<GraduationCap size={16} />
										{user.major} '{user.year}
									</span>
								</div>
							</div>

							<Button
								variant={isEditing ? "primary" : "secondary"}
								onClick={isEditing ? handleSave : () => setIsEditing(true)}
								leftIcon={isEditing ? <Save size={18} /> : <Edit2 size={18} />}
							>
								{isEditing ? "Save Changes" : "Edit Profile"}
							</Button>
						</div>
					</div>
				</div>

				{/* Main Content Sections */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
					{/* Left Sidebar Info */}
					<div className="space-y-6">
						<Card className="p-6">
							<h3 className="font-semibold text-[var(--aksob-darkest)] mb-4">Contact Info</h3>
							<div className="space-y-3">
								<div className="flex items-center gap-3">
									<div className="p-2 bg-[var(--pale-mint)] text-[var(--aksob-primary)] rounded-lg">
										<Mail size={18} />
									</div>
									<div className="text-sm">
										<p className="text-[var(--gray-500)] text-xs">Email</p>
										<p className="font-medium truncate">{user.email}</p>
									</div>
								</div>
								<div className="flex items-center gap-3">
									<div className="p-2 bg-[var(--pale-mint)] text-[var(--aksob-primary)] rounded-lg">
										<Phone size={18} />
									</div>
									<div className="text-sm">
										<p className="text-[var(--gray-500)] text-xs">Phone</p>
										<p className="font-medium">{user.phone}</p>
									</div>
								</div>
							</div>
						</Card>

						<Card className="p-6">
							<h3 className="font-semibold text-[var(--aksob-darkest)] mb-4">Skills</h3>
							<div className="flex flex-wrap gap-2">
								{user.skills.map((skill) => (
									<Badge key={skill} variant="default">
										{skill}
									</Badge>
								))}
								{isEditing && (
									<button className="px-2 py-1 text-xs border border-dashed border-[var(--gray-400)] text-[var(--gray-500)] rounded-full hover:border-[var(--aksob-primary)] hover:text-[var(--aksob-primary)]">
										+ Add Skill
									</button>
								)}
							</div>
						</Card>
					</div>

					{/* Main Details */}
					<div className="md:col-span-2 space-y-6">
						<Card className="p-6">
							<h3 className="font-semibold text-[var(--aksob-darkest)] mb-4">About</h3>
							{isEditing ? (
								<textarea
									value={user.bio}
									onChange={(e) => setUser({ ...user, bio: e.target.value })}
									rows={4}
									className="w-full p-3 border border-[var(--gray-200)] rounded-md focus:ring-2 focus:ring-[var(--aksob-primary)] focus:border-transparent"
								/>
							) : (
								<p className="text-[var(--gray-600)] leading-relaxed">{user.bio}</p>
							)}
						</Card>

						{/* Experience Placeholder */}
						<Card className="p-6">
							<div className="flex justify-between items-center mb-4">
								<h3 className="font-semibold text-[var(--aksob-darkest)]">Experience</h3>
								{isEditing && (
									<button className="text-sm text-[var(--aksob-primary)] font-medium">+ Add</button>
								)}
							</div>

							<div className="space-y-6">
								<div className="flex gap-4">
									<div className="w-12 h-12 bg-white border border-[var(--gray-200)] rounded-lg flex items-center justify-center flex-shrink-0">
										<Briefcase size={24} className="text-[var(--gray-400)]" />
									</div>
									<div>
										<h4 className="font-medium text-[var(--aksob-darkest)]">{user.position}</h4>
										<p className="text-[var(--aksob-primary)] text-sm">{user.company}</p>
										<p className="text-[var(--gray-500)] text-xs mt-1">
											Jan 2020 - Present · 3 yrs 5 mos
										</p>
										<p className="text-[var(--gray-600)] text-sm mt-2">
											Leading the frontend development team...
										</p>
									</div>
								</div>
								<Divider />
								<div className="flex gap-4">
									<div className="w-12 h-12 bg-white border border-[var(--gray-200)] rounded-lg flex items-center justify-center flex-shrink-0">
										<Briefcase size={24} className="text-[var(--gray-400)]" />
									</div>
									<div>
										<h4 className="font-medium text-[var(--aksob-darkest)]">Junior Developer</h4>
										<p className="text-[var(--aksob-primary)] text-sm">WebSolutions Inc.</p>
										<p className="text-[var(--gray-500)] text-xs mt-1">
											Jun 2018 - Dec 2019 · 1 yr 7 mos
										</p>
									</div>
								</div>
							</div>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
