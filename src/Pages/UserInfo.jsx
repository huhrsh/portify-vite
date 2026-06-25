import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../Context";

const BASE_LINKS = [
    { to: "general",        label: "General",           color: "bg-slate-400" },
    { to: "about",          label: "About",             color: "bg-blue-400" },
    { to: "education",      label: "Education",         color: "bg-emerald-400" },
    { to: "experience",     label: "Work Experience",   color: "bg-amber-400" },
    { to: "projects",       label: "Projects",          color: "bg-indigo-400" },
    { to: "certifications", label: "Certifications",    color: "bg-yellow-400" },
    { to: "skills",         label: "Skills",            color: "bg-teal-400" },
    { to: "contacts",       label: "Contacts",          color: "bg-pink-400" },
    { to: "themes",         label: "Themes & Fonts",    color: "bg-purple-400" },
    { to: "sections",       label: "Section Order",     color: "bg-fuchsia-400" },
    { to: "analytics",      label: "Analytics & Share", color: "bg-sky-400" },
];

export default function UserInfo() {
    const navigate  = useNavigate();
    const location  = useLocation();
    const { user, loading } = useUser();
    const [navLinks, setNavLinks] = useState(BASE_LINKS);
    const [mobileOpen, setMobileOpen] = useState(false);

    const dashboardPath = location.pathname.replace(/^\/dashboard\/?/, '');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (loading) return;
        if (!user) { navigate('/'); return; }
        const customLinks = (user.customSections || []).map(s => ({
            to: `custom-sections/${s.id}`,
            label: s.title || "Untitled Section",
            color: "bg-violet-300",
        }));
        const withCustom = [
            ...BASE_LINKS,
            { to: "custom-sections", label: "Custom Sections", color: "bg-violet-400" },
            ...customLinks,
        ];
        if (user.websiteStatus !== 'active') {
            setNavLinks([...withCustom, { to: "submit", label: "Publish Portfolio", color: "bg-green-500" }]);
        } else {
            setNavLinks(withCustom);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, loading]);

    const LinkItem = ({ to, label, color }) => {
        const active = dashboardPath === to || (to === "custom-sections" && dashboardPath.startsWith("custom-sections"));
        return (
            <Link
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                    ${active
                        ? 'bg-gradient-to-r from-purple-700 to-violet-500 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-purple-50 hover:text-purple-800'
                    }`}
            >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${active ? 'bg-white/80' : color}`} />
                <span>{label}</span>
            </Link>
        );
    };

    return (
        <main className="flex font-[raleway] relative max-w-screen-xl mx-auto">

            {/* ── Mobile Sidebar Toggle ── */}
            <div className="sm:hidden px-5 pt-5 pb-2 w-full">
                <button
                    onClick={() => setMobileOpen(o => !o)}
                    className="flex items-center gap-2 text-sm font-semibold text-purple-700 border border-purple-200 rounded-lg px-4 py-2 hover:bg-purple-50 transition-colors w-full justify-between"
                >
                    <span>{navLinks.find(l => l.to === dashboardPath || dashboardPath.startsWith(l.to + '/'))?.label || 'Dashboard'}</span>
                    <span className={`transition-transform duration-200 ${mobileOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>

                {mobileOpen && (
                    <div className="mt-2 flex flex-col gap-1 border border-purple-100 rounded-xl bg-white p-2 shadow-md">
                        {navLinks.map(link => <LinkItem key={link.to} {...link} />)}
                    </div>
                )}
            </div>

            {/* ── Desktop Sidebar ── */}
            <aside className="max-sm:hidden w-72 flex-shrink-0">
                <div className="sticky top-24 flex flex-col gap-1 bg-white border border-gray-100 rounded-2xl p-3 shadow-sm m-8 ml-8">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">Dashboard</p>
                    {navLinks.map(link => <LinkItem key={link.to} {...link} />)}
                </div>
            </aside>

            {/* ── Content ── */}
            <section className="flex-1 min-w-0 p-8 max-sm:px-5 max-sm:py-4 max-sm:pb-12">
                <Outlet />
            </section>
        </main>
    );
}
