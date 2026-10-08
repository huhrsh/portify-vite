import { useEffect, useState } from "react";
import { useUser } from "../Context";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../Firebase";
import { toast } from "react-toastify";
import deleteImage from "../Assets/Images/cross-circle.png";
import { updateRecord, updatePoint, addPoint as appendPoint, removePoint as deletePoint } from '../editorData';

const EMPTY_EXP = () => ({
    role: "", company: "", start: "", end: "", current: false, points: [""],
});

export default function ExperienceInfo() {
    const { user, setUser, setLoading } = useUser();
    const draftKey = user ? `portify-experience-${user.uid}` : null;
    const [experiences, setExperiences] = useState([EMPTY_EXP()]);
    const [hasDraft, setHasDraft] = useState(false);

    useEffect(() => {
        if (!user) return;
        if (draftKey) {
            try {
                const saved = JSON.parse(localStorage.getItem(draftKey));
                if (Array.isArray(saved) && JSON.stringify(saved) !== JSON.stringify(user.experiences || [])) {
                    setHasDraft(true);
                    setExperiences(saved);
                    return;
                }
            } catch { /* Browser draft storage may be unavailable. */ }
        }
        setExperiences(Array.isArray(user.experiences) ? user.experiences : [EMPTY_EXP()]);
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
        setExperiences(Array.isArray(user?.experiences) ? user.experiences : [EMPTY_EXP()]);
        toast.info("Draft discarded.");
    };

    const clearAll = () => {
        update([]);
        toast.info("Cleared. Save to apply.");
    };

    const update = (data) => { setExperiences(data); saveDraft(data); setHasDraft(true); };

    const handleChange = (index, e) => {
        const { name, value, type, checked } = e.target;
        update(updateRecord(experiences, index, { [name]: type === 'checkbox' ? checked : value }));
    };
    const handlePointChange = (ei, pi, e) => {
        update(updatePoint(experiences, ei, 'points', pi, e.target.value));
    };
    const addExperience    = () => update([...experiences, EMPTY_EXP()]);
    const removeExperience = (i) => update(experiences.filter((_, idx) => idx !== i));
    const addPoint         = (ei) => update(appendPoint(experiences, ei, 'points'));
    const removePoint      = (ei, pi) => {
        update(deletePoint(experiences, ei, 'points', pi));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateDoc(doc(db, 'users', user.uid), { experiences });
            clearDraft();
            setUser(current => ({ ...current, experiences }));
            toast.success("Experience section updated.");
        } catch {
            toast.error("Failed to save experience.");
        }
        setLoading(false);
    };

    const inputCls = "border hover:shadow-md focus-within:shadow-md p-3 py-0 rounded-xl transition-all duration-200 flex w-full gap-3 items-center";

    return (
        <section className="flex gap-4 flex-col font-[raleway]">
            <div className="flex items-start justify-between gap-4">
                <h2 className="text-purple-700 text-3xl font-bold max-sm:text-2xl">&quot;Do you have any prior experience?&quot;</h2>
                <button type="button" onClick={clearAll} className="text-sm text-gray-400 hover:text-rose-500 transition-colors flex-shrink-0 mt-1">Clear all</button>
            </div>

            {hasDraft && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm">
                    <span className="text-amber-700 font-medium flex-1">You have an unsaved draft.</span>
                    <button onClick={discardDraft} className="text-gray-500 hover:underline">Discard</button>
                </div>
            )}

            <form className="flex flex-col gap-5" onSubmit={handleSave}>
                {experiences.map((exp, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow max-sm:px-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-purple-700 text-base font-bold">Experience {index + 1}</h3>
                            <button type="button" onClick={() => removeExperience(index)}
                                className="text-sm text-rose-500 hover:text-rose-700 font-medium transition-colors">
                                Remove
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className={inputCls}>
                                <span className="text-purple-700 text-base font-medium flex-shrink-0">Role <span className="text-rose-400 font-medium text-base">*</span></span>
                                <input aria-label={`Experience ${index + 1} role`} className="outline-none w-full px-2 py-4 font-medium text-gray-600" type="text"
                                    name="role" placeholder="Software Engineer" value={exp.role} onChange={e => handleChange(index, e)} />
                            </div>
                            <div className={inputCls}>
                                <span className="text-purple-700 text-base font-medium flex-shrink-0">Company <span className="text-rose-400 font-medium text-base">*</span></span>
                                <input aria-label={`Experience ${index + 1} company`} className="outline-none w-full px-2 py-4 font-medium text-gray-600" type="text"
                                    name="company" placeholder="Google" value={exp.company} onChange={e => handleChange(index, e)} />
                            </div>

                            <div className="flex gap-4 max-sm:flex-col">
                                <div className={`${inputCls} w-1/2 max-sm:w-full`}>
                                    <span className="text-purple-700 text-base font-medium flex-shrink-0">Start:</span>
                                    <input aria-label={`Experience ${index + 1} start date`} className="outline-none w-full px-2 py-3 font-medium text-gray-600 max-sm:py-3.5" type="date"
                                        name="start" value={exp.start} onChange={e => handleChange(index, e)} />
                                </div>
                                <div className={`${inputCls} w-1/2 max-sm:w-full`}>
                                    <span className="text-purple-700 text-base font-medium flex-shrink-0">End:</span>
                                    {!exp.current
                                        ? <input aria-label={`Experience ${index + 1} end date`} className="outline-none w-full px-2 py-3 font-medium text-gray-600 max-sm:py-3.5" type="date"
                                            name="end" value={exp.end} onChange={e => handleChange(index, e)} />
                                        : <span className="flex-1 max-sm:py-3 inline-block">&nbsp;</span>
                                    }
                                    <label className="flex items-center gap-1.5 flex-shrink-0 cursor-pointer">
                                        <input type="checkbox" name="current" checked={exp.current}
                                            onChange={e => handleChange(index, e)} className="accent-purple-600" />
                                        <span className="text-sm text-gray-600">Present</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <span className="text-purple-700 text-base font-semibold">Points:</span>
                                {(exp.points || []).map((point, pi) => (
                                    <div key={pi} className="flex gap-2 items-center">
                                        <input aria-label={`Experience ${index + 1} point ${pi + 1}`} className="border rounded-xl outline-none w-full px-3 py-3 font-medium text-gray-600 hover:shadow-md focus:shadow-md transition-shadow"
                                            type="text" placeholder={`Point ${pi + 1}`} value={point}
                                            onChange={e => handlePointChange(index, pi, e)} />
                                        <button type="button" aria-label={`Remove point ${pi + 1} from experience ${index + 1}`} onClick={() => removePoint(index, pi)}><img src={deleteImage} alt="" className="w-8 h-8 flex-shrink-0 hover:scale-110 transition-transform" /></button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addPoint(index)}
                                    className="text-sm font-medium text-purple-700 border border-purple-200 rounded-lg px-3 py-1.5 hover:bg-purple-50 transition-colors w-fit">
                                    + Add point
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                <div className="flex justify-between items-center">
                    <button type="button" onClick={addExperience}
                        className="bg-gradient-to-bl from-violet-500 to-purple-700 text-white text-sm font-semibold py-2.5 px-5 rounded-lg hover:shadow-lg transition-all">
                        Add Experience
                    </button>
                    <button type="submit"
                        className="bg-gradient-to-bl from-violet-500 to-purple-700 text-white text-sm font-semibold py-2.5 px-5 rounded-lg hover:shadow-lg transition-all">
                        Save Changes
                    </button>
                </div>
            </form>
        </section>
    );
}
