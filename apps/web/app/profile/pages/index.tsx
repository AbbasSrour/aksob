import {
	Briefcase,
	Edit2,
	GraduationCap,
	Mail,
	MapPin,
	Phone,
	Save,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser } from "~/app/lib/users";
import { Avatar } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Divider } from "~/components/ui/divider";

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
		department: "MS Data Analytics",
		year: 2018,
		company: "TechCorp",
		position: "Senior Engineer",
	});
	const [loadError, setLoadError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		const loadProfile = async () => {
			try {
				const response = await getCurrentUser();
				if (!isMounted) {
					return;
				}

				setUser((prev) => ({
					...prev,
					name: response.data.name,
					email: response.data.email,
					major: response.data.major,
					department: response.data.major,
					headline: response.data.title ?? prev.headline,
					company: response.data.company ?? prev.company,
					position: response.data.title ?? prev.position,
					year: new Date(response.data.createdAt).getFullYear(),
				}));
			} catch {
				if (!isMounted) {
					return;
				}
				setLoadError("Could not refresh profile from server.");
			}
		};

		void loadProfile();

		return () => {
			isMounted = false;
		};
	}, []);

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault();
		setIsEditing(false);
	};

	return (
		<div className="w-full min-h-full bg-white">
			<div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
				{loadError && (
					<p className="mb-4 text-sm text-[var(--error)]">{loadError}</p>
				)}

				{/* Profile Header Card */}
				<Card className="p-6 mb-6">
					<div className="flex flex-col sm:flex-row gap-6">
						{/* Avatar */}
						<div className="flex justify-center sm:justify-start">
							<Avatar
								name={user.name}
								size="xl"
								className="w-24 h-24 text-2xl"
							/>
						</div>

						{/* Info */}
						<div className="flex-1 text-center sm:text-left">
							{isEditing ? (
								<input
									value={user.name}
									onChange={(e) => setUser({ ...user, name: e.target.value })}
									className="text-xl font-bold bg-transparent border-b-2 border-gray-200 focus:border-[var(--aksob-primary)] focus:outline-none w-full text-gray-900 mb-1"
								/>
							) : (
								<h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
							)}

							{isEditing ? (
								<input
									value={user.headline}
									onChange={(e) =>
										setUser({ ...user, headline: e.target.value })
									}
									className="text-gray-500 bg-transparent border-b border-gray-200 focus:border-[var(--aksob-primary)] focus:outline-none w-full text-sm"
								/>
							) : (
								<p className="text-gray-500 text-sm">{user.headline}</p>
							)}

							{/* Quick Info */}
							<div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 mt-3 text-xs text-gray-400">
								<span className="flex items-center gap-1">
									<MapPin size={12} />
									{user.location}
								</span>
								<span className="flex items-center gap-1">
									<Briefcase size={12} />
									{user.company}
								</span>
								<span className="flex items-center gap-1">
									<GraduationCap size={12} />
									{user.department} '{user.year.toString().slice(-2)}
								</span>
							</div>
						</div>

						{/* Action */}
						<div className="flex justify-center sm:justify-start">
							<Button
								variant={isEditing ? "primary" : "secondary"}
								size="sm"
								onClick={isEditing ? handleSave : () => setIsEditing(true)}
								leftIcon={isEditing ? <Save size={14} /> : <Edit2 size={14} />}
							>
								{isEditing ? "Save" : "Edit"}
							</Button>
						</div>
					</div>
				</Card>

				{/* Contact Card - Full Width */}
				<Card className="p-5 mb-6">
					<h3 className="text-sm font-semibold text-gray-900 mb-4">
						Contact Information
					</h3>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
								<Mail size={18} className="text-gray-500" />
							</div>
							<div className="min-w-0">
								<p className="text-xs text-gray-400">Email</p>
								{isEditing ? (
									<input
										value={user.email}
										onChange={(e) =>
											setUser({ ...user, email: e.target.value })
										}
										className="text-sm text-gray-700 bg-transparent border-b border-gray-200 focus:border-[var(--aksob-primary)] focus:outline-none w-full"
									/>
								) : (
									<p className="text-sm text-gray-700 truncate">{user.email}</p>
								)}
							</div>
						</div>
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
								<Phone size={18} className="text-gray-500" />
							</div>
							<div>
								<p className="text-xs text-gray-400">Phone</p>
								{isEditing ? (
									<input
										value={user.phone}
										onChange={(e) =>
											setUser({ ...user, phone: e.target.value })
										}
										className="text-sm text-gray-700 bg-transparent border-b border-gray-200 focus:border-[var(--aksob-primary)] focus:outline-none w-full"
									/>
								) : (
									<p className="text-sm text-gray-700">{user.phone}</p>
								)}
							</div>
						</div>
					</div>
				</Card>

				{/* About Card */}
				<Card className="p-5 mb-6">
					<h3 className="text-sm font-semibold text-gray-900 mb-3">About</h3>
					{isEditing ? (
						<textarea
							value={user.bio}
							onChange={(e) => setUser({ ...user, bio: e.target.value })}
							rows={3}
							className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--aksob-primary)]/20 focus:border-[var(--aksob-primary)] transition resize-none text-gray-700"
						/>
					) : (
						<p className="text-sm text-gray-600 leading-relaxed">{user.bio}</p>
					)}
				</Card>

				{/* Experience Card */}
				<Card className="p-5">
					<h3 className="text-sm font-semibold text-gray-900 mb-4">
						Experience
					</h3>
					<div className="space-y-4">
						{/* Current Job */}
						<div className="flex gap-3">
							<div className="w-10 h-10 bg-[var(--aksob-primary)]/10 rounded-lg flex items-center justify-center flex-shrink-0">
								<Briefcase size={18} className="text-[var(--aksob-primary)]" />
							</div>
							<div className="min-w-0 flex-1">
								<h4 className="text-sm font-medium text-gray-900">
									{user.position}
								</h4>
								<p className="text-xs text-[var(--aksob-primary)]">
									{user.company}
								</p>
								<p className="text-xs text-gray-400 mt-0.5">
									Jan 2020 - Present
								</p>
							</div>
						</div>

						<Divider />

						{/* Past Job */}
						<div className="flex gap-3">
							<div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
								<Briefcase size={18} className="text-gray-400" />
							</div>
							<div className="min-w-0 flex-1">
								<h4 className="text-sm font-medium text-gray-900">
									Junior Developer
								</h4>
								<p className="text-xs text-gray-500">WebSolutions Inc.</p>
								<p className="text-xs text-gray-400 mt-0.5">
									Jun 2018 - Dec 2019
								</p>
							</div>
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
}
