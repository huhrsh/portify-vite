import { createUserWithEmailAndPassword, deleteUser, signInWithPopup, signOut } from "firebase/auth";
import { auth, db, provider } from "../Firebase";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import signUpImage from "../Assets/Images/Design Process-rafiki.png";
import { Link, useNavigate } from "react-router-dom";
import eye from "../Assets/Images/eye.png";
import eyebrow from "../Assets/Images/eyebrow.png";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useUser } from "../Context";
import google from "../Assets/Images/google.png";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN = 8;

export default function SignUp() {
    const { user, setUser, setLoading } = useUser();
    const [name,            setName]            = useState("");
    const [email,           setEmail]           = useState("");
    const [password,        setPassword]        = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [visiblePw1,      setVisiblePw1]      = useState(false);
    const [visiblePw2,      setVisiblePw2]      = useState(false);
    const navigate = useNavigate();

    const nameRef    = useRef(null);
    const emailRef   = useRef(null);
    const pwRef      = useRef(null);
    const cpwRef     = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (user) navigate('/');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function parseFirebaseError(message) {
        try {
            return message.split("auth/")[1].split(')')[0].split('-').join(' ');
        } catch {
            return "Something went wrong. Please try again.";
        }
    }

    async function handleSignUp(e) {
        e.preventDefault();
        if (!name.trim()) {
            toast.warn("Please enter your name.");
            nameRef.current?.focus();
            return;
        }
        if (!EMAIL_REGEX.test(email)) {
            toast.warn("Please enter a valid email address.");
            emailRef.current?.focus();
            return;
        }
        if (password.length < PASSWORD_MIN) {
            toast.warn(`Password must be at least ${PASSWORD_MIN} characters.`);
            pwRef.current?.focus();
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            cpwRef.current?.focus();
            return;
        }

        [nameRef, emailRef, pwRef, cpwRef].forEach(r => r.current?.blur());
        setLoading(true);

        try {
            const credential = await createUserWithEmailAndPassword(auth, email, password);
            const newUser = credential.user;
            try {
                await setDoc(doc(db, 'users', newUser.uid), {
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    websiteStatus: "inactive",
                });
                toast.success("Account created! Please sign in.");
                await signOut(auth);
                navigate('/sign-in');
            } catch {
                try { await deleteUser(newUser); } catch { /* best effort */ }
                toast.error("Error creating account. Please try again.");
            }
        } catch (error) {
            toast.warn(parseFirebaseError(error.message));
        } finally {
            setLoading(false);
        }

        setName(""); setEmail(""); setPassword(""); setConfirmPassword("");
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
        'border hover:shadow-md focus-within:shadow-md group p-3 py-0 rounded-xl transition-all duration-200 flex w-full gap-3 items-center';

    return (
        <main className="w-screen px-72 h-[88vh] max-sm:h-auto font-[raleway] gap-12 flex items-center justify-between
                         bg-cover max-sm:flex-col-reverse max-sm:justify-center max-sm:px-6 max-sm:py-10">
            <form className="flex flex-col gap-4 w-6/12 justify-center pb-8 rounded-xl h-full p-6 px-10 max-sm:px-0 max-sm:w-full">
                <div className="mb-2">
                    <h1 className="text-4xl max-sm:text-3xl font-bold text-transparent bg-gradient-to-tl from-violet-600 to-purple-700 bg-clip-text">
                        Let's get started
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Create your free Portify account</p>
                </div>

                <div className={inputClass}>
                    <h2 className="text-purple-700 text-sm font-semibold flex-shrink-0">Name</h2>
                    <input
                        ref={nameRef}
                        className="outline-none w-full px-2 py-4 font-medium text-gray-600 bg-transparent"
                        type="text"
                        placeholder="Jane Doe"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
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
                        type={visiblePw1 ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <img
                        className="h-5 pr-1 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                        src={visiblePw1 ? eyebrow : eye}
                        onClick={() => setVisiblePw1(v => !v)}
                        alt="toggle visibility"
                    />
                </div>

                <div className={inputClass}>
                    <h2 className="text-purple-700 text-sm font-semibold flex-shrink-0 text-nowrap">Confirm</h2>
                    <input
                        ref={cpwRef}
                        className="outline-none w-full px-2 py-4 font-medium text-gray-600 bg-transparent"
                        type={visiblePw2 ? "text" : "password"}
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                    />
                    <img
                        className="h-5 pr-1 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                        src={visiblePw2 ? eyebrow : eye}
                        onClick={() => setVisiblePw2(v => !v)}
                        alt="toggle visibility"
                    />
                </div>

                <div className="flex flex-wrap gap-3 mt-1">
                    <button
                        className="bg-gradient-to-bl hover:shadow-lg hover:shadow-purple-200 duration-200 from-violet-500 to-purple-700 transition-all px-6 text-sm font-semibold rounded-lg py-2.5 text-white"
                        onClick={handleSignUp}
                    >
                        Create Account
                    </button>
                    <button
                        className="flex gap-2 items-center border border-gray-200 hover:border-purple-300 hover:shadow-sm duration-200 transition-all px-4 py-2.5 text-sm font-semibold rounded-lg text-gray-700"
                        onClick={signInWithGoogle}
                    >
                        <img className="h-5" src={google} alt="google" />
                        Continue with Google
                    </button>
                </div>

                <Link className="text-sm text-gray-500 hover:text-purple-700 transition-colors" to="/sign-in">
                    Already have an account? <span className="font-semibold text-purple-700">Sign in</span>
                </Link>
            </form>

            <img
                className="max-sm:hidden w-[42%] max-w-lg object-contain"
                alt="Get started"
                src={signUpImage}
            />
        </main>
    );
}
