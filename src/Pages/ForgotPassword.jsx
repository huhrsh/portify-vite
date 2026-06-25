import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../Firebase";
import { useState } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import forgotImage from "../Assets/Images/Time management-rafiki.png";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
    const [email,  setEmail]  = useState("");
    const [sent,   setSent]   = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleReset(e) {
        e.preventDefault();
        if (!EMAIL_REGEX.test(email.trim())) {
            toast.warn("Please enter a valid email address.");
            return;
        }
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email.trim().toLowerCase());
            setSent(true);
            toast.success("Password reset email sent!");
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                toast.error("No account found with that email.");
            } else {
                toast.error("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="w-screen px-20 max-sm:px-6 min-h-[88vh] font-[raleway] gap-12 flex items-center justify-between max-sm:flex-col max-sm:py-10">
            <img
                className="h-72 object-contain max-sm:h-48"
                src={forgotImage}
                alt="Reset password"
            />

            <div className="flex flex-col gap-5 w-5/12 max-sm:w-full">
                <div>
                    <h1 className="text-4xl max-sm:text-3xl font-bold text-transparent bg-gradient-to-tl from-violet-600 to-purple-700 bg-clip-text">
                        Reset Password
                    </h1>
                    <p className="text-gray-500 text-sm mt-2">
                        Enter the email address linked to your account and we'll send you a reset link.
                    </p>
                </div>

                {sent ? (
                    <div className="p-5 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm">
                        <p className="font-semibold text-base mb-1">Check your inbox!</p>
                        <p>We've sent a password reset link to <strong>{email}</strong>. It may take a minute to arrive.</p>
                    </div>
                ) : (
                    <form className="flex flex-col gap-4" onSubmit={handleReset}>
                        <div className="border hover:shadow-md focus-within:shadow-md p-3 py-0 rounded-xl transition-all duration-200 flex w-full gap-3 items-center">
                            <h2 className="text-purple-700 text-sm font-semibold flex-shrink-0">Email</h2>
                            <input
                                className="outline-none w-full px-2 py-4 font-medium text-gray-600 bg-transparent"
                                type="email"
                                placeholder="jane@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-bl hover:shadow-lg hover:shadow-purple-200 duration-200 from-violet-500 to-purple-700 transition-all w-fit px-6 text-sm font-semibold rounded-lg py-2.5 text-white disabled:opacity-60"
                        >
                            {loading ? "Sending…" : "Send Reset Link"}
                        </button>
                    </form>
                )}

                <Link
                    to="/sign-in"
                    className="text-sm text-gray-500 hover:text-purple-700 transition-colors"
                >
                    ← Back to Sign In
                </Link>
            </div>
        </main>
    );
}
