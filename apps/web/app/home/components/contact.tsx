import { ArrowUpRight, ChevronDown } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";

const SUBJECTS = [
	"Admissions",
	"Academic Programs",
	"Alumni Opportunities",
	"Mentorship",
	"General Inquiry",
];

const fieldClass =
	"h-[50px] w-full rounded-[10px] border-0 bg-white px-4 text-[11px] italic text-(--aksob-darkest) placeholder:text-[#a5a5a5] outline-none ring-1 ring-transparent transition duration-200 focus:ring-(--aksob-primary)/25";

const labelClass = "text-[16px] font-medium leading-none text-black";

function handleSubmit(e: FormEvent<HTMLFormElement>) {
	e.preventDefault();
	// TODO: wire up to API.
}

export function Contact() {
	const sectionRef = useRef<HTMLElement>(null);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const el = sectionRef.current;
		if (!el) return;

		const prefersReduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (prefersReduced) {
			setIsVisible(true);
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.15 },
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<section ref={sectionRef} className="relative z-20 py-[88px]">
			<div className="mx-auto max-w-7xl pr-4 sm:pr-6 lg:pr-8">
				<div className="grid grid-cols-1 gap-12 lg:grid-cols-[42%_1fr] lg:gap-0">
					<div className="pt-0 lg:pr-12">
						<span
							className={`block text-[12px] italic leading-none text-(--aksob-darkest) ${isVisible ? "animate-editorial-fade" : "opacity-0"}`}
							style={{ animationDelay: "0.1s" }}
						>
							Contact Us
						</span>

						<h2
							className={`mt-[22px] max-w-[430px] text-[44px] font-semibold leading-[0.96] tracking-[-0.055em] text-black md:text-[52px] ${isVisible ? "animate-editorial-reveal" : "opacity-0"}`}
							style={{
								fontFamily: "var(--font-display)",
								animationDelay: "0.2s",
							}}
						>
							Have Questions?
							<br />
							We'd Love to Hear
							<br />
							From You.
						</h2>

						<p
							className={`mt-[34px] max-w-[315px] text-[11px] leading-[1.35] text-[#9b9b9b] ${isVisible ? "animate-editorial-slide-up" : "opacity-0"}`}
							style={{ animationDelay: "0.35s" }}
						>
							Whether you're interested in admissions, partnerships, or general
							enquiries, use the form below and we'll get back to you promptly.
						</p>
					</div>

					<div
						className={`rounded-[28px] bg-[#f7f7f7] px-[30px] py-[34px] ${isVisible ? "animate-editorial-slide-up" : "opacity-0"}`}
						style={isVisible ? { animationDelay: "0.3s" } : undefined}
					>
						<form onSubmit={handleSubmit} className="space-y-[24px]">
							<div className="grid grid-cols-1 gap-x-[12px] gap-y-[24px] sm:grid-cols-2">
								<label className="block space-y-[12px]">
									<span className={labelClass}>First name</span>
									<input
										name="firstName"
										placeholder="Enter your first name"
										className={fieldClass}
									/>
								</label>

								<label className="block space-y-[12px]">
									<span className={labelClass}>Last name</span>
									<input
										name="lastName"
										placeholder="Enter your last name"
										className={fieldClass}
									/>
								</label>

								<label className="block space-y-[12px]">
									<span className={labelClass}>Email</span>
									<input
										type="email"
										name="email"
										placeholder="Your email address"
										className={fieldClass}
									/>
								</label>

								<label className="block space-y-[12px]">
									<span className={labelClass}>Phone Number</span>
									<div className="flex h-[50px] rounded-[10px] bg-white">
										<select
											name="countryCode"
											defaultValue="+62"
											className="h-full w-[74px] rounded-l-[10px] border-0 bg-white pl-4 pr-2 text-[11px] font-semibold text-black outline-none"
										>
											<option value="+62">+62</option>
											<option value="+961">+961</option>
											<option value="+1">+1</option>
											<option value="+44">+44</option>
											<option value="+971">+971</option>
										</select>
										<input
											type="tel"
											name="phone"
											placeholder="|"
											className="h-full min-w-0 flex-1 rounded-r-[10px] border-0 bg-white px-2 text-[11px] italic text-(--aksob-darkest) placeholder:text-black outline-none focus:ring-2 focus:ring-(--aksob-primary)/25"
										/>
									</div>
								</label>
							</div>

							<label className="block space-y-[12px]">
								<span className={labelClass}>Subject</span>
								<div className="relative">
									<select
										name="subject"
										defaultValue=""
										className={`${fieldClass} appearance-none pr-10`}
									>
										<option value="" disabled>
											Select your subject
										</option>
										{SUBJECTS.map((subject) => (
											<option key={subject} value={subject}>
												{subject}
											</option>
										))}
									</select>
									<ChevronDown
										size={13}
										className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black"
									/>
								</div>
							</label>

							<label className="block space-y-[12px]">
								<span className={labelClass}>Message</span>
								<textarea
									name="message"
									placeholder="Type your message"
									className="h-[207px] w-full resize-none rounded-[10px] border-0 bg-white px-4 py-4 text-[11px] italic text-(--aksob-darkest) placeholder:text-[#a5a5a5] outline-none focus:ring-2 focus:ring-(--aksob-primary)/25"
								/>
							</label>

							<button
								type="submit"
								className="group inline-flex h-[52px] items-center gap-[14px] rounded-[10px] bg-[#061942] px-[17px] text-[13px] font-medium text-white transition-colors duration-300 hover:bg-(--aksob-darkest)"
							>
								Send Message
								<span className="flex h-[27px] w-[27px] items-center justify-center rounded-[6px] bg-white text-[#061942] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
									<ArrowUpRight size={14} strokeWidth={2.5} />
								</span>
							</button>
						</form>
					</div>
				</div>
			</div>
		</section>
	);
}
