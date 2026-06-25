import { useEffect, useState } from "react";
import upArrow from "../Assets/Images/up-arrow.png";
import { useUser } from "../Context";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../Firebase";
import { toast } from "react-toastify";

const FIXED_LEVELS = ["10th", "12th", "Undergraduate", "Postgraduate"];

const emptyFixed = (level) => ({
    filled: false, complete: false, level,
    data: level === "10th" || level === "12th"
        ? { institution: "", board: "", end: "", gradeType: "", grade: "" }
        : { institution: "", start: "", end: "", gradeType: "", grade: "", branch: "", degree: "" },
});

const emptyDoctorate = () => ({
    filled: false, complete: false, level: "Doctorate",
    data: { institution: "", start: "", end: "", gradeType: "", grade: "", branch: "", degree: "" },
});

const INITIAL_FIXED = FIXED_LEVELS.map(emptyFixed);

const allEmpty = (fields) => Object.values(fields).every(f => f === '');
const anyEmpty = (fields) => Object.values(fields).some(f => f === '');

const inputCls = "border hover:shadow-lg focus-within:shadow-lg bg-white p-3 py-0 rounded-xl transition-all duration-200 flex w-full gap-3 items-center";

const Req = () => <span className="text-rose-400 ml-0.5 text-base font-medium">*</span>;

