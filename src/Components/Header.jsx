import { Link, Outlet, useNavigate } from "react-router-dom";
import profile from "../Assets/Images/abstract.png";
import Loading from "../Pages/Loading";
import { useUser } from "../Context";
import { ToastContainer, toast } from "react-toastify";
import { useState } from "react";
import { auth } from "../Firebase";
import { signOut } from "firebase/auth";
import Footer from "./Footer";

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, loading } = useUser();
    const navigate = useNavigate();

    const handleSignOut = async (e) => {
        e.preventDefault();
        setMenuOpen(false);
        try {
            navigate('/');
            await signOut(auth);
            toast.success('Signed out successfully!');
        } catch {
            toast.error('Error signing out.');
        }
    };

    const dashboardPath = user?.admin ? '/admin-dashboard' : '/dashboard/general';
    const navLinkClass  = "rounded-lg px-3 py-1.5 text-sm font-medium text-purple-700 hover:text-white hover:bg-purple-700 transition-all duration-150";
    const dangerClass   = "rounded-lg px-3 py-1.5 text-sm font-medium text-rose-600 hover:text-white hover:bg-rose-600 transition-all duration-150";

    return (
        <div className="flex flex-col min-h-screen">
            <ToastContainer autoClose={3000} position="top-center" />
            {loading && <Loading />}

            <header className="shadow-sm sticky top-0 left-0 bg-white/95 backdrop-blur-md z-50 border-b border-purple-50 font-[raleway] px-10 py-3.5 flex justify-between items-center max-sm:px-4">
                {/* Logo */}
                <Link
                    to="/"
                    className="text-2xl bg-gradient-to-bl from-violet-500 to-purple-800 text-transparent bg-clip-text flex items-center gap-2 font-bold tracking-tight"
                >
                    <img src={profile} alt="Portify logo" className="h-7 logo" />
                    Portify
                </Link>

                {/* Desktop Nav */}
                {!loading && (
                    user ? (
                        <nav className="flex max-sm:hidden items-center gap-2">
                            {user.websiteStatus === 'active' && (
                                <Link target="_blank" className={navLinkClass} to={`/${user.username}`}>
                                    My Website
                                </Link>
                            )}
                            <Link className={navLinkClass} to={dashboardPath}>
                                Dashboard
                            </Link>
                            <span className="text-gray-200 mx-1">|</span>
                            <span className="text-sm text-gray-500 font-medium">{user.name}</span>
                            <button className={dangerClass} onClick={handleSignOut}>
                                Sign out
                            </button>
                        </nav>
                    ) : (
                        <nav className="flex max-sm:hidden items-center gap-2">
                            <Link className={navLinkClass} to="/sign-in">Sign in</Link>
                            <Link
                                className="rounded-lg px-4 py-1.5 text-sm font-semibold text-white bg-gradient-to-tr from-purple-700 to-violet-500 hover:shadow-md hover:from-purple-800 hover:to-violet-600 transition-all duration-150"
                                to="/sign-up"
                            >
                                Get Started
                            </Link>
                        </nav>
                    )
                )}

                {/* Mobile Hamburger */}
                {!loading && (
                    <button
                        className="sm:hidden flex flex-col gap-1.5 p-2"
                        onClick={() => setMenuOpen(o => !o)}
                        aria-label="Toggle menu"
                    >
                        <span className={`block h-0.5 w-5 bg-purple-700 transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                        <span className={`block h-0.5 w-5 bg-purple-700 transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
                        <span className={`block h-0.5 w-5 bg-purple-700 transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                    </button>
                )}

                {/* Mobile Dropdown */}
                {menuOpen && (
                    <div className="sm:hidden absolute top-full right-0 left-0 bg-white shadow-lg border-b border-purple-100 p-4 flex flex-col gap-2 z-50">
                        {user ? (
                            <>
                                <p className="text-sm text-gray-500 font-medium px-2 pb-1 border-b border-gray-100">{user.name}</p>
                                {user.websiteStatus === 'active' && (
                                    <Link
                                        target="_blank"
                                        className={navLinkClass + " text-center"}
                                        to={`/${user.username}`}
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        My Website
                                    </Link>
                                )}
                                <Link
                                    className={navLinkClass + " text-center"}
                                    to={dashboardPath}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <button className={dangerClass} onClick={handleSignOut}>
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    className={navLinkClass + " text-center"}
                                    to="/sign-in"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Sign in
                                </Link>
                                <Link
                                    className="rounded-lg py-2 text-sm font-semibold text-center text-white bg-gradient-to-tr from-purple-700 to-violet-500"
                                    to="/sign-up"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Sign up
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </header>

            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
