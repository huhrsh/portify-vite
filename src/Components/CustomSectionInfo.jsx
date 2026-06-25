import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../Context";
import { doc, updateDoc } from "firebase/firestore";
import { db, storage } from "../Firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";
import deleteImage from "../Assets/Images/cross-circle.png";
import upArrow from "../Assets/Images/up-arrow.png";

const CARD_TYPES = [
    { value: "text",       label: "Text Block",         desc: "A heading with body text and optional link." },
    { value: "image-text", label: "Image + Text",       desc: "Side-by-side image and description." },
    { value: "list",       label: "Bullet List",        desc: "A heading with bullet points." },
    { value: "link-grid",  label: "Link Grid",          desc: "A grid of clickable labelled links." },
    { value: "timeline",   label: "Timeline",           desc: "A dated event with description." },
    { value: "quote",      label: "Quote / Testimonial", desc: "A pull-quote with optional author." },
    { value: "gallery",    label: "Gallery Grid",       desc: "A grid of images." },
];

const LAYOUTS = [
    { value: "list",    label: "List",    icon: "▤" },
    { value: "grid",    label: "Grid",    icon: "▦" },
    { value: "masonry", label: "Masonry", icon: "▧" },
];

const newCard = (type = "text") => ({
    id: Math.random().toString(36).slice(2, 10),
    type,
    title: "", body: "", imageUrl: "", link: "", items: [""],
    links: [{ label: "", url: "" }], date: "", author: "", images: [],
});

const newSection = () => ({
    id: Math.random().toString(36).slice(2, 10),
    title: "", layout: "list", cards: [newCard("text")],
});

const iCls = "border hover:shadow-md focus-within:shadow-md bg-white p-3 py-0 rounded-xl transition-all duration-200 flex w-full gap-3 items-center";
const lbl  = "text-purple-700 text-base font-medium flex-shrink-0";
const fi   = "outline-none w-full px-2 py-4 font-medium text-gray-600";

async function uploadImageToStorage(file, uid, cardId) {
    const ext = file.name.split('.').pop();
    const storageRef = ref(storage, `custom-sections/${uid}/${cardId}-${Date.now()}.${ext}`);
    const snap = await uploadBytes(storageRef, file);
    return getDownloadURL(snap.ref);
}

function ImageUploader({ value, onChange, uid, cardId, label: fieldLabel = "Image" }) {
    const fileRef = useRef();
    const [uploading, setUploading] = useState(false);

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await uploadImageToStorage(file, uid, cardId);
            onChange(url);
            toast.success("Image uploaded.");
        } catch {
            toast.error("Image upload failed.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <span className={lbl}>{fieldLabel}</span>
            <div className="flex gap-2 items-center flex-wrap">
                {value && (
                    <img src={value} alt="preview" className="w-24 h-16 object-cover rounded-lg border border-gray-200" />
                )}
                <div className="flex flex-col gap-1">
                    <button type="button" onClick={() => fileRef.current.click()}
                        disabled={uploading}
                        className="text-sm font-medium text-purple-700 border border-purple-200 rounded-lg px-4 py-2 hover:bg-purple-50 transition-colors disabled:opacity-50">
                        {uploading ? "Uploading…" : value ? "Replace image" : "Upload image"}
                    </button>
                    <p className="text-xs text-gray-400">or paste a URL:</p>
                    <input type="url" value={value} placeholder="https://…"
                        onChange={e => onChange(e.target.value)}
                        className="border rounded-xl outline-none px-3 py-2 text-sm font-medium text-gray-600 hover:shadow-md focus:shadow-md transition-shadow w-64" />
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>
        </div>
    );
}

