import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { profileSeo } from '../profileSeo';
import { db } from "../Firebase";
import { query, collection, where, getDocs, doc, updateDoc, increment } from "firebase/firestore";
import { getPublicSections } from '../profileSections';
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

async function trackView(userId) {
    const dateKey  = new Date().toISOString().slice(0, 10);
    const visitKey = `portify-visited-${userId}-${dateKey}`;
    try {
        if (localStorage.getItem(visitKey)) return;
        const userRef = doc(db, "users", userId);
        const update  = { totalViews: increment(1), [`viewsByDate.${dateKey}`]: increment(1) };
        await updateDoc(userRef, update);
        localStorage.setItem(visitKey, "1");
    } catch { /* Analytics must never prevent a public profile from loading. */ }
}

export default function UserHeader() {
    const { username } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [userDetails, setUserDetails] = useState(null);
    const [openMenu, setOpenMenu] = useState(false);
    const [compactNav, setCompactNav] = useState(true);
    const headerRef = useRef(null);
    const navRef = useRef(null);
    const menuRef = useRef(null);
    const sections = getPublicSections(userDetails);

    useEffect(() => {
        setLoading(true);
        let cancelled = false;
        const fetchUser = async () => {
            try {
                const q = query(collection(db, 'users'), where('username', '==', username), where('websiteStatus', '==', 'active'));
                const snapshot = await getDocs(q);
                if (cancelled) return;
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
                if (cancelled) return;
                toast.error("An error occurred while fetching user data.");
                navigate('/no-user');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchUser();
        return () => { cancelled = true; };
    }, [username, navigate]);

    useEffect(() => {
        const header = headerRef.current;
        const nav = navRef.current;
        if (!header || !nav) return;
        let active = true;
        const measure = () => {
            if (!active) return;
            const padding = getComputedStyle(header);
            const available = header.clientWidth - parseFloat(padding.paddingLeft) - parseFloat(padding.paddingRight);
            const nameWidth = header.querySelector('.username-heading').getBoundingClientRect().width;
            setCompactNav(window.innerWidth < 640 || nameWidth + nav.getBoundingClientRect().width + 32 > available);
        };
        const observer = new ResizeObserver(measure);
        observer.observe(header);
        observer.observe(nav);
        measure();
        document.fonts.ready.then(measure);
        return () => { active = false; observer.disconnect(); };
    }, [userDetails, loading]);

    useEffect(() => { setOpenMenu(false); }, [location.pathname]);
    useEffect(() => {
        if (!openMenu) return;
        const closeOnEscape = event => {
            if (event.key === 'Escape') { setOpenMenu(false); menuRef.current?.focus(); }
        };
        window.addEventListener('keydown', closeOnEscape);
        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [openMenu]);

    if (loading) return <UserLoading username={username} />;

    if (!userDetails) return null;
    const style = userDetails.selectedStyle || 'bold-purple';
    const fontFamily = userDetails.selectedFont || 'outfit';
    const bgImage = backgroundImages[style];

    const { title: pageTitle, description, canonical: canonicalUrl } = profileSeo(userDetails, location.pathname, import.meta.env.VITE_SITE_URL || window.location.origin);

    return (
        <>
            <Helmet>
                <meta name="robots" content="index,follow" />
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
                <script type="application/ld+json">{JSON.stringify({ '@context': 'https://schema.org', '@type': 'ProfilePage', url: canonicalUrl, name: pageTitle, mainEntity: { '@type': 'Person', name: userDetails.name || userDetails.username, description, ...(userDetails.profession ? { jobTitle: userDetails.profession } : {}) } }).replace(/</g, '\\u003c')}</script>
            </Helmet>

            <header
                ref={headerRef}
                className={`${style}-user-header portfolio-header`}
                data-compact={compactNav}
                style={{ fontFamily }}
            >
                <Link
                    onClick={() => setOpenMenu(false)}
                    className="username-heading"
                    to={`/${userDetails.username}`}
                >
                    {userDetails.username}
                </Link>

                {compactNav && <button ref={menuRef} type="button" className="portfolio-menu-toggle" aria-label={openMenu ? 'Close navigation' : 'Open navigation'} aria-expanded={openMenu} aria-controls="portfolio-mobile-nav" onClick={() => setOpenMenu(value => !value)}>
                    <img src={openMenu ? cross : menu} alt="" className={openMenu ? 'cross' : 'menu'} />
                </button>}

                {openMenu && compactNav && (
                    <nav
                        id="portfolio-mobile-nav"
                        aria-label="Portfolio sections"
                        className="mobile-header animate__animated animate__fadeInUp"
                        style={{ fontFamily }}
                    >
                        {sections.map((section) => {
                            const isActive = location.pathname.endsWith(section.to);
                            return (
                                <Link
                                    key={section.id}
                                    to={section.to}
                                    className={isActive ? 'mobile-header-active-link' : 'mobile-header-links'}
                                    onClick={() => setOpenMenu(false)}
                                >
                                    {section.label}
                                </Link>
                            );
                        })}
                    </nav>
                )}

                <nav ref={navRef} className="desktop-header" aria-label="Portfolio sections" aria-hidden={compactNav} style={{ fontFamily }}>
                    {sections.map((section) => {
                        const isActive = location.pathname.endsWith(section.to);
                        return (
                            <Link
                                key={section.id}
                                to={section.to}
                                className={isActive ? 'desktop-header-active-link' : 'desktop-header-links'}
                            >
                                {section.label}
                            </Link>
                        );
                    })}
                </nav>
            </header>

            {bgImage && (
                <div
                    className={`${style}-div`}
                    style={{ backgroundImage: `url(${bgImage})` }}
                />
            )}
            {!bgImage && <div className={`${style}-div`} />}

            <main className={`${style}-main`} style={{ fontFamily }}>
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