/* ── EduCard is defined OUTSIDE the parent so React never remounts it on state changes ── */
function EduCard({ edu, cardKey, currentOpen, setCurrentOpen, isDoc, docCount, onRemove, onChange }) {
    const open     = currentOpen === cardKey;
    const isSchool = !isDoc && (edu.level === "10th" || edu.level === "12th");
    const index    = parseInt(cardKey.split('-')[1], 10);

    return (
        <div
            className={`border rounded-xl p-4 px-5 max-sm:px-4 cursor-pointer transition-all duration-200
                ${open ? 'border-purple-400 shadow-md' : edu.complete ? 'bg-purple-50 border-purple-200' : edu.filled ? 'bg-red-50 border-red-200' : 'hover:shadow-sm border-gray-200'}`}
            onClick={() => setCurrentOpen(open ? null : cardKey)}
        >
            <div className="flex justify-between items-center">
                <h3 className="text-purple-700 text-base font-semibold">
                    {edu.level}{isDoc && docCount > 1 ? ` ${index + 1}` : ''}
                </h3>
                <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                    {isDoc && docCount > 1 && (
                        <button type="button" onClick={() => onRemove(index)}
                            className="text-sm text-rose-500 hover:text-rose-700 font-medium">
                            Remove
                        </button>
                    )}
                    <img className={`logo h-3.5 transition-transform duration-200 ${open ? '' : 'rotate-180'}`} src={upArrow} alt="toggle" />
                </div>
            </div>

            {open && (
                <div className="flex flex-col gap-4 mt-4" onClick={e => e.stopPropagation()}>
                    <div className={inputCls}>
                        <h2 className="text-purple-700 text-base font-medium flex-shrink-0">Institution <Req /></h2>
                        <input className="outline-none w-full px-2 py-4 font-medium text-gray-600" type="text" name="institution"
                            placeholder={isSchool ? "Amity International School" : "IIT Delhi"}
                            value={edu.data.institution || ''} onChange={e => onChange(index, e, isDoc)} />
                    </div>
                    {isSchool && (
                        <div className={inputCls}>
                            <h2 className="text-purple-700 text-base font-medium flex-shrink-0">Board <Req /></h2>
                            <input className="outline-none w-full px-2 py-4 font-medium text-gray-600" type="text" name="board"
                                placeholder="CBSE" value={edu.data.board || ''} onChange={e => onChange(index, e, isDoc)} />
                        </div>
                    )}
                    {!isSchool && (
                        <div className="flex gap-4 max-sm:flex-col">
                            <div className={inputCls}>
                                <h2 className="text-purple-700 text-base font-medium flex-shrink-0">Degree <Req /></h2>
                                <input className="outline-none w-full px-2 py-4 font-medium text-gray-600" type="text" name="degree"
                                    placeholder={isDoc ? "Ph.D" : "B.Tech"} value={edu.data.degree || ''} onChange={e => onChange(index, e, isDoc)} />
                            </div>
                            <div className={inputCls}>
                                <h2 className="text-purple-700 text-base font-medium flex-shrink-0">Branch <Req /></h2>
                                <input className="outline-none w-full px-2 py-4 font-medium text-gray-600" type="text" name="branch"
                                    placeholder="Computer Science" value={edu.data.branch || ''} onChange={e => onChange(index, e, isDoc)} />
                            </div>
                        </div>
                    )}
                    <div className="flex gap-4 max-sm:flex-col">
                        {!isSchool && (
                            <div className={`${inputCls} w-1/3 max-sm:w-full`}>
                                <h2 className="text-purple-700 text-base font-medium flex-shrink-0">Start <Req /></h2>
                                <input className="outline-none w-full px-2 py-4 font-medium text-gray-600" type="text" name="start"
                                    placeholder="2021" value={edu.data.start || ''} onChange={e => onChange(index, e, isDoc)} />
                            </div>
                        )}
                        <div className={`${inputCls} w-1/3 max-sm:w-full`}>
                            <h2 className="text-purple-700 text-base font-medium flex-shrink-0">
                                {isSchool ? "Year of completion" : "End"} <Req />
                            </h2>
                            <input className="outline-none w-full px-2 py-4 font-medium text-gray-600" type="text" name="end"
                                placeholder="2025" value={edu.data.end || ''} onChange={e => onChange(index, e, isDoc)} />
                        </div>
                    </div>
                    {/* Grade row */}
                    <div className="flex gap-4 justify-start max-sm:flex-col">
                        <select
                            className="border px-2 py-4 rounded-xl text-base font-medium w-1/3 text-gray-600 outline-none max-sm:w-full"
                            name="gradeType" value={edu.data.gradeType || ''} onChange={e => onChange(index, e, isDoc)}
                        >
                            <option value="" disabled>Select grade type <Req /></option>
                            <option value="cgpa_4">CGPA (out of 4)</option>
                            <option value="cgpa_10">CGPA (out of 10)</option>
                            <option value="grade">Grade</option>
                            <option value="percentage">Percentage</option>
                        </select>
                        {edu.data.gradeType && (
                            <div className={`${inputCls} max-sm:w-full w-1/3`}>
                                <h2 className="text-purple-700 text-base font-medium flex-shrink-0">Score <Req /></h2>
                                <input className="outline-none w-full px-2 py-4 font-medium text-gray-600" type="text" name="grade"
                                    placeholder="e.g. 9.2" value={edu.data.grade || ''} onChange={e => onChange(index, e, isDoc)} />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function EducationInfo() {
    const { user, setUser, setLoading } = useUser();
    const draftKey = user ? `portify-education-${user.uid}` : null;

    const [fixedEdu, setFixedEdu]     = useState(INITIAL_FIXED);
    const [doctorates, setDoctorates] = useState([emptyDoctorate()]);
    const [currentOpen, setCurrentOpen] = useState(null);
    const [hasDraft, setHasDraft]     = useState(false);

    useEffect(() => {
        if (!user) return;
        const applyData = (arr) => {
            if (!arr?.length) return;
            const fixed = FIXED_LEVELS.map(lvl => arr.find(e => e.level === lvl) || emptyFixed(lvl));
            const docs  = arr.filter(e => e.level === "Doctorate");
            setFixedEdu(fixed);
            setDoctorates(docs.length ? docs : [emptyDoctorate()]);
        };
        if (draftKey) {
            try {
                const saved = JSON.parse(localStorage.getItem(draftKey));
                if (saved && JSON.stringify(saved) !== JSON.stringify(user.education || [])) {
                    setHasDraft(true);
                    applyData(saved);
                    return;
                }
            } catch {}
        }
        applyData(user.education);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const saveDraft = (fixed, docs) => {
        if (!draftKey) return;
        try { localStorage.setItem(draftKey, JSON.stringify([...fixed, ...docs])); } catch {}
    };

    const clearDraft = () => {
        if (draftKey) localStorage.removeItem(draftKey);
        setHasDraft(false);
    };

    const discardDraft = () => {
        clearDraft();
        const arr = user?.education || [];
        setFixedEdu(FIXED_LEVELS.map(lvl => arr.find(e => e.level === lvl) || emptyFixed(lvl)));
        const docs = arr.filter(e => e.level === "Doctorate");
        setDoctorates(docs.length ? docs : [emptyDoctorate()]);
        toast.info("Draft discarded.");
    };

    const handleChange = (index, event, isDoc = false) => {
        if (isDoc) {
            const updated = [...doctorates];
            updated[index] = { ...updated[index], data: { ...updated[index].data, [event.target.name]: event.target.value }, filled: true };
            setDoctorates(updated);
            saveDraft(fixedEdu, updated);
        } else {
            const updated = [...fixedEdu];
            updated[index] = { ...updated[index], data: { ...updated[index].data, [event.target.name]: event.target.value }, filled: true };
            setFixedEdu(updated);
            saveDraft(updated, doctorates);
        }
    };

    const addDoctorate = () => {
        const updated = [...doctorates, emptyDoctorate()];
        setDoctorates(updated);
        saveDraft(fixedEdu, updated);
    };

    const removeDoctorate = (index) => {
        const updated = doctorates.filter((_, i) => i !== index);
        setDoctorates(updated.length ? updated : [emptyDoctorate()]);
        saveDraft(fixedEdu, updated.length ? updated : [emptyDoctorate()]);
    };

    const clearAll = () => {
        setFixedEdu(INITIAL_FIXED);
        setDoctorates([emptyDoctorate()]);
        clearDraft();
        toast.info("Cleared. Save to apply.");
    };

    const computeStatus = (entries) => entries.map(e => {
        if (allEmpty(e.data)) return { ...e, filled: false, complete: false };
        if (anyEmpty(e.data)) return { ...e, filled: true, complete: false };
        return { ...e, filled: true, complete: true };
    });

    const handleSave = async (ev) => {
        ev.preventDefault();
        setLoading(true);
        const education = [...computeStatus(fixedEdu), ...computeStatus(doctorates)];
        try {
            await updateDoc(doc(db, 'users', user.uid), { education });
            setUser({ ...user, education });
            clearDraft();
            setCurrentOpen(null);
            toast.success("Education section updated.");
        } catch {
            toast.error("Failed to save. Please try again.");
        }
        setLoading(false);
    };

    return (
        <section className="flex gap-4 flex-col font-[raleway]">
            <div className="flex items-start justify-between gap-4">
                <h2 className="text-purple-700 text-3xl font-bold max-sm:text-2xl">Let's talk academics</h2>
                <button type="button" onClick={clearAll} className="text-sm text-gray-400 hover:text-rose-500 transition-colors flex-shrink-0 mt-1">
                    Clear all
                </button>
            </div>

            {hasDraft && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm">
                    <span className="text-amber-700 font-medium flex-1">You have an unsaved draft.</span>
                    <button onClick={discardDraft} className="text-gray-500 hover:underline">Discard</button>
                </div>
            )}

            <div className="flex flex-col gap-3">
                {fixedEdu.map((edu, i) => (
                    <EduCard
                        key={edu.level}
                        edu={edu}
                        cardKey={`fix-${i}`}
                        currentOpen={currentOpen}
                        setCurrentOpen={setCurrentOpen}
                        isDoc={false}
                        docCount={0}
                        onRemove={null}
                        onChange={handleChange}
                    />
                ))}
            </div>

            <div className="mt-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Doctoral Degrees</p>
                <div className="flex flex-col gap-3">
                    {doctorates.map((edu, i) => (
                        <EduCard
                            key={`doc-${i}`}
                            edu={edu}
                            cardKey={`doc-${i}`}
                            currentOpen={currentOpen}
                            setCurrentOpen={setCurrentOpen}
                            isDoc={true}
                            docCount={doctorates.length}
                            onRemove={removeDoctorate}
                            onChange={handleChange}
                        />
                    ))}
                </div>
                <button type="button" onClick={addDoctorate}
                    className="mt-3 text-sm font-medium text-purple-600 border border-purple-200 rounded-lg px-4 py-1.5 hover:bg-purple-50 transition-colors">
                    + Add another doctorate
                </button>
            </div>

            <button
                className="bg-gradient-to-bl hover:shadow-lg hover:shadow-purple-200 duration-200 from-violet-500 to-purple-700 transition-all w-fit px-6 text-base font-semibold rounded-lg py-2.5 text-white"
                onClick={handleSave}
            >
                Save Changes
            </button>

            <section className="shadow shadow-purple-100 border border-purple-100 rounded-xl p-4 mr-12 max-sm:mr-0 bg-purple-50/70">
                <h3 className="text-lg font-bold text-gray-700 mb-2">Tips for education</h3>
                <ul className="space-y-1">
                    {[
                        "Fields marked * are required — leave a section fully empty to hide it from your portfolio.",
                        "Partially filled sections show in red as a reminder; completed ones show in purple.",
                        "You can add multiple doctoral degrees using the button below that section.",
                        "Your draft auto-saves so a refresh won't lose your work.",
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