function CardEditor({ card, onChange, onRemove, uid }) {
    const [open, setOpen] = useState(true);

    const set = (key, val) => onChange({ ...card, [key]: val });
    const setItem = (i, val) => { const a = [...card.items]; a[i] = val; set("items", a); };
    const addItem = () => set("items", [...card.items, ""]);
    const removeItem = (i) => set("items", card.items.filter((_, idx) => idx !== i));
    const setLink = (i, k, val) => { const a = [...card.links]; a[i] = { ...a[i], [k]: val }; set("links", a); };
    const addLink = () => set("links", [...card.links, { label: "", url: "" }]);
    const removeLink = (i) => set("links", card.links.filter((_, idx) => idx !== i));
    const setGalleryImg = (i, val) => { const a = [...(card.images || [])]; a[i] = val; set("images", a); };
    const addGalleryImg = () => set("images", [...(card.images || []), ""]);
    const removeGalleryImg = (i) => set("images", (card.images || []).filter((_, idx) => idx !== i));

    const typeInfo = CARD_TYPES.find(t => t.value === card.type);

    return (
        <div className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center cursor-pointer px-4 py-3" onClick={() => setOpen(o => !o)}>
                <div className="flex items-center gap-2.5">
                    <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full">{typeInfo?.label}</span>
                    {card.title && <span className="text-gray-500 text-sm truncate max-w-[220px]">{card.title}</span>}
                </div>
                <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                    <button type="button" onClick={onRemove} className="text-rose-400 hover:text-rose-600 text-sm font-medium">Remove</button>
                    <img src={upArrow} alt="toggle" className={`h-3 transition-transform duration-200 ${open ? '' : 'rotate-180'}`} />
                </div>
            </div>

            {open && (
                <div className="px-4 pb-4 flex flex-col gap-3 border-t border-gray-100 pt-3">
                    {/* Card type selector */}
                    <div className="flex gap-2 flex-wrap">
                        {CARD_TYPES.map(t => (
                            <button key={t.value} type="button"
                                title={t.desc}
                                onClick={() => onChange({ ...newCard(t.value), id: card.id })}
                                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${card.type === t.value ? 'bg-purple-600 text-white' : 'border border-gray-200 text-gray-600 hover:border-purple-300'}`}>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Title (all types) */}
                    <div className={iCls}>
                        <span className={lbl}>{card.type === "quote" ? "Heading (optional)" : "Title"}</span>
                        <input className={fi} type="text" placeholder="Card heading" value={card.title} onChange={e => set("title", e.target.value)} />
                    </div>

                    {/* Body */}
                    {["text", "image-text", "quote", "timeline"].includes(card.type) && (
                        <textarea
                            className="border rounded-xl p-3 text-sm font-medium text-gray-600 outline-none resize-none hover:shadow-md focus:shadow-md transition-shadow"
                            rows={4}
                            placeholder={card.type === "quote" ? "Quote or testimonial text…" : card.type === "timeline" ? "Describe what happened…" : "Body text…"}
                            value={card.body}
                            onChange={e => set("body", e.target.value)}
                        />
                    )}

                    {/* Author (quote) */}
                    {card.type === "quote" && (
                        <div className={iCls}>
                            <span className={lbl}>Author</span>
                            <input className={fi} type="text" placeholder="Jane Doe, CEO at Acme" value={card.author || ""} onChange={e => set("author", e.target.value)} />
                        </div>
                    )}

                    {/* Date (timeline) */}
                    {card.type === "timeline" && (
                        <div className={iCls}>
                            <span className={lbl}>Date / Period</span>
                            <input className={fi} type="text" placeholder="Jan 2024 – Mar 2024" value={card.date || ""} onChange={e => set("date", e.target.value)} />
                        </div>
                    )}

                    {/* Image (image-text) */}
                    {card.type === "image-text" && (
                        <ImageUploader value={card.imageUrl} onChange={v => set("imageUrl", v)} uid={uid} cardId={card.id} label="Image" />
                    )}

                    {/* Bullet list */}
                    {card.type === "list" && (
                        <div className="flex flex-col gap-2">
                            {card.items.map((item, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <input type="text" value={item} placeholder={`Item ${i + 1}`}
                                        onChange={e => setItem(i, e.target.value)}
                                        className="border rounded-xl outline-none w-full px-3 py-3 text-sm font-medium text-gray-600 hover:shadow-md focus:shadow-md transition-shadow" />
                                    <img src={deleteImage} alt="remove" onClick={() => removeItem(i)} className="w-7 h-7 cursor-pointer hover:scale-110 transition-transform" />
                                </div>
                            ))}
                            <button type="button" onClick={addItem} className="text-sm font-medium text-purple-700 border border-purple-200 rounded-lg px-3 py-1.5 hover:bg-purple-50 transition-colors w-fit">+ Add item</button>
                        </div>
                    )}

                    {/* Link grid */}
                    {card.type === "link-grid" && (
                        <div className="flex flex-col gap-2">
                            {card.links.map((lnk, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <input type="text" value={lnk.label} placeholder="Label"
                                        onChange={e => setLink(i, "label", e.target.value)}
                                        className="border rounded-xl outline-none w-1/3 px-3 py-3 text-sm font-medium text-gray-600 hover:shadow-md focus:shadow-md transition-shadow" />
                                    <input type="url" value={lnk.url} placeholder="https://…"
                                        onChange={e => setLink(i, "url", e.target.value)}
                                        className="border rounded-xl outline-none flex-1 px-3 py-3 text-sm font-medium text-gray-600 hover:shadow-md focus:shadow-md transition-shadow" />
                                    <img src={deleteImage} alt="remove" onClick={() => removeLink(i)} className="w-7 h-7 cursor-pointer hover:scale-110 transition-transform" />
                                </div>
                            ))}
                            <button type="button" onClick={addLink} className="text-sm font-medium text-purple-700 border border-purple-200 rounded-lg px-3 py-1.5 hover:bg-purple-50 transition-colors w-fit">+ Add link</button>
                        </div>
                    )}

                    {/* Gallery */}
                    {card.type === "gallery" && (
                        <div className="flex flex-col gap-3">
                            <p className="text-xs text-gray-400">Upload images or paste URLs for your gallery.</p>
                            {(card.images || []).map((img, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                    {img && <img src={img} alt="" className="w-16 h-12 object-cover rounded-lg border border-gray-200 flex-shrink-0" />}
                                    <input type="url" value={img} placeholder={`Image URL ${i + 1}`}
                                        onChange={e => setGalleryImg(i, e.target.value)}
                                        className="border rounded-xl outline-none flex-1 px-3 py-3 text-sm font-medium text-gray-600 hover:shadow-md focus:shadow-md transition-shadow" />
                                    <img src={deleteImage} alt="remove" onClick={() => removeGalleryImg(i)} className="w-7 h-7 cursor-pointer hover:scale-110 transition-transform" />
                                </div>
                            ))}
                            <ImageUploader value="" onChange={url => set("images", [...(card.images || []), url])} uid={uid} cardId={`${card.id}-g${(card.images || []).length}`} label="Upload & add image" />
                        </div>
                    )}

                    {/* Optional CTA link */}
                    {["text", "image-text", "list"].includes(card.type) && (
                        <div className={iCls}>
                            <span className={lbl}>Link (optional)</span>
                            <input className={fi} type="url" placeholder="https://…" value={card.link} onChange={e => set("link", e.target.value)} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function SectionEditor({ section, onChange, onDelete, uid }) {
    const updateCard = (i, card) => { const c = [...section.cards]; c[i] = card; onChange({ ...section, cards: c }); };
    const removeCard = (i) => onChange({ ...section, cards: section.cards.filter((_, idx) => idx !== i) });
    const addCard = (type) => onChange({ ...section, cards: [...section.cards, newCard(type)] });

    return (
        <div className="border border-purple-200 rounded-xl p-5 shadow-md bg-white flex flex-col gap-4">
            {/* Section title + layout */}
            <div className="flex gap-3 items-center max-sm:flex-col">
                <div className={iCls + " flex-1"}>
                    <span className={lbl}>Section Title</span>
                    <input className={fi} type="text" placeholder="e.g. Side Projects, Testimonials…"
                        value={section.title} onChange={e => onChange({ ...section, title: e.target.value })} />
                </div>
                <div className="flex gap-1 flex-shrink-0">
                    {LAYOUTS.map(l => (
                        <button key={l.value} type="button"
                            title={`${l.label} layout`}
                            onClick={() => onChange({ ...section, layout: l.value })}
                            className={`text-sm px-3 py-2 rounded-lg font-medium transition-colors ${section.layout === l.value ? 'bg-purple-600 text-white' : 'border border-gray-200 text-gray-600 hover:border-purple-300'}`}>
                            {l.icon} {l.label}
                        </button>
                    ))}
                </div>
                <button type="button" onClick={onDelete} className="text-rose-400 hover:text-rose-600 text-sm font-medium flex-shrink-0">Delete</button>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-3">
                {section.cards.map((card, i) => (
                    <CardEditor key={card.id} card={card} onChange={c => updateCard(i, c)} onRemove={() => removeCard(i)} uid={uid} />
                ))}
            </div>

            {/* Add card */}
            <div className="border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-400 font-medium mb-2">Add a card:</p>
                <div className="flex gap-2 flex-wrap">
                    {CARD_TYPES.map(t => (
                        <button key={t.value} type="button" onClick={() => addCard(t.value)}
                            title={t.desc}
                            className="text-xs text-purple-700 border border-purple-200 rounded-full px-3 py-1.5 hover:bg-purple-50 transition-colors font-medium">
                            + {t.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function CustomSectionInfo() {
    const { user, setUser, setLoading } = useUser();
    const { sectionId } = useParams();
    const navigate = useNavigate();
    const draftKey = user ? `portify-custom-sections-${user.uid}` : null;

    const [sections, setSections] = useState([]);
    const [hasDraft, setHasDraft] = useState(false);

    useEffect(() => {
        if (!user) return;
        if (draftKey) {
            try {
                const saved = JSON.parse(localStorage.getItem(draftKey));
                if (saved?.length && JSON.stringify(saved) !== JSON.stringify(user.customSections || [])) {
                    setHasDraft(true);
                    setSections(saved);
                    return;
                }
            } catch {}
        }
        setSections(user?.customSections?.length ? user.customSections : []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const saveDraft = (data) => { if (draftKey) try { localStorage.setItem(draftKey, JSON.stringify(data)); } catch {} };
    const clearDraft = () => { if (draftKey) localStorage.removeItem(draftKey); setHasDraft(false); };

    const discardDraft = () => {
        clearDraft();
        setSections(user?.customSections?.length ? user.customSections : []);
        toast.info("Draft discarded.");
    };

    const update = (data) => { setSections(data); saveDraft(data); };
    const updateSection = (i, s) => { const n = [...sections]; n[i] = s; update(n); };
    const deleteSection = (i) => update(sections.filter((_, idx) => idx !== i));
    const addSection = () => { const s = newSection(); update([...sections, s]); navigate(`/dashboard/custom-sections/${s.id}`); };

    const handleSave = async () => {
        if (sections.some(s => !s.title.trim())) { toast.error("Every section needs a title."); return; }
        setLoading(true);
        try {
            await updateDoc(doc(db, "users", user.uid), { customSections: sections });
            setUser({ ...user, customSections: sections });
            clearDraft();
            toast.success("Custom sections saved.");
        } catch {
            toast.error("Failed to save. Please try again.");
        }
        setLoading(false);
    };

    const activeIdx = sectionId ? sections.findIndex(s => s.id === sectionId) : -1;

    return (
        <section className="flex gap-4 flex-col font-[raleway]">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-purple-700 text-3xl font-bold max-sm:text-2xl">Custom Sections</h2>
                    <p className="text-gray-500 text-sm mt-1">Build unique portfolio pages with your own content and card types.</p>
                </div>
                <button type="button" onClick={addSection}
                    className="bg-gradient-to-bl from-violet-500 to-purple-700 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all flex-shrink-0 mt-1">
                    + New Section
                </button>
            </div>

            {/* Draft banner */}
            {hasDraft && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm">
                    <span className="text-amber-700 font-medium flex-1">You have an unsaved draft.</span>
                    <button onClick={discardDraft} className="text-gray-500 hover:underline">Discard</button>
                </div>
            )}

            {sections.length === 0 ? (
                /* Empty state */
                <div className="border-2 border-dashed border-purple-200 rounded-xl p-10 flex flex-col items-center gap-4 text-center bg-purple-50/30">
                    <div className="text-4xl">✦</div>
                    <div>
                        <p className="text-gray-700 font-semibold text-base">No custom sections yet</p>
                        <p className="text-gray-400 text-sm mt-1">Create a section, add cards with text, images, links, timelines, and more.</p>
                    </div>
                    <button type="button" onClick={addSection}
                        className="text-purple-700 font-semibold border border-purple-300 rounded-lg px-6 py-2.5 hover:bg-purple-50 transition-colors">
                        Create your first section
                    </button>
                </div>
            ) : (
                <>
                    {/* Section tabs */}
                    <div className="flex gap-2 flex-wrap border-b border-gray-200 pb-3">
                        {sections.map((s, i) => (
                            <button key={s.id} type="button"
                                onClick={() => navigate(`/dashboard/custom-sections/${s.id}`)}
                                className={`text-sm font-medium px-4 py-1.5 rounded-lg transition-colors ${s.id === sectionId ? 'bg-purple-600 text-white' : 'text-purple-700 border border-purple-200 hover:bg-purple-50'}`}>
                                {s.title || `Section ${i + 1}`}
                            </button>
                        ))}
                    </div>

                    {activeIdx >= 0 ? (
                        <SectionEditor
                            section={sections[activeIdx]}
                            onChange={s => updateSection(activeIdx, s)}
                            onDelete={() => { deleteSection(activeIdx); navigate("/dashboard/custom-sections"); }}
                            uid={user?.uid}
                        />
                    ) : (
                        <div className="text-center py-10 text-gray-400 text-sm">
                            Select a section tab above to edit it.
                        </div>
                    )}
                </>
            )}

            {sections.length > 0 && (
                <button type="button" onClick={handleSave}
                    className="bg-gradient-to-bl hover:shadow-lg hover:shadow-purple-200 duration-200 from-violet-500 to-purple-700 transition-all w-fit px-6 text-base font-semibold rounded-lg py-2.5 text-white">
                    Save Changes
                </button>
            )}

            <section className="shadow shadow-purple-100 border border-purple-100 rounded-xl p-4 mr-12 max-sm:mr-0 bg-purple-50/70">
                <h3 className="text-lg font-bold text-gray-700 mb-2">Tips for custom sections</h3>
                <ul className="space-y-1">
                    {[
                        "Each section gets its own page on your portfolio with a unique URL.",
                        "Choose a layout — List (full width), Grid (2 columns), or Masonry (Pinterest-style).",
                        "Mix card types freely — timeline for a journey, quotes for testimonials, link grids for resources.",
                        "Upload images directly or paste image URLs — both work.",
                        "Your draft auto-saves so a refresh won't lose your work.",
                        "Sections appear in your portfolio nav after your standard sections.",
                    ].map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="text-purple-400 mt-0.5">›</span> {tip}
                        </li>
                    ))}
                </ul>
            </section>
        </section>
    );
}
