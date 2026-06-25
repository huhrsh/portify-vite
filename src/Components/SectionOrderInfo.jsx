import { useEffect, useRef, useState } from "react";
import { useUser } from "../Context";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../Firebase";
import { toast } from "react-toastify";

const STANDARD_SECTIONS = ["education", "projects", "experience", "certifications", "skills", "contacts"];

const SECTION_META = {
    education:      { label: "Education",      color: "bg-emerald-400" },
    projects:       { label: "Projects",        color: "bg-indigo-400" },
    experience:     { label: "Work Experience", color: "bg-amber-400" },
    certifications: { label: "Certifications",  color: "bg-yellow-400" },
    skills:         { label: "Skills",          color: "bg-teal-400" },
    contacts:       { label: "Contacts",        color: "bg-pink-400" },
};

/* Build a unified nav item list from user data.
   Each item: { id, type: 'standard'|'custom', label, color, enabled, sectionData? } */
function buildUnifiedList(user) {
    const selected   = user.selectedSections || {};
    const customs    = user.customSections   || [];
    const customIds  = new Set(customs.map(s => s.id));

    // Start from saved navOrder if present
    const saved = (user.navOrder || []).filter(id =>
        STANDARD_SECTIONS.includes(id) || customIds.has(id)
    );

    // Add any standard sections not yet in navOrder
    STANDARD_SECTIONS.forEach(s => { if (!saved.includes(s)) saved.push(s); });

    // Add any new custom sections not yet in navOrder
    customs.forEach(s => { if (!saved.includes(s.id)) saved.push(s.id); });

    return saved.map(id => {
        if (STANDARD_SECTIONS.includes(id)) {
            const meta = SECTION_META[id];
            return { id, type: 'standard', label: meta.label, color: meta.color, enabled: !!selected[id] };
        }
        const cs = customs.find(s => s.id === id);
        if (!cs) return null;
        return { id, type: 'custom', label: cs.title || 'Untitled Section', color: 'bg-violet-400', enabled: true, sectionData: cs };
    }).filter(Boolean);
}

