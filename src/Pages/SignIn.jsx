import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, db, provider } from "../Firebase";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import signInImage from "../Assets/Images/Alone-cuate.png";
import { Link, useNavigate } from "react-router-dom";
import eye from "../Assets/Images/eye.png";
import eyebrow from "../Assets/Images/eyebrow.png";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useUser } from "../Context";
import google from "../Assets/Images/google.png";

export default function SignIn() {
    const { user, setUser, setLoading } = useUser();
    const [email,      setEmail]      = useState("");
    const [password,   setPassword]   = useState("");
    const [visiblePw,  setVisiblePw]  = useState(false);
    const navigate = useNavigate();

    const emailRef = useRef(null);
    const pwRef    = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (user) navigate('/');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function parseFirebaseError(message) {
        try {
            return message.split("auth/")[1].split(')')[0].split('-').join(' ');
        } catch {
            return "Invalid email or password.";
        }
    }

    async function handleSignIn(e) {
        e.preventDefault();
        if (!email || !password) {
            toast.warn("Please fill in all fields.");
            return;
        }
        setLoading(true);
        emailRef.current?.blur();
        pwRef.current?.blur();

        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            const [userSnap, adminSnap] = await Promise.all([
                getDoc(doc(db, 'users', result.user.uid)),
                getDoc(doc(db, 'admin', result.user.uid)),
            ]);
            if (userSnap.exists()) {
                setUser({ uid: result.user.uid, ...userSnap.data() });
                navigate('/dashboard/general');
            } else if (adminSnap.exists()) {
                setUser({ uid: result.user.uid, ...adminSnap.data(), admin: true });
                navigate('/admin-dashboard');
            }
            setEmail(""); setPassword("");
        } catch (error) {
            toast.warn(parseFirebaseError(error.message));
        } finally {
            setLoading(false);
        }
    }

    async function signInWithGoogle(e) {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, provider);
            const gUser = result.user;
            const [userSnap, adminSnap] = await Promise.all([
                getDoc(doc(db, 'users', gUser.uid)),
                getDoc(doc(db, 'admin', gUser.uid)),
            ]);
            if (userSnap.exists()) {
                setUser({ uid: gUser.uid, ...userSnap.data() });
                navigate('/dashboard/general');
            } else if (adminSnap.exists()) {
                setUser({ uid: gUser.uid, ...adminSnap.data(), admin: true });
                navigate('/admin-dashboard');
            } else {
                await setDoc(doc(db, 'users', gUser.uid), {
                    name: gUser.displayName,
                    email: gUser.email,
                    websiteStatus: "inactive",
                });
                setUser({ uid: gUser.uid, name: gUser.displayName, email: gUser.email, websiteStatus: "inactive" });
                navigate('/dashboard/general');
            }
        } catch (error) {
            if (error.code !== 'auth/popup-closed-by-user') {
                toast.error("Google sign-in failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    const inputClass =
        'border hover:shadow-md focus-within:shadow-md p-3 py-0 rounded-xl transition-all duration-200 flex w-full gap-3 items-center';

    return (
        <main className="w-screen px-72 max-sm:px-6 h-[88vh] max-sm:h-auto font-[raleway] gap-12 flex items-center justify-between max-sm:flex-col max-sm:py-10">
            <img
                className="max-sm:hidden w-[42%] max-w-lg object-contain"
                alt="Welcome back"
                src={signInImage}
            />

            <form className="flex flex-col gap-4 w-6/12 justify-center pb-8 rounded-xl h-full p-6 px-10 max-sm:px-0 max-sm:w-full">
                <div className="mb-2">
                    <h1 className="text-4xl max-sm:text-3xl font-bold text-transparent bg-gradient-to-tl from-violet-600 to-purple-700 bg-clip-text">
                        Welcome back
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Sign in to continue to your portfolio</p>
                </div>

                <div className={inputClass}>
                    <h2 className="text-purple-700 text-sm font-semibold flex-shrink-0">Email</h2>
                    <input
                        ref={emailRef}
                        className="outline-none w-full px-2 py-4 font-medium text-gray-600 bg-transparent"
                        type="email"
                        placeholder="jane@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>

                <div className={inputClass}>
                    <h2 className="text-purple-700 text-sm font-semibold flex-shrink-0">Password</h2>
                    <input
                        ref={pwRef}
                        className="outline-none w-full px-2 py-4 font-medium text-gray-600 bg-transparent"
                        type={visiblePw ? "text" : "password"}
                        placeholder="Your password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <img
                        className="h-5 pr-1 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                        src={visiblePw ? eyebrow : eye}
                        onClick={() => setVisiblePw(v => !v)}
                        alt="toggle visibility"
                    />
                </div>

                <div className="flex justify-end -mt-2">
                    <Link
                        to="/forgot-password"
                        className="text-xs text-purple-600 hover:text-purple-800 hover:underline transition-colors"
                    >
                        Forgot password?
                    </Link>
                </div>

                <div className="flex flex-wrap gap-3 mt-1">
                    <button
                        className="bg-gradient-to-bl hover:shadow-lg hover:shadow-purple-200 duration-200 from-violet-500 to-purple-700 transition-all px-6 text-sm font-semibold rounded-lg py-2.5 text-white"
                        onClick={handleSignIn}
                    >
                        Sign In
                    </button>
                    <button
                        className="flex gap-2 items-center border border-gray-200 hover:border-purple-300 hover:shadow-sm duration-200 transition-all px-4 py-2.5 text-sm font-semibold rounded-lg text-gray-700"
                        onClick={signInWithGoogle}
                    >
                        <img className="h-5" src={google} alt="google" />
                        Continue with Google
                    </button>
                </div>

                <Link className="text-sm text-gray-500 hover:text-purple-700 transition-colors" to="/sign-up">
                    Don't have an account? <span className="font-semibold text-purple-700">Sign up</span>
                </Link>
            </form>
        </main>
    );
}
