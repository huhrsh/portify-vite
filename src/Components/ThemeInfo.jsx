import { useEffect, useState } from "react";
import { db } from "../Firebase";
import { useUser } from "../Context";
import { toast } from "react-toastify";
import { doc, updateDoc } from "firebase/firestore";

const STYLES = [
    {
        name: "Bold Purple",
        value: "bold-purple",
        preview: {
            bg: "linear-gradient(135deg, #1e0535 0%, #3b0f6e 100%)",
            nameColor: "transparent",
            nameStroke: "#fbbf24",
            profColor: "#c084fc",
            tag: "Dark · Purple",
        },
    },
    {
        name: "Simply Black",
        value: "simply-black",
        preview: {
            bg: "linear-gradient(135deg, #111111 0%, #2a2a2a 100%)",
            nameColor: "#fbbf24",
            profColor: "#67e8f9",
            tag: "Dark · Noir",
        },
    },
    {
        name: "Clean Light",
        value: "clean-light",
        preview: {
            bg: "linear-gradient(135deg, #faf5ff 0%, #ede9fe 60%, #f0fdf4 100%)",
            nameColor: "#3b0764",
            profColor: "#7e22ce",
            tag: "Light · Minimal",
            dark: true,
        },
    },
    {
        name: "Ocean Blue",
        value: "ocean-blue",
        preview: {
            bg: "linear-gradient(135deg, #030c2a 0%, #0a2244 50%, #0d3d5a 100%)",
            nameColor: "#ffffff",
            profColor: "#2dd4bf",
            tag: "Dark · Ocean",
        },
    },
    {
        name: "Warm Sunset",
        value: "warm-sunset",
        preview: {
            bg: "linear-gradient(135deg, #5c1a0a 0%, #a8390e 50%, #c9622b 100%)",
            nameColor: "#fed7aa",
            profColor: "#fdba74",
            tag: "Dark · Warm",
        },
    },
    {
        name: "Midnight Forest",
        value: "midnight-forest",
        preview: {
            bg: "linear-gradient(135deg, #011c11 0%, #022c22 60%, #033a2a 100%)",
            nameColor: "#34d399",
            profColor: "#86efac",
            tag: "Dark · Forest",
        },
    },
    {
        name: "Soft Blush",
        value: "soft-blush",
        preview: {
            bg: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 40%, #fdf2f8 100%)",
            nameColor: "#9f1239",
            profColor: "#e11d48",
            tag: "Light · Blush",
            dark: true,
        },
    },
    {
        name: "Neo Brutalist",
        value: "neo-brutalist",
        preview: {
            bg: "#f5f5f0",
            nameColor: "transparent",
            nameStroke: "#000000",
            profColor: "#000000",
            tag: "Light · Brutal",
            dark: true,
        },
    },
    {
        name: "Aurora Glass",
        value: "aurora-glass",
        preview: {
            bg: "radial-gradient(ellipse at 20% 40%, rgba(139,92,246,0.5) 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(103,232,249,0.35) 0%, transparent 60%), #080414",
            nameColor: "#a78bfa",
            profColor: "#67e8f9",
            tag: "Dark · Glass",
        },
    },
    {
        name: "Editorial Ink",
        value: "editorial-ink",
        preview: {
            bg: "#faf8f3",
            nameColor: "#1a1a1a",
            profColor: "#666655",
            tag: "Light · Editorial",
            dark: true,
        },
    },
];

const FONTS = ["raleway", "outfit", "poppins", "afacad", "josefin", "lato", "inter", "nunito", "space grotesk", "playfair display", "syne", "plus jakarta sans"];