export default function SectionOrderInfo() {
    const { user, setUser, setLoading } = useUser();

    const [items, setItems]     = useState([]);
    const [selected, setSelected] = useState({});
    const [dragIdx, setDragIdx] = useState(null);
    const [overIdx, setOverIdx] = useState(null);
    const [saving, setSaving]   = useState(false);

    useEffect(() => {
        if (!user) return;
        setSelected(user.selectedSections || {});
        setItems(buildUnifiedList(user));
    }, [user]);

    const toggleItem = (id) => {
        const next = { ...selected, [id]: !selected[id] };
        setSelected(next);
        setItems(prev => prev.map(it => it.id === id ? { ...it, enabled: !it.enabled } : it));
    };

    // ── Mouse / pointer drag ──
    const onDragStart = (i) => setDragIdx(i);
    const onDragOver  = (e, i) => { e.preventDefault(); setOverIdx(i); };
    const onDrop      = (i) => {
        if (dragIdx === null || dragIdx === i) { setDragIdx(null); setOverIdx(null); return; }
        const next = [...items];
        const [moved] = next.splice(dragIdx, 1);
        next.splice(i, 0, moved);
        setItems(next);
        setDragIdx(null); setOverIdx(null);
    };
    const onDragEnd = () => { setDragIdx(null); setOverIdx(null); };

    // ── Touch drag ──
    const touchFrom = useRef(null);
    const touchOver = useRef(null);
    const listRef   = useRef(null);

    const onTouchStart = (e, i) => {
        touchFrom.current = i;
        touchOver.current = i;
        setDragIdx(i);
    };

    const onTouchMove = (e) => {
        if (touchFrom.current === null) return;
        const touch = e.touches[0];
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        const row = el?.closest('[data-row]');
        if (!row) return;
        const idx = parseInt(row.dataset.row, 10);
        if (!isNaN(idx) && idx !== touchOver.current) {
            touchOver.current = idx;
            setOverIdx(idx);
        }
    };

    const onTouchEnd = () => {
        const from = touchFrom.current;
        const to   = touchOver.current;
        if (from !== null && to !== null && from !== to) {
            const next = [...items];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            setItems(next);
        }
        touchFrom.current = null;
        touchOver.current = null;
        setDragIdx(null);
        setOverIdx(null);
    };

    const handleSave = async () => {
        setSaving(true);
        setLoading(true);
        try {
            const navOrder      = items.map(it => it.id);
            const sectionOrder  = items.filter(it => it.type === 'standard').map(it => it.id);
            const customSections = items.filter(it => it.type === 'custom').map(it => it.sectionData);

            await updateDoc(doc(db, "users", user.uid), {
                selectedSections: selected,
                navOrder,
                sectionOrder,
                customSections,
            });
            setUser({ ...user, selectedSections: selected, navOrder, sectionOrder, customSections });
            toast.success("Sections updated.");
        } catch {
            toast.error("Failed to save. Please try again.");
        } finally {
            setSaving(false);
            setLoading(false);
        }
    };

    const activeItems   = items.filter(it => it.enabled);
    const navPreview    = activeItems.map(it => it.label).join(" → ");
    let posCounter      = 0;

    return (
        <div className="px-4 max-sm:p-0 pb-8 font-[raleway] flex flex-col gap-6">
            <div>
                <h2 className="text-purple-700 text-3xl font-bold mb-1 max-sm:text-2xl">Portfolio Sections</h2>
                <p className="text-gray-500 text-sm mb-5">
                    Drag any section (standard or custom) to set the exact nav order. Toggle to show/hide.
                </p>

                <div ref={listRef} className="flex flex-col gap-2 mb-5" onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
                    {items.map((item, i) => {
                        const pos = item.enabled ? ++posCounter : null;
                        return (
                            <div
                                key={item.id}
                                data-row={i}
                                draggable
                                onDragStart={() => onDragStart(i)}
                                onDragOver={e => onDragOver(e, i)}
                                onDrop={() => onDrop(i)}
                                onDragEnd={onDragEnd}
                                onTouchStart={e => onTouchStart(e, i)}
                                className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-all duration-150 cursor-grab active:cursor-grabbing select-none
                                    ${dragIdx === i ? 'opacity-40 scale-95' : 'opacity-100'}
                                    ${overIdx === i ? 'border-purple-400 bg-purple-50 shadow-md'
                                        : item.enabled ? 'border-purple-200 bg-white shadow-sm'
                                        : 'border-gray-200 bg-gray-50/50'}`}
                            >
                                {/* Drag handle */}
                                <div className="flex flex-col gap-[3px] flex-shrink-0 opacity-30">
                                    <div className="w-4 h-0.5 bg-gray-500 rounded" />
                                    <div className="w-4 h-0.5 bg-gray-500 rounded" />
                                    <div className="w-4 h-0.5 bg-gray-500 rounded" />
                                </div>

                                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.color} ${!item.enabled ? 'opacity-30' : ''}`} />

                                <span className={`flex-1 text-sm font-semibold ${item.enabled ? 'text-gray-700' : 'text-gray-400'}`}>
                                    {item.label}
                                    {item.type === 'custom' && (
                                        <span className="ml-2 text-xs font-normal text-violet-400 bg-violet-50 px-1.5 py-0.5 rounded-full">custom</span>
                                    )}
                                </span>

                                {pos != null && (
                                    <span className="text-xs font-bold text-purple-400 w-5 text-center">{pos}</span>
                                )}

                                {/* toggle — only for standard sections */}
                                {item.type === 'standard' ? (
                                    <button
                                        type="button"
                                        onClick={() => toggleItem(item.id)}
                                        className={`relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0 overflow-hidden
                                            ${item.enabled ? 'bg-purple-600' : 'bg-gray-200'}`}
                                    >
                                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200
                                            ${item.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                ) : (
                                    <span className="w-10 flex-shrink-0" />
                                )}
                            </div>
                        );
                    })}
                </div>

                {navPreview && (
                    <p className="text-xs text-gray-400 mb-5">
                        Nav preview: {navPreview}
                    </p>
                )}

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-gradient-to-bl hover:shadow-lg hover:shadow-purple-200 duration-200 from-violet-500 to-purple-700 transition-all w-fit px-6 text-base font-semibold rounded-lg py-2.5 text-white disabled:opacity-60"
                >
                    Save Changes
                </button>
            </div>

            <section className="shadow shadow-purple-100 border border-purple-100 rounded-xl p-4 mr-12 max-sm:mr-0 bg-purple-50/70">
                <h3 className="text-lg font-bold text-gray-700 mb-2">Tips</h3>
                <ul className="space-y-1">
                    {[
                        "Drag any section — standard or custom — to set its exact position in the nav.",
                        "Toggle off standard sections you haven't filled yet.",
                        "Custom sections are always shown; delete them from Custom Sections to remove.",
                        "Changes apply only after clicking Save.",
                    ].map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="text-purple-400 mt-0.5">›</span> {tip}
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
