import { useEffect, useRef, useState } from "react";
import { useUser } from "../Context";
import { toast } from "react-toastify";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../Firebase";
import { useLocalStorage } from "../hooks/useLocalStorage";

export default function AboutInfo() {
    const { user, setUser, setLoading } = useUser();
    const aboutInputRef    = useRef(null);
    const nameInputRef     = useRef(null);
    const professionInputRef = useRef(null);

    const draftKey = user ? `portify-about-draft-${user.uid}` : 'portify-about-draft';
    const [draft, setDraft, clearDraft] = useLocalStorage(draftKey, null);

    const [name,       setName]       = useState('');
    const [profession, setProfession] = useState('');
    const [aboutText,  setAboutText]  = useState('');
    const [hasDraft,   setHasDraft]   = useState(false);

    useEffect(() => {
        if (!user) return;
        const saved = (() => {
            try { return JSON.parse(window.localStorage.getItem(draftKey)); } catch { return null; }
        })();
        if (saved && (
            saved.name !== user.name ||
            saved.profession !== (user.profession || '') ||
            saved.about !== (user.about || '')
        )) {
            setHasDraft(true);
        }
        setName(user.name || '');
        setProfession(user.profession || '');
        setAboutText(user.about || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleRestoreDraft = () => {
        if (!draft) return;
        setName(draft.name || '');
        setProfession(draft.profession || '');
        setAboutText(draft.about || '');
        setHasDraft(false);
        toast.info("Draft restored.");
    };

    const handleDiscardDraft = () => {
        clearDraft();
        setHasDraft(false);
        toast.info("Draft discarded.");
    };

    const saveDraft = (n, p, a) => {
        setDraft({ name: n, profession: p, about: a });
    };

    async function handleAboutChange(e) {
        e.preventDefault();

        const trimmedName       = name.trim();
        const trimmedProfession = profession.trim();
        const trimmedAbout      = aboutText.trim();

        if (!trimmedProfession) {
            toast.warn("Profession cannot be empty.");
            professionInputRef.current?.focus();
            return;
        }
        if (!trimmedAbout) {
            toast.warn("About section cannot be empty.");
            aboutInputRef.current?.focus();
            return;
        }
        if (
            trimmedName === (user.name || '') &&
            trimmedProfession === (user.profession || '') &&
            trimmedAbout === (user.about || '')
        ) {
            toast.warn("No changes detected.");
            return;
        }

        nameInputRef.current?.blur();
        aboutInputRef.current?.blur();
        professionInputRef.current?.blur();

        setLoading(true);
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                name: trimmedName,
                profession: trimmedProfession,
                about: trimmedAbout,
            });
            setUser({ ...user, name: trimmedName, profession: trimmedProfession, about: trimmedAbout });
            clearDraft();
            setHasDraft(false);
            toast.success("About section updated.");
        } catch {
            toast.error("Error saving. Please try again.");
        }
        setLoading(false);
    }

    const inputClass =
        'border hover:shadow-md focus-within:shadow-md group p-3 py-0 rounded-xl transition-all duration-200 flex w-full gap-3 items-center';
    const Req = () => <span className="text-rose-400 ml-0.5 font-medium text-base">*</span>;

    return (
        <section className="font-[raleway] flex flex-col gap-6">
            {hasDraft && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm">
                    <span className="text-amber-700 font-medium flex-1">You have unsaved draft changes.</span>
                    <button onClick={handleRestoreDraft} className="text-purple-700 font-semibold hover:underline">Restore</button>
                    <button onClick={handleDiscardDraft} className="text-gray-500 hover:underline">Discard</button>
                </div>
            )}

            <form className="flex flex-col pr-12 gap-4 items-start max-sm:pr-0">
                <div className="w-full flex flex-col gap-3 mb-2">
                    <h2 className="text-purple-700 text-3xl font-bold max-sm:text-2xl">What should we call you?</h2>
                    <div className={inputClass}>
                        <h2 className="text-purple-700 text-base font-semibold flex-shrink-0">Name <Req /></h2>
                        <input
                            ref={nameInputRef}
                            className="outline-none w-full h-full px-2 py-4 font-medium text-gray-600 bg-transparent"
                            type="text"
                            placeholder="Jane Doe"
                            value={name}
                            onChange={e => { setName(e.target.value); saveDraft(e.target.value, profession, aboutText); }}
                        />
                    </div>
                </div>

                <div className="w-full flex flex-col gap-3 mb-2">
                    <h2 className="text-purple-700 text-3xl font-bold max-sm:text-2xl">What is your profession?</h2>
                    <div className={inputClass}>
                        <h2 className="text-purple-700 text-base font-semibold flex-shrink-0">Profession <Req /></h2>
                        <input
                            ref={professionInputRef}
                            className="outline-none w-full h-full px-2 py-4 font-medium text-gray-600 bg-transparent"
                            type="text"
                            placeholder="Full-Stack Developer"
                            value={profession}
                            onChange={e => { setProfession(e.target.value); saveDraft(name, e.target.value, aboutText); }}
                        />
                    </div>
                </div>

                <div className="w-full flex flex-col gap-3">
                    <h2 className="text-purple-700 text-3xl font-bold max-sm:text-2xl">Write something about yourself</h2>
                    <div className={inputClass}>
                        <textarea
                            ref={aboutInputRef}
                            onChange={e => { setAboutText(e.target.value); saveDraft(name, profession, e.target.value); }}
                            value={aboutText}
                            className="outline-none w-full h-full p-2 font-medium text-base text-gray-600 sm:max-h-52 min-h-40 max-sm:min-h-60 resize-none bg-transparent"
                            placeholder="Passionate developer with a love for building elegant, impactful solutions…"
                        />
                    </div>
                    <p className="text-xs text-gray-400">{aboutText.length} characters</p>
                </div>

                <button
                    className="flex-shrink-0 bg-gradient-to-bl hover:shadow-lg hover:shadow-purple-200 duration-200 from-violet-500 to-purple-700 transition-all w-fit px-5 py-2.5 text-base font-semibold rounded-lg text-white"
                    onClick={handleAboutChange}
                >
                    Save Changes
                </button>
            </form>

            <section className="shadow shadow-purple-100 border border-purple-100 rounded-xl p-4 mr-12 max-sm:mr-0 bg-purple-50/70">
                <h3 className="text-lg font-bold text-gray-700 mb-2">Tips for a great "About Me"</h3>
                <ul className="space-y-1">
                    {[
                        "Highlight your unique skills and key achievements.",
                        "Keep it concise — 2-4 sentences works best.",
                        "Mention what you're currently working on or learning.",
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
