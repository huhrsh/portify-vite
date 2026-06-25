import { useEffect, useState } from "react";
import { useParams, useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { db } from "../Firebase";
import { query, collection, where, getDocs, doc, updateDoc, increment, getDoc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import boldPurpleBackground from "../Assets/Images/pexels-tuesday-temptation-190692-3780104.jpg";
import simplyBlackBackground from "../Assets/Images/pexels-danielabsi-952670.jpg";
import oceanBlueBackground from "../Assets/Images/pexels-slendyalex-3648850.jpg";
import warmSunsetBackground from "../Assets/Images/pexels-adrien-olichon-1257089-2931286.jpg";
import UserLoading from "../Pages/UserLoading";
import menu from "../Assets/Images/menu-burger.png";
import cross from "../Assets/Images/cross-small.png";

const backgroundImages = {
    "bold-purple":      boldPurpleBackground,
    "simply-black":     simplyBlackBackground,
    "ocean-blue":       oceanBlueBackground,
    "warm-sunset":      warmSunsetBackground,
    "clean-light":      null,
    "midnight-forest":  null,
    "soft-blush":       null,
    "neo-brutalist":    null,
    "aurora-glass":     null,
    "editorial-ink":    null,
};

const DEFAULT_SECTION_ORDER = ['education', 'projects', 'experience', 'certifications', 'skills', 'contacts'];

async function trackView(userId) {
    const dateKey  = new Date().toISOString().slice(0, 10);
    const visitKey = `portify-visited-${userId}-${dateKey}`;
    if (localStorage.getItem(visitKey)) return;
    localStorage.setItem(visitKey, "1");
    try {
        const userRef = doc(db, "users", userId);
        const update  = { totalViews: increment(1), [`viewsByDate.${dateKey}`]: increment(1) };
        await updateDoc(userRef, update);
    } catch {}
}

export default function UserHeader() {
    const { username } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [userDetails, setUserDetails] = useState(null);
    const [sections, setSections] = useState([]);
    const [openMenu, setOpenMenu] = useState(false);

    useEffect(() => {
        setLoading(true);
        const fetchUser = async () => {
            try {
                const q = query(collection(db, 'users'), where('username', '==', username));
                const snapshot = await getDocs(q);
                if (snapshot.empty) {
                    navigate('/no-user');
                    return;
                }
                const userData = snapshot.docs[0].data();
                if (userData.websiteStatus !== 'active') {
                    navigate('/no-user');
                    return;
                }
                setUserDetails(userData);
                trackView(snapshot.docs[0].id);
            } catch (error) {
                toast.error("An error occurred while fetching user data.");
                navigate('/no-user');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [username, navigate]);

    useEffect(() => {
        if (!userDetails) return;
        const customMap = Object.fromEntries(
            (userDetails.customSections || []).map(s => [s.id, s])
        );
        const customIds = new Set(Object.keys(customMap));

        if (userDetails.navOrder?.length) {
            // Unified order: mix standard and custom as the user arranged them
            const nav = userDetails.navOrder
                .map(id => {
                    if (DEFAULT_SECTION_ORDER.includes(id)) {
                        return userDetails.selectedSections?.[id] ? { label: id, to: id } : null;
                    }
                    const cs = customMap[id];
                    return cs ? { label: cs.title || "Custom", to: `custom/${cs.id}` } : null;
                })
                .filter(Boolean);
            setSections(nav);
        } else {
            // Legacy fallback
            const order = userDetails.sectionOrder?.length ? userDetails.sectionOrder : DEFAULT_SECTION_ORDER;
            const standard = order.filter(s => userDetails.selectedSections?.[s]).map(s => ({ label: s, to: s }));
            const custom = (userDetails.customSections || []).map(s => ({ label: s.title || "Custom", to: `custom/${s.id}` }));
            setSections([...standard, ...custom]);
        }
    }, [userDetails]);

    if (loading) return <UserLoading username={username} />;

    const style = userDetails.selectedStyle || 'bold-purple';
    const fontFamily = userDetails.selectedFont || 'outfit';
    const bgImage = backgroundImages[style];

    const pageTitle  = userDetails.name
        ? `${userDetails.name} — Portfolio`
        : `${userDetails.username} — Portfolio`;
    const description = userDetails.about
        ? userDetails.about.slice(0, 155)
        : `${userDetails.name || userDetails.username}'s portfolio, built with Portify.`;
    const canonicalUrl = `${window.location.origin}/${userDetails.username}`;

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={description} />
                <link rel="canonical" href={canonicalUrl} />
                <meta property="og:title"       content={pageTitle} />
                <meta property="og:description" content={description} />
                <meta property="og:url"         content={canonicalUrl} />
                <meta property="og:type"        content="profile" />
                <meta name="twitter:card"        content="summary" />
                <meta name="twitter:title"       content={pageTitle} />
                <meta name="twitter:description" content={description} />
            </Helmet>

            <header
                className={`${style}-user-header`}
                style={{ fontFamily }}
            >
                <Link
                    onClick={() => setOpenMenu(false)}
                    className="username-heading"
                    to={`/${userDetails.username}`}
                >
                    {userDetails.username}
                </Link>

                {openMenu
                    ? <img src={cross} alt="close" className="cross" onClick={() => setOpenMenu(false)} />
                    : <img src={menu} alt="menu" className="menu" onClick={() => setOpenMenu(true)} />
                }

                {openMenu && (
                    <div
                        className="mobile-header animate__animated animate__fadeInUp"
                        style={{ fontFamily }}
                    >
                        {sections.map((section, i) => {
                            const isActive = location.pathname.endsWith(section.to);
                            return (
                                <Link
                                    key={i}
                                    to={section.to}
                                    className={isActive ? 'mobile-header-active-link' : 'mobile-header-links'}
                                    onClick={() => setOpenMenu(false)}
                                >
                                    {section.label}
                                </Link>
                            );
                        })}
                    </div>
                )}

                <div className="desktop-header" style={{ fontFamily }}>
                    {sections.map((section, i) => {
                        const isActive = location.pathname.endsWith(section.to);
                        return (
                            <Link
                                key={i}
                                to={section.to}
                                className={isActive ? 'desktop-header-active-link' : 'desktop-header-links'}
                            >
                                {section.label}
                            </Link>
                        );
                    })}
                </div>
            </header>

            {bgImage && (
                <div
                    className={`${style}-div`}
                    style={{ backgroundImage: `url(${bgImage})` }}
                />
            )}
            {!bgImage && <div className={`${style}-div`} />}

            <main className={`${style}-main`}>
                <Outlet context={{ userDetails, setLoading }} />
                <footer className="footer">
                    Made with&nbsp;
                    <Link
                        target="_blank"
                        to="/"
                        className={`${style}-footer-text font-semibold`}
                    >
                        Portify
                    </Link>
                </footer>
            </main>
        </>
    );
}
