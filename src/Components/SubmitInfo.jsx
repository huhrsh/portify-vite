import { useEffect } from "react";
import { db } from "../Firebase";
import { useUser } from "../Context";
import { toast } from "react-toastify";
import { doc, updateDoc } from "firebase/firestore";
import hurryImage from "../Assets/Images/Freelancer-cuate.png"
import { useNavigate } from "react-router-dom";

export default function SubmitInfo() {
    const { user, setUser, setLoading } = useUser();
    const navigate = useNavigate();

    useEffect(() => {}, []);

    const handlePublish = async () => {
        if (!user.username) {
            toast.error("Please set a username first.");
            navigate('/dashboard/general');
            return;
        }
        if (!user.about) {
            toast.error("Please fill in your About section first.");
            navigate('/dashboard/about');
            return;
        }
        setLoading(true);
        try {
            await updateDoc(doc(db, "users", user.uid), { websiteStatus: "active" });
            setUser({ ...user, websiteStatus: "active" });
            toast.success("Your portfolio is now live!");
            navigate('/dashboard/general');
        } catch {
            toast.error("Failed to publish. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (user?.websiteStatus !== "active") {
        return (
            <div className="px-4 max-sm:p-0">
                <h2 className="text-purple-700 text-3xl font-bold mb-1 max-sm:text-2xl">Publish Your Portfolio</h2>
                <p className="text-gray-500 text-sm mb-6">Your portfolio goes live instantly — no waiting for review.</p>
                <div className="flex items-center gap-8 max-sm:flex-col">
                    <img src={hurryImage} alt="Publish" className="w-5/12 max-sm:w-full max-w-xs" />
                    <div className="flex flex-col gap-4">
                        <p className="text-base text-gray-600">Make sure you've filled in your username and about section before publishing. Everything else can be updated anytime after going live.</p>
                        <button
                            onClick={handlePublish}
                            className="bg-gradient-to-br from-purple-500 to-purple-700 text-white font-semibold py-2.5 px-6 rounded-xl self-start hover:shadow-lg hover:shadow-purple-200 transition-all duration-200"
                        >
                            Publish Now
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
