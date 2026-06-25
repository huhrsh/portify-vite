import { Link } from "react-router-dom";
import { useUser } from "../Context";
import thinkingFace    from "../Assets/Images/Thinking face-rafiki.png";
import usernameImage   from "../Assets/Images/User flow-pana.png";
import formImage       from "../Assets/Images/Fill out-pana.png";
import customizeImage  from "../Assets/Images/Advanced customization-rafiki.png";
import celebrateImage  from "../Assets/Images/Celebration-cuate.png";
import dashboardImage  from "../Assets/Images/Control Panel-bro.png";
import changeImage     from "../Assets/Images/Version control-cuate.png";
import coffeeDrinkingImage from "../Assets/Images/Coffee break-cuate.png";
import { useEffect, useState } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import leftArrow  from "../Assets/Images/left-arrow.png";
import rightArrow from "../Assets/Images/right-arrow.png";
import Rating from "@mui/material/Rating";

const REVIEWS = [
    { rating: 5, text: "Fantastic tool! Creating and customizing my portfolio was effortless. My website looks incredibly professional — I got three job callbacks in the first week!", author: "Priya M." },
    { rating: 5, text: "User friendly and easy to navigate. The admin approval process was super quick. Would definitely recommend to anyone looking for a simple, polished portfolio.", author: "Arjun K." },
    { rating: 5, text: "Excellent tool for building a custom portfolio. Love the variety of themes and fonts available. My personal brand has never looked better!", author: "Sofia L." },
    { rating: 5, text: "I had my portfolio live within an hour of signing up. The dashboard is intuitive and the final result is sleek. Highly recommend Portify.", author: "David R." },
];

const STEPS_BUILD = [
    { num: "01", title: "Get a unique username", desc: "Your portfolio lives at portify.com/{username}. Choose a name that represents you — you can always update it later if needed.", img: usernameImage, alt: "Choose username" },
    { num: "02", title: "Enter your details",    desc: "Fill in your bio, education, work experience, projects, certifications, skills, and contact info — step by step.", img: formImage, alt: "Fill in details" },
    { num: "03", title: "Customize your style",  desc: "Pick from 10 unique themes and 12 fonts. See a live preview before you commit — make it unmistakably yours.", img: customizeImage, alt: "Customize" },
    { num: "04", title: "Go live!",               desc: "Submit for a quick admin review. Once approved, your portfolio is publicly live and ready to impress.", img: celebrateImage, alt: "Go live" },
];

function StepSection({ step, reverse }) {
    return (
        <section className={`flex items-center gap-8 max-sm:flex-col ${reverse ? "flex-row-reverse" : ""} py-6`}>
            <img className="w-5/12 max-sm:w-full max-sm:max-h-56 object-contain p-4" src={step.img} alt={step.alt} />
            <div className="flex flex-col gap-4 flex-1">
                <span className="text-6xl font-black text-purple-100 leading-none select-none max-sm:text-4xl">{step.num}</span>
                <h3 className="text-4xl max-sm:text-2xl bg-gradient-to-tl font-bold from-violet-600 to-purple-800 text-transparent bg-clip-text">
                    {step.title}
                </h3>
                <p className="text-base font-medium text-gray-600 leading-relaxed">{step.desc}</p>
            </div>
        </section>
    );
}

function SectionDivider({ text }) {
    return (
        <h2 className="text-3xl max-sm:text-2xl max-sm:text-center relative bg-gradient-to-tl font-bold from-violet-600 to-purple-800 text-transparent bg-clip-text my-12 py-2
            after:content-[''] after:absolute after:h-px after:w-full after:-bottom-1 after:left-0 after:bg-gradient-to-r after:from-transparent after:via-purple-400 after:to-transparent
        ">
            {text}
        </h2>
    );
}

