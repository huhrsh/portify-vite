import { useEffect, useState } from "react";
import { db, storage } from "../Firebase";
import { useUser } from "../Context";
import { toast } from "react-toastify";
import { updateDoc, doc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

const EMPTY_CERT = () => ({
    title: "", organizer: "", issueDate: "", validity: "Lifetime", link: "", image: null, imageUrl: "",
});

const serializeForDraft = (certs) =>
    certs.map(c => ({ ...c, image: null }));

export default function CertificationInfo() {
    const { user, setLoading } = useUser();
    const draftKey = user ? `portify-certs-${user.uid}` : null;
    const [certifications, setCertifications] = useState([EMPTY_CERT()]);
    const [hasDraft, setHasDraft] = useState(false);

    useEffect(() => {
        if (!user) return;
        if (draftKey) {
            try {
                const saved = JSON.parse(localStorage.getItem(draftKey));
                const base  = serializeForDraft(user.certifications || []);
                if (saved?.length && JSON.stringify(saved) !== JSON.stringify(base)) {
                    setHasDraft(true);
                    setCertifications(saved.map(c => ({ ...c, image: null })));
                    return;
                }
            } catch {}
        }
        if (user?.certifications?.length) {
            setCertifications(user.certifications.map(c => ({ ...c, image: null })));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const saveDraft = (data) => {
        if (!draftKey) return;
        try { localStorage.setItem(draftKey, JSON.stringify(serializeForDraft(data))); } catch {}
    };

    const clearDraft = () => {
        if (draftKey) localStorage.removeItem(draftKey);
        setHasDraft(false);
    };

    const discardDraft = () => {
        clearDraft();
        if (user?.certifications?.length) {
            setCertifications(user.certifications.map(c => ({ ...c, image: null })));
        } else {
            setCertifications([EMPTY_CERT()]);
        }
        toast.info("Draft discarded.");
    };

    const clearAll = () => {
        setCertifications([EMPTY_CERT()]);
        clearDraft();
        toast.info("Cleared. Save to apply.");
    };

    const update = (data) => { setCertifications(data); saveDraft(data); };

    const handleChange = (index, field, value) => {
        const n = [...certifications]; n[index][field] = value; update(n);
    };
    const handleImageChange = (index, e) => {
        const n = [...certifications]; if (e.target.files[0]) n[index].image = e.target.files[0]; update(n);
    };
    const handleLifetimeChange = (index, checked) => {
        const n = [...certifications]; n[index].validity = checked ? "Lifetime" : ""; update(n);
    };
    const addCertification    = () => update([...certifications, EMPTY_CERT()]);
    const removeCertification = (index) => update(certifications.filter((_, i) => i !== index));

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const updated = [...certifications];
        try {
            for (let i = 0; i < certifications.length; i++) {
                if (certifications[i].image instanceof File) {
                    const storageRef = ref(storage, `certifications/${user.uid}/${certifications[i].image.name}`);
                    const task = uploadBytesResumable(storageRef, certifications[i].image);
                    updated[i].imageUrl = await new Promise((res, rej) => {
                        task.on("state_changed", null,
                            (err) => { toast.error("Image upload failed."); rej(err); },
                            async () => res(await getDownloadURL(task.snapshot.ref))
                        );
                    });
                }
            }
            const forFirestore = updated.map(c => ({
                title: c.title, organizer: c.organizer, issueDate: c.issueDate,
                link: c.link, validity: c.validity, imageUrl: c.imageUrl || c.image || "",
            }));
            await updateDoc(doc(db, 'users', user.uid), { certifications: forFirestore });
            clearDraft();
            toast.success("Certifications saved.");
        } catch {
            toast.error("Failed to save certifications.");
        }
        setLoading(false);
    };

    const inputCls = "border hover:shadow-md focus-within:shadow-md bg-white p-3 py-0 rounded-xl transition-all duration-200 flex w-full gap-3 items-center";
    const Req = () => <span className="text-rose-400 ml-0.5 font-medium text-base">*</span>;

    return (
        <section className="font-[raleway] flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
                <h2 className="text-purple-700 text-3xl font-bold max-sm:text-2xl">Boast those certificates</h2>
                <button type="button" onClick={clearAll} className="text-sm text-gray-400 hover:text-rose-500 transition-colors flex-shrink-0 mt-1">Clear all</button>
            </div>

            {hasDraft && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm">
                    <span className="text-amber-700 font-medium flex-1">You have an unsaved draft.</span>
                    <button onClick={discardDraft} className="text-gray-500 hover:underline">Discard</button>
                </div>
            )}

            <form className="flex flex-col gap-5" onSubmit={handleFormSubmit}>
                {certifications.map((cert, index) => (
                    <div key={index} className="flex flex-col gap-4 border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center">
                            <h3 className="text-purple-700 text-base font-bold">Certificate {index + 1}</h3>
                            {certifications.length > 1 && (
                                <button type="button" onClick={() => removeCertification(index)}
                                    className="text-sm text-rose-500 hover:text-rose-700 font-medium transition-colors">
                                    Remove
                                </button>
                            )}
                        </div>

                        <div className={inputCls}>
                            <span className="text-purple-700 text-base font-medium flex-shrink-0">Title <Req /></span>
                            <input type="text" value={cert.title} placeholder="Certificate Title"
                                onChange={e => handleChange(index, "title", e.target.value)}
                                className="outline-none w-full px-2 py-4 font-medium text-gray-600" required />
                        </div>
                        <div className={inputCls}>
                            <span className="text-purple-700 text-base font-medium flex-shrink-0">Organizer <Req /></span>
                            <input type="text" value={cert.organizer} placeholder="Certification Organizer"
                                onChange={e => handleChange(index, "organizer", e.target.value)}
                                className="outline-none w-full px-2 py-4 font-medium text-gray-600" required />
                        </div>
                        <div className={inputCls}>
                            <span className="text-purple-700 text-base font-medium flex-shrink-0">Link <Req /></span>
                            <input type="text" value={cert.link} placeholder="Certificate link"
                                onChange={e => handleChange(index, "link", e.target.value)}
                                className="outline-none w-full px-2 py-4 font-medium text-gray-600" required />
                        </div>

                        <div className="flex gap-4 max-sm:flex-col">
                            <div className={inputCls}>
                                <span className="text-purple-700 text-base font-medium flex-shrink-0">Date of Issue:</span>
                                <input type="date" value={cert.issueDate}
                                    onChange={e => handleChange(index, "issueDate", e.target.value)}
                                    className="outline-none w-full px-2 py-3 bg-white font-medium text-gray-600" />
                            </div>
                            <div className={inputCls}>
                                <span className="text-purple-700 text-base font-medium flex-shrink-0">Valid till:</span>
                                {cert.validity !== "Lifetime"
                                    ? <input type="date" value={cert.validity}
                                        onChange={e => handleChange(index, "validity", e.target.value)}
                                        className="outline-none w-full px-2 py-3 font-medium text-gray-600 bg-white" />
                                    : <span className="flex-1">&nbsp;</span>
                                }
                            </div>
                            <label className="flex items-center gap-2 flex-shrink-0 cursor-pointer">
                                <input type="checkbox" checked={cert.validity === "Lifetime"}
                                    onChange={e => handleLifetimeChange(index, e.target.checked)}
                                    className="accent-purple-600" />
                                <span className="text-sm font-medium text-gray-600">Lifetime</span>
                            </label>
                        </div>

                        <div className={`${inputCls} max-sm:py-1`}>
                            <span className="text-purple-700 text-base font-medium flex-shrink-0">Image:</span>
                            <input type="file" accept="image/*" onChange={e => handleImageChange(index, e)}
                                className="outline-none w-full px-2 py-2 font-medium text-gray-600" />
                        </div>
                    </div>
                ))}

                <div className="flex justify-between items-center">
                    <button type="button" onClick={addCertification}
                        className="bg-gradient-to-bl from-violet-500 to-purple-700 text-white text-sm font-semibold py-2.5 px-5 rounded-lg hover:shadow-lg transition-all">
                        Add Certification
                    </button>
                    <button type="submit"
                        className="bg-gradient-to-bl from-violet-500 to-purple-700 text-white text-sm font-semibold py-2.5 px-5 rounded-lg hover:shadow-lg transition-all">
                        Save Changes
                    </button>
                </div>
            </form>

            <section className="shadow shadow-purple-100 border border-purple-100 rounded-xl p-4 mr-12 max-sm:mr-0 bg-purple-50/70">
                <h3 className="text-lg font-bold text-gray-700 mb-2">Tips for certifications</h3>
                <ul className="space-y-1">
                    {[
                        "If an image shows \"No file chosen\" after saving, the existing image is still there — only new selections replace it.",
                        "Your draft auto-saves so a refresh won't lose your work.",
                        "Check \"Lifetime\" for certifications that don't expire.",
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
