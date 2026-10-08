import { useEffect, useState } from "react";
import { db } from "../Firebase";
import { useUser } from "../Context";
import { toast } from "react-toastify";
import { doc, updateDoc } from "firebase/firestore";
import deleteImage from "../Assets/Images/cross-circle.png";
import { updateRecord, updatePoint, addPoint as appendPoint, removePoint as deletePoint } from '../editorData';

const EMPTY_SKILL = () => ({ heading: "", points: [""] });

export default function SkillInfo() {
    const { user, setUser, setLoading } = useUser();
    const draftKey = user ? `portify-skills-${user.uid}` : null;
    const [skills, setSkills] = useState([EMPTY_SKILL()]);
    const [hasDraft, setHasDraft] = useState(false);

    useEffect(() => {
        if (!user) return;
        if (draftKey) {
            try {
                const saved = JSON.parse(localStorage.getItem(draftKey));
                if (Array.isArray(saved) && JSON.stringify(saved) !== JSON.stringify(user.skills || [])) {
                    setHasDraft(true);
                    setSkills(saved);
                    return;
                }
            } catch { /* Browser draft storage may be unavailable. */ }
        }
        setSkills(Array.isArray(user.skills) ? user.skills : [EMPTY_SKILL()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const saveDraft = (data) => {
        if (!draftKey) return;
        try { localStorage.setItem(draftKey, JSON.stringify(data)); } catch { /* Browser draft storage may be unavailable. */ }
    };

    const clearDraft = () => {
        try { if (draftKey) localStorage.removeItem(draftKey); } catch { /* Browser draft storage may be unavailable. */ }
        setHasDraft(false);
    };

    const discardDraft = () => {
        clearDraft();
        setSkills(Array.isArray(user?.skills) ? user.skills : [EMPTY_SKILL()]);
        toast.info("Draft discarded.");
    };

    const clearAll = () => {
        update([]);
        toast.info("Cleared. Save to apply.");
    };

    const update = (data) => { setSkills(data); saveDraft(data); setHasDraft(true); };

    const handleSkillChange = (index, field, value) => {
        update(updateRecord(skills, index, { [field]: value }));
    };
    const handlePointChange = (si, pi, value) => {
        update(updatePoint(skills, si, 'points', pi, value));
    };
    const addSkill    = () => update([...skills, EMPTY_SKILL()]);
    const removeSkill = (i) => update(skills.filter((_, idx) => idx !== i));
    const addPoint    = (si) => update(appendPoint(skills, si, 'points'));
    const removePoint = (si, pi) => {
        update(deletePoint(skills, si, 'points', pi));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateDoc(doc(db, 'users', user.uid), { skills });
            clearDraft();
            setUser(current => ({ ...current, skills }));
            toast.success("Skills saved.");
        } catch {
            toast.error("Failed to save skills.");
        }
        setLoading(false);
    };

    return (
        <section className="font-[raleway] flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
                <h2 className="text-purple-700 text-3xl font-bold max-sm:text-2xl">Showcase your skills</h2>
                <button type="button" onClick={clearAll} className="text-sm text-gray-400 hover:text-rose-500 transition-colors flex-shrink-0 mt-1">Clear all</button>
            </div>

            {hasDraft && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm">
                    <span className="text-amber-700 font-medium flex-1">You have an unsaved draft.</span>
                    <button onClick={discardDraft} className="text-gray-500 hover:underline">Discard</button>
                </div>
            )}

            <form className="flex flex-col gap-4" onSubmit={handleFormSubmit}>
                {skills.map((skill, si) => (
                    <div key={si} className="flex flex-col gap-4 border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow max-sm:gap-3">
                        <div className="flex justify-between items-center">
                            <h3 className="text-purple-700 text-base font-bold">Skill Group {si + 1}</h3>
                            <button type="button" onClick={() => removeSkill(si)}
                                className="text-sm text-rose-500 hover:text-rose-700 font-medium transition-colors">
                                Remove
                            </button>
                        </div>

                        <div className="border hover:shadow-md focus-within:shadow-md bg-white p-3 py-0 rounded-xl transition-all duration-200 flex w-full gap-3 items-center">
                            <span className="text-purple-700 text-base font-medium flex-shrink-0">Heading <span className="text-rose-400 font-medium text-base">*</span></span>
                            <input type="text" aria-label={`Skill group ${si + 1} heading`} value={skill.heading} placeholder="e.g. Programming Languages"
                                onChange={e => handleSkillChange(si, "heading", e.target.value)}
                                className="outline-none w-full px-2 py-4 font-medium text-gray-600" required />
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="text-purple-700 text-base font-medium">Skills:</span>
                            {skill.points?.map((point, pi) => (
                                <div key={pi} className="flex gap-2 items-center">
                                    <input type="text" aria-label={`Skill ${pi + 1} in group ${si + 1}`} value={point} placeholder={`Skill ${pi + 1}`}
                                        onChange={e => handlePointChange(si, pi, e.target.value)}
                                        className="border hover:shadow-md focus:shadow-md rounded-xl outline-none w-full px-3 py-3 font-medium text-gray-600 transition-shadow" required />
                                    <button type="button" aria-label={`Remove skill ${pi + 1} from group ${si + 1}`} onClick={() => removePoint(si, pi)}><img src={deleteImage} alt="" className="w-8 h-8 flex-shrink-0 hover:scale-110 transition-transform" /></button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addPoint(si)}
                                className="text-sm font-medium text-purple-700 border border-purple-200 rounded-lg px-3 py-1.5 hover:bg-purple-50 transition-colors w-fit">
                                + Add skill
                            </button>
                        </div>
                    </div>
                ))}

                <div className="flex justify-between items-center">
                    <button type="button" onClick={addSkill}
                        className="bg-gradient-to-bl from-violet-500 to-purple-700 text-white text-sm font-semibold py-2.5 px-5 rounded-lg hover:shadow-lg transition-all">
                        Add Skill Group
                    </button>
                    <button type="submit"
                        className="bg-gradient-to-bl from-violet-500 to-purple-700 text-white text-sm font-semibold py-2.5 px-5 rounded-lg hover:shadow-lg transition-all">
                        Save Changes
                    </button>
                </div>
            </form>

            <section className="shadow shadow-purple-100 border border-purple-100 rounded-xl p-4 mr-12 max-sm:mr-0 bg-purple-50/70">
                <h3 className="text-lg font-bold text-gray-700 mb-2">Tips for skills</h3>
                <ul className="space-y-1">
                    {[
                        "Group related skills together — e.g. \"Frontend\", \"Backend\", \"Tools\".",
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