export default function Home() {
    useEffect(() => { window.scrollTo(0, 0); }, []);
    const { user } = useUser();

    const [currentSlide, setCurrentSlide] = useState(0);

    const handlePrev = () => setCurrentSlide(prev => (prev === 0 ? REVIEWS.length - 1 : prev - 1));
    const handleNext = () => setCurrentSlide(prev => (prev === REVIEWS.length - 1 ? 0 : prev + 1));

    return (
        <main className="flex flex-col px-16 max-sm:px-5 font-[raleway] items-center max-w-screen-xl mx-auto">

            {/* ── Hero ── */}
            <section className="flex items-center gap-6 max-sm:flex-col min-h-[80vh] py-10">
                <img className="w-5/12 max-sm:w-full max-sm:max-h-64 object-contain" src={thinkingFace} alt="thinking" />
                <div className="flex flex-col gap-5 flex-1">
                    <span className="text-xs font-semibold tracking-[0.25em] uppercase text-purple-500">Free · No Code Needed</span>
                    <h1 className="text-5xl max-sm:text-3xl bg-gradient-to-tl font-extrabold from-violet-600 to-purple-900 text-transparent bg-clip-text leading-tight">
                        Your professional portfolio, live in minutes.
                    </h1>
                    <p className="text-base font-medium text-gray-600 leading-relaxed">
                        Portify turns your career details into a stunning, shareable portfolio website —
                        no design skills or coding required. Just fill in your info and let us handle the rest.
                    </p>
                    <div className="flex gap-3 flex-wrap mt-2">
                        {user ? (
                            <Link
                                to="/dashboard/general"
                                className="rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-200 text-white shadow-md hover:shadow-lg bg-gradient-to-tr from-purple-700 to-violet-500 hover:from-purple-800 hover:to-violet-600"
                            >
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/sign-up"
                                    className="rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-200 text-white shadow-md hover:shadow-lg bg-gradient-to-tr from-purple-700 to-violet-500 hover:from-purple-800 hover:to-violet-600"
                                >
                                    Get Started — It's Free
                                </Link>
                                <Link
                                    to="/sign-in"
                                    className="rounded-lg px-6 py-3 text-sm font-semibold border border-purple-200 text-purple-700 hover:bg-purple-50 transition-all duration-200"
                                >
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* ── How to build ── */}
            <SectionDivider text="Build your portfolio in 4 easy steps" />
            {STEPS_BUILD.map((step, i) => (
                <StepSection key={step.num} step={step} reverse={i % 2 !== 0} />
            ))}

            {/* ── How to update ── */}
            <SectionDivider text="Keeping your portfolio fresh" />
            <section className="flex items-center gap-8 max-sm:flex-col py-6">
                <img className="w-5/12 max-sm:w-full object-contain p-4 max-sm:max-h-56" src={dashboardImage} alt="dashboard" />
                <div className="flex flex-col gap-4 flex-1">
                    <h3 className="text-4xl max-sm:text-2xl bg-gradient-to-tl font-bold from-violet-600 to-purple-800 text-transparent bg-clip-text">
                        Edit anytime from your dashboard
                    </h3>
                    <p className="text-base font-medium text-gray-600 leading-relaxed">
                        Got a new job, project, or certification? Just log in, update your details, and save.
                        Your live portfolio reflects changes instantly — no re-submission needed.
                    </p>
                </div>
            </section>
            <section className="flex items-center gap-8 flex-row-reverse max-sm:flex-col py-6">
                <img className="w-5/12 max-sm:w-full object-contain p-4 max-sm:max-h-56" src={changeImage} alt="changes" />
                <div className="flex flex-col gap-4 flex-1">
                    <h3 className="text-4xl max-sm:text-2xl bg-gradient-to-tl font-bold from-violet-600 to-purple-800 text-transparent bg-clip-text">
                        Section by section — save as you go
                    </h3>
                    <p className="text-base font-medium text-gray-600 leading-relaxed">
                        Each section (About, Projects, Skills…) saves independently so you never lose progress.
                        Draft mode auto-saves to your browser so nothing is lost even if you close the tab.
                    </p>
                </div>
            </section>

            {/* ── Reviews ── */}
            <SectionDivider text="What our (imaginary) users say" />
            <section className="flex items-center gap-12 max-sm:flex-col mb-20 w-full justify-center">
                <img className="w-5/12 max-sm:w-full object-contain max-h-[28rem]" src={coffeeDrinkingImage} alt="testimonials" />

                <div className="relative w-5/12 min-h-64 max-sm:w-full max-sm:min-h-72 flex flex-col items-center justify-center">
                    <TransitionGroup>
                        <CSSTransition key={currentSlide} timeout={400} classNames="fade">
                            <div className="flex flex-col w-full h-full gap-4 absolute left-0 top-0 border border-purple-200 rounded-2xl bg-white shadow-sm shadow-purple-100 p-6">
                                <Rating defaultValue={REVIEWS[currentSlide].rating} size="small" readOnly />
                                <p className="text-gray-700 font-medium leading-relaxed text-base flex-1">
                                    "{REVIEWS[currentSlide].text}"
                                </p>
                                <p className="text-sm text-purple-500 font-semibold">— {REVIEWS[currentSlide].author}</p>
                            </div>
                        </CSSTransition>
                    </TransitionGroup>

                    <button
                        onClick={handlePrev}
                        aria-label="Previous review"
                        className="absolute top-1/2 -left-4 -translate-y-1/2 rounded-full bg-white border border-purple-200 p-2 hover:border-purple-400 hover:shadow-md transition-all"
                    >
                        <img className="h-3.5 logo" src={leftArrow} alt="previous" />
                    </button>
                    <button
                        onClick={handleNext}
                        aria-label="Next review"
                        className="absolute top-1/2 -right-4 -translate-y-1/2 rounded-full bg-white border border-purple-200 p-2 hover:border-purple-400 hover:shadow-md transition-all"
                    >
                        <img className="h-3.5 logo" src={rightArrow} alt="next" />
                    </button>

                    <div className="flex justify-center gap-2 absolute -bottom-6">
                        {REVIEWS.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentSlide(i)}
                                className={`h-2 rounded-full transition-all duration-200 ${i === currentSlide ? 'w-5 bg-purple-600' : 'w-2 bg-purple-200'}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

        </main>
    );
}
