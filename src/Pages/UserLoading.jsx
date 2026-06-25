import { useEffect, useState } from "react";

const DOTS = [0, 1, 2, 3, 4];

export default function UserLoading() {
    const [visible, setVisible] = useState(false);
    useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t); }, []);

    return (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
            style={{ background: "linear-gradient(135deg, #faf5ff 0%, #ede9fe 60%, #f5f3ff 100%)", fontFamily: "raleway, sans-serif" }}>

            {/* Soft ambient glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div style={{
                    width: 520, height: 520,
                    background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
                    borderRadius: "50%",
                }} />
            </div>

            {/* Wordmark */}
            <p className="relative z-10 text-xs tracking-[0.5em] uppercase font-bold mb-10"
               style={{ color: "rgba(109,40,217,0.4)" }}>
                portify
            </p>

            {/* Animated dots */}
            <div className="relative z-10 flex items-center gap-2.5">
                {DOTS.map(i => (
                    <div key={i}
                        style={{
                            width: i === 2 ? 10 : 6,
                            height: i === 2 ? 10 : 6,
                            borderRadius: "50%",
                            background: i === 2
                                ? "linear-gradient(135deg, #7c3aed, #a855f7)"
                                : "rgba(139,92,246,0.25)",
                            animation: `portify-pulse 1.4s ease-in-out ${i * 0.15}s infinite`,
                        }}
                    />
                ))}
            </div>

            <style>{`
                @keyframes portify-pulse {
                    0%, 100% { opacity: 0.35; transform: scale(1); }
                    50%       { opacity: 1;    transform: scale(1.45); }
                }
            `}</style>
        </div>
    );
}