function StyleCard({ style, selected, onSelect }) {
    const p = style.preview;
    return (
        <div
            onClick={() => onSelect(style.value)}
            className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]
                ${selected ? 'border-purple-600 shadow-md shadow-purple-200' : 'border-transparent hover:border-purple-300'}`}
        >
            <div
                className="h-32 w-full flex flex-col justify-center px-5 gap-1"
                style={{ background: p.bg }}
            >
                <p
                    className="text-2xl font-bold leading-tight"
                    style={p.nameStroke
                        ? { WebkitTextStroke: `1.5px ${p.nameStroke}`, WebkitTextFillColor: 'transparent' }
                        : { color: p.nameColor }
                    }
                >
                    Your Name
                </p>
                <p className="text-sm font-medium" style={{ color: p.profColor }}>
                    Your Profession
                </p>
            </div>
            <div className={`flex items-center justify-between px-4 py-2.5 ${p.dark ? 'bg-gray-50' : 'bg-white'}`}>
                <span className="font-semibold text-gray-700 text-sm">{style.name}</span>
                <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">{p.tag}</span>
            </div>
        </div>
    );
}

export default function ThemeInfo() {
    const { user, setUser, setLoading } = useUser();
    const [selectedStyle, setSelectedStyle] = useState("bold-purple");
    const [selectedFont, setSelectedFont] = useState("raleway");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user?.selectedFont)  setSelectedFont(user.selectedFont);
        if (user?.selectedStyle) setSelectedStyle(user.selectedStyle);
    }, [user]);

    const handleStyleChange = async (styleValue) => {
        if (styleValue === selectedStyle || saving) return;
        setSelectedStyle(styleValue);
        setSaving(true);
        setLoading(true);
        try {
            await updateDoc(doc(db, "users", user.uid), { selectedStyle: styleValue });
            setUser({ ...user, selectedStyle: styleValue });
            toast.success("Style updated.");
        } catch {
            toast.error("Failed to update style.");
            setSelectedStyle(user.selectedStyle || 'bold-purple');
        } finally {
            setSaving(false);
            setLoading(false);
        }
    };

    const handleFontChange = async (font) => {
        if (font === selectedFont || saving) return;
        setSelectedFont(font);
        setSaving(true);
        setLoading(true);
        try {
            await updateDoc(doc(db, "users", user.uid), { selectedFont: font });
            setUser({ ...user, selectedFont: font });
            toast.success("Font updated.");
        } catch {
            toast.error("Failed to update font.");
            setSelectedFont(user.selectedFont || 'raleway');
        } finally {
            setSaving(false);
            setLoading(false);
        }
    };

    return (
        <div className="px-4 max-sm:p-0 pb-8 font-[raleway]">
            {/* ── Styles ── */}
            <h2 className="text-purple-700 text-3xl font-bold mb-1 max-sm:text-2xl">Choose Your Style</h2>
            <p className="text-gray-500 text-sm mb-5">Pick a theme that matches your personality. Changes save instantly.</p>

            <div className="grid grid-cols-2 gap-4 mb-10 max-sm:grid-cols-1">
                {STYLES.map(style => (
                    <StyleCard
                        key={style.value}
                        style={style}
                        selected={style.value === selectedStyle}
                        onSelect={handleStyleChange}
                    />
                ))}
            </div>

            {/* ── Fonts ── */}
            <h2 className="text-purple-700 text-3xl font-bold mb-1 max-sm:text-2xl">Choose Your Font</h2>
            <p className="text-gray-500 text-sm mb-5">Your chosen font applies across your entire portfolio.</p>

            <div className="grid grid-cols-4 gap-3 max-sm:grid-cols-2 mb-4">
                {FONTS.map(font => (
                    <div
                        key={font}
                        onClick={() => handleFontChange(font)}
                        className={`py-3 px-2 flex items-center justify-center cursor-pointer border rounded-xl hover:shadow-md transition-all duration-200
                            ${font === selectedFont
                                ? 'border-2 border-purple-600 bg-purple-50 shadow-sm'
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                        style={{ fontFamily: font }}
                    >
                        <span className="text-gray-700 font-medium text-sm capitalize">{font}</span>
                    </div>
                ))}
            </div>

            {/* ── Font Preview ── */}
            {selectedFont && (
                <div className="mt-2 rounded-xl border border-purple-100 overflow-hidden">
                    <div className="bg-purple-50 px-4 py-2 flex items-center justify-between">
                        <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider font-[raleway]">Live preview</p>
                        <p className="text-xs text-gray-400 font-[raleway] capitalize">{selectedFont} — this is how your portfolio text looks</p>
                    </div>
                    <div className="p-5 bg-white" style={{ fontFamily: selectedFont }}>
                        <p className="text-2xl font-bold text-purple-800">Your Portfolio Headline</p>
                        <p className="text-base text-gray-600 mt-1">Passionate developer building great things.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
