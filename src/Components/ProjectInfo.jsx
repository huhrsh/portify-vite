import { useEffect, useState } from "react";
import { db } from "../Firebase";
import { useUser } from "../Context";
import { toast } from "react-toastify";
import { doc, updateDoc } from "firebase/firestore";

async function uploadToCloudinary(file) {
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST", body: form,
    });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.secure_url;
}
import deleteImage from "../Assets/Images/cross-circle.png";

const EMPTY_PROJECT = () => ({
    projectTitle: "", tagline: "", githubLink: "", overview: "",
    image: null, technologies: [""], challenges: [""], lessons: [""],
});

const serializeForDraft = (projects) =>
    projects.map(p => ({ ...p, image: typeof p.image === 'string' ? p.image : null }));

export default function ProjectInfo() {
    const { user, setUser, setLoading } = useUser();
    const draftKey = user ? `portify-projects-${user.uid}` : null;
    const [projects, setProjects] = useState([EMPTY_PROJECT()]);
    const [hasDraft, setHasDraft] = useState(false);

    useEffect(() => {
        if (!user) return;
        if (draftKey) {
            try {
                const saved = JSON.parse(localStorage.getItem(draftKey));
                if (saved?.length && JSON.stringify(saved) !== JSON.stringify(serializeForDraft(user.projects || []))) {
                    setHasDraft(true);
                    setProjects(saved);
                    return;
                }
            } catch {}
        }
        if (user?.projects?.length) setProjects(user.projects);
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
        setProjects(user?.projects?.length ? user.projects : [EMPTY_PROJECT()]);
        toast.info("Draft discarded.");
    };

    const clearAll = () => {
        setProjects([EMPTY_PROJECT()]);
        clearDraft();
        toast.info("Cleared. Save to apply.");
    };

    const update = (updated) => { setProjects(updated); saveDraft(updated); };

    const handleProjectChange = (index, field, value) => {
        const n = [...projects]; n[index][field] = value; update(n);
    };
    const handleImageChange = (index, e) => {
        const n = [...projects]; if (e.target.files[0]) n[index].image = e.target.files[0]; update(n);
    };
    const handlePointChange = (pi, field, ci, value) => {
        const n = [...projects]; n[pi][field][ci] = value; update(n);
    };
    const addProject    = () => update([...projects, EMPTY_PROJECT()]);
    const removeProject = (i) => update(projects.filter((_, idx) => idx !== i));
    const addPoint      = (pi, field) => { const n = [...projects]; n[pi][field].push(""); update(n); };
    const removePoint   = (pi, field, ci) => {
        const n = [...projects]; n[pi][field] = n[pi][field].filter((_, i) => i !== ci); update(n);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updatedProjects = [...projects];
            for (let i = 0; i < projects.length; i++) {
                if (projects[i].image instanceof File) {
                    updatedProjects[i].image = await uploadToCloudinary(projects[i].image);
                }
            }
            await updateDoc(doc(db, 'users', user.uid), { projects: updatedProjects });
            setUser({ ...user, projects: updatedProjects });
            clearDraft();
            toast.success("Projects saved.");
        } catch {
            toast.error("Failed to save projects.");
        }
        setLoading(false);
    };

    const inputCls = "border hover:shadow-md focus-within:shadow-md p-3 py-0 rounded-xl transition-all duration-200 flex w-full gap-3 items-center bg-white";
    const Req = () => <span className="text-rose-400 ml-0.5 font-medium text-base">*</span>;

    return (
        <section className="font-[raleway] flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
                <h2 className="text-purple-700 text-3xl font-bold max-sm:text-2xl">Flaunt your projects</h2>
                <button type="button" onClick={clearAll} className="text-sm text-gray-400 hover:text-rose-500 transition-colors flex-shrink-0 mt-1">Clear all</button>
            </div>

            {hasDraft && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm">
                    <span className="text-amber-700 font-medium flex-1">You have an unsaved draft.</span>
                    <button onClick={discardDraft} className="text-gray-500 hover:underline">Discard</button>
                </div>
            )}

            <form className="flex flex-col gap-5" onSubmit={handleFormSubmit}>
                {projects.map((project, pi) => (
                    <div key={pi} className="flex flex-col gap-4 border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center">
                            <h3 className="text-purple-700 text-base font-bold">Project {pi + 1}</h3>
                            <button type="button" onClick={() => removeProject(pi)}
                                className="text-sm text-rose-500 hover:text-rose-700 font-medium transition-colors">
                                Remove
                            </button>
                        </div>

                        <div className={inputCls}>
                            <span className="text-purple-700 text-base font-medium flex-shrink-0">Title <Req /></span>
                            <input type="text" value={project.projectTitle} placeholder="Bliss India"
                                onChange={e => handleProjectChange(pi, "projectTitle", e.target.value)}
                                className="outline-none w-full px-2 py-4 font-medium text-gray-600" required />
                        </div>
                        <div className={inputCls}>
                            <span className="text-purple-700 text-base font-medium flex-shrink-0">Tagline <Req /></span>
                            <input type="text" value={project.tagline} placeholder="An e-commerce website"
                                onChange={e => handleProjectChange(pi, "tagline", e.target.value)}
                                className="outline-none w-full px-2 py-4 font-medium text-gray-600" required />
                        </div>
                        <div className={inputCls}>
                            <span className="text-purple-700 text-base font-medium flex-shrink-0">Project link <Req /></span>
                            <input type="text" value={project.githubLink} placeholder="github.com/user/project"
                                onChange={e => handleProjectChange(pi, "githubLink", e.target.value)}
                                className="outline-none w-full px-2 py-4 font-medium text-gray-600" required />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-purple-700 text-base font-medium">Overview <Req /></span>
                            <textarea value={project.overview}
                                placeholder="Describe the project, its purpose and impact..."
                                onChange={e => handleProjectChange(pi, "overview", e.target.value)}
                                className="outline-none w-full p-3 font-medium text-gray-600 hover:shadow-md focus:shadow-md border rounded-xl min-h-28 resize-none transition-shadow" required />
                        </div>
                        <div className={`${inputCls} max-sm:py-1`}>
                            <span className="text-purple-700 text-base font-medium flex-shrink-0">Image (optional):</span>
                            <input type="file" accept="image/*" onChange={e => handleImageChange(pi, e)}
                                className="outline-none w-full px-2 py-2 font-medium text-gray-600" />
                        </div>

                        {[
                            { field: "technologies", label: "Technologies / Libraries", placeholder: "React, Firebase" },
                            { field: "challenges",   label: "Challenges Faced",         placeholder: "Describe a challenge" },
                            { field: "lessons",      label: "What You Learned",         placeholder: "Key takeaway" },
                        ].map(({ field, label, placeholder }) => (
                            <div key={field} className="flex flex-col gap-2 mt-1">
                                <span className="text-purple-700 text-base font-medium">{label}:</span>
                                {project[field]?.map((val, ci) => (
                                    <div key={ci} className="flex gap-2 items-center">
                                        <input type="text" value={val} placeholder={placeholder}
                                            onChange={e => handlePointChange(pi, field, ci, e.target.value)}
                                            className="border hover:shadow-md focus:shadow-md rounded-xl outline-none w-full px-3 py-3 font-medium text-gray-600 transition-shadow" required />
                                        <img src={deleteImage} alt="remove" onClick={() => removePoint(pi, field, ci)}
                                            className="w-8 h-8 flex-shrink-0 cursor-pointer hover:scale-110 transition-transform" />
                                    </div>
                                ))}
                                <button type="button" onClick={() => addPoint(pi, field)}
                                    className="text-sm font-medium text-purple-700 border border-purple-200 rounded-lg px-3 py-1.5 hover:bg-purple-50 transition-colors w-fit">
                                    + Add {field === "technologies" ? "technology" : field === "challenges" ? "challenge" : "lesson"}
                                </button>
                            </div>
                        ))}
                    </div>
                ))}

                <div className="flex justify-between items-center">
                    <button type="button" onClick={addProject}
                        className="bg-gradient-to-bl from-violet-500 to-purple-700 text-white text-sm font-semibold py-2.5 px-5 rounded-lg hover:shadow-lg transition-all">
                        Add Project
                    </button>
                    <button type="submit"
                        className="bg-gradient-to-bl from-violet-500 to-purple-700 text-white text-sm font-semibold py-2.5 px-5 rounded-lg hover:shadow-lg transition-all">
                        Save Changes
                    </button>
                </div>
            </form>

            <section className="shadow shadow-purple-100 border border-purple-100 rounded-xl p-4 mr-12 max-sm:mr-0 bg-purple-50/70">
                <h3 className="text-lg font-bold text-gray-700 mb-2">Tips for projects</h3>
                <ul className="space-y-1">
                    {[
                        "If an image shows \"No file chosen\" after saving, the existing image is still there — only new selections replace it.",
                        "Your draft auto-saves as you type so a refresh won't lose your work.",
                        "Add a GitHub or live demo link so viewers can explore your work directly.",
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
