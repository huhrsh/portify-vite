import { useUser } from "../Context";
import { useRef } from "react";
import html2canvas from "html2canvas";
import { toast } from "react-toastify";

const THEME_GRADIENTS = {
    "bold-purple":    "linear-gradient(135deg, #1e0535 0%, #3b0f6e 100%)",
    "simply-black":   "linear-gradient(135deg, #111111 0%, #2a2a2a 100%)",
    "clean-light":    "linear-gradient(135deg, #faf5ff 0%, #ede9fe 60%, #f0fdf4 100%)",
    "ocean-blue":     "linear-gradient(135deg, #030c2a 0%, #0a2244 50%, #0d3d5a 100%)",
    "warm-sunset":    "linear-gradient(135deg, #5c1a0a 0%, #a8390e 50%, #c9622b 100%)",
    "midnight-forest":"linear-gradient(135deg, #011c11 0%, #022c22 60%, #033a2a 100%)",
    "soft-blush":     "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 40%, #fdf2f8 100%)",
    "neo-brutalist":  "#f5f5f0",
    "aurora-glass":   "linear-gradient(135deg, #07060f 0%, #1a0a3c 50%, #07060f 100%)",
    "editorial-ink":  "#faf8f3",
};
const THEME_NAME_COLOR = {
    "bold-purple": "#fbbf24", "simply-black": "#fbbf24", "clean-light": "#3b0764",
    "ocean-blue": "#ffffff", "warm-sunset": "#fed7aa", "midnight-forest": "#34d399",
    "soft-blush": "#9f1239", "neo-brutalist": "#000000", "aurora-glass": "#ffffff",
    "editorial-ink": "#1a1a1a",
};

function StatCard({ label, value, sub }) {
    return (
        <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-sm flex flex-col gap-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
            <p className="text-3xl font-bold text-purple-700">{value ?? "—"}</p>
            {sub && <p className="text-xs text-gray-400">{sub}</p>}
        </div>
    );
}

function MiniBar({ label, value, max }) {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 w-16 flex-shrink-0 text-right">{label}</span>
            <div className="flex-1 bg-purple-50 rounded-full h-2 overflow-hidden">
                <div className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-500"
                    style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-semibold text-gray-600 w-6 text-right">{value}</span>
        </div>
    );
}

export default function AnalyticsInfo() {
    const { user } = useUser();
    const cardRef = useRef();

    const totalViews   = user?.totalViews   ?? 0;
    const viewsByDate  = user?.viewsByDate   ?? {};

    // last 7 days
    const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const key = d.toISOString().slice(0, 10);
        return { label: d.toLocaleDateString("en", { weekday: "short" }), value: viewsByDate[key] ?? 0, key };
    });
    const weekTotal  = last7.reduce((s, d) => s + d.value, 0);
    const maxDay     = Math.max(...last7.map(d => d.value), 1);
    const todayKey   = new Date().toISOString().slice(0, 10);
    const todayViews = viewsByDate[todayKey] ?? 0;

    const portfolioUrl = user?.username ? `${window.location.origin}/${user.username}` : "";

    // OG share card download
    const handleDownload = async () => {
        if (!cardRef.current) return;
        try {
            const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, logging: false });
            const link = document.createElement("a");
            link.download = `${user.username}-portfolio-card.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
            toast.success("Card downloaded!");
        } catch {
            toast.error("Download failed. Try screenshotting the card.");
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(portfolioUrl).then(() => toast.success("Portfolio link copied!"));
    };

    const style      = user?.selectedStyle || "bold-purple";
    const cardBg     = THEME_GRADIENTS[style] || THEME_GRADIENTS["bold-purple"];
    const nameColor  = THEME_NAME_COLOR[style] || "#ffffff";
    const darkCard   = !["clean-light", "soft-blush", "neo-brutalist", "editorial-ink"].includes(style);

    return (
        <div className="px-4 max-sm:p-0 pb-8 font-[raleway] flex flex-col gap-8">

            {/* ── Analytics ── */}
            <div>
                <h2 className="text-purple-700 text-3xl font-bold mb-1 max-sm:text-2xl">Analytics</h2>
                <p className="text-gray-500 text-sm mb-5">View counts tracked from unique daily visitors.</p>

                <div className="grid grid-cols-3 gap-4 mb-6 max-sm:grid-cols-1">
                    <StatCard label="Total views"  value={totalViews} />
                    <StatCard label="This week"    value={weekTotal}  sub="last 7 days" />
                    <StatCard label="Today"        value={todayViews} />
                </div>

                <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Views — last 7 days</p>
                    {last7.map(d => (
                        <MiniBar key={d.key} label={d.label} value={d.value} max={maxDay} />
                    ))}
                </div>
            </div>

            {/* ── Share card ── */}
            <div>
                <h2 className="text-purple-700 text-3xl font-bold mb-1 max-sm:text-2xl">Share Your Portfolio</h2>
                <p className="text-gray-500 text-sm mb-5">Download a card to share on LinkedIn, Twitter, or anywhere you want.</p>

                {/* Card preview */}
                <div ref={cardRef} className="rounded-2xl overflow-hidden w-full max-w-md shadow-xl mb-4"
                    style={{ background: cardBg, padding: "40px 44px 36px", fontFamily: "raleway, sans-serif" }}>
                    <p style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase",
                        color: darkCard ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.35)", marginBottom: 14, fontWeight: 600 }}>
                        portfolio
                    </p>
                    <p style={{ fontSize: 38, fontWeight: 800, color: nameColor, lineHeight: 1.1, marginBottom: 8 }}>
                        {user?.name || "Your Name"}
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 500,
                        color: darkCard ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)", marginBottom: 28 }}>
                        {user?.profession || "Your Profession"}
                    </p>
                    <div style={{ height: 1, background: darkCard ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)", marginBottom: 16 }} />
                    <p style={{ fontSize: 12, fontWeight: 600,
                        color: darkCard ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)", letterSpacing: "0.05em" }}>
                        {portfolioUrl}
                    </p>
                </div>

                <div className="flex gap-3 flex-wrap">
                    <button onClick={handleDownload}
                        className="bg-gradient-to-bl from-violet-500 to-purple-700 text-white text-sm font-semibold py-2.5 px-5 rounded-lg hover:shadow-lg hover:shadow-purple-200 transition-all">
                        Download card
                    </button>
                    {portfolioUrl && (
                        <button onClick={handleCopyLink}
                            className="border border-purple-200 text-purple-700 text-sm font-semibold py-2.5 px-5 rounded-lg hover:bg-purple-50 transition-colors">
                            Copy portfolio link
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
