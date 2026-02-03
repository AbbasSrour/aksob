import { Link, Outlet } from "react-router";

export default function AuthLayout() {
	return (
		<div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden">
			{/* Galaxy Background */}
			<div
				className="absolute inset-0 z-0"
				style={{
					background: "var(--galaxy-bg)",
				}}
			>
				{/* Abstract stars or noise could go here */}
			</div>

			{/* Blur Overlay */}
			<div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] z-0"></div>

			{/* Content Container */}
			<div className="relative z-10 w-full max-w-120 p-4">
				<div
					className="glass-panel rounded-xl p-8 md:p-10 shadow-(--shadow-lg) w-full"
					style={{ background: "rgba(255, 255, 255, 0.95)" }}
				>
					<div className="text-center mb-8">
						{/* Logo Placeholder */}
						<h1 className="text-3xl font-bold text-(--aksob-darkest) mb-2 tracking-tight">
							AKSOB <span className="font-light">Alumni</span>
						</h1>
						<p className="text-(--gray-600)">
							Welcome to the AKSOB Alumni Network
						</p>
					</div>

					<Outlet />

					<div className="mt-8 text-center">
						<div className="text-sm text-(--gray-600) flex items-center justify-center gap-4">
							<Link
								to="#"
								className="hover:text-(--aksob-primary) hover:underline"
							>
								Help
							</Link>
							<span>•</span>
							<Link
								to="#"
								className="hover:text-(--aksob-primary) hover:underline"
							>
								Privacy
							</Link>
							<span>•</span>
							<Link
								to="#"
								className="hover:text-(--aksob-primary) hover:underline"
							>
								Terms
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
