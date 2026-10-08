import React, { useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { getPublicSections } from '../profileSections';
import { contactHref } from '../profileLinks';

export default function UserHome() {
    const { userDetails } = useOutletContext();
    const fontFamily = userDetails.selectedFont || 'outfit';

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const activeSections = getPublicSections(userDetails).slice(0, 5);

    const contactLinks = (userDetails.contacts || []).filter(c =>
        ['linkedin', 'github', 'email', 'website'].includes(c.label?.trim().toLowerCase()) && contactHref(c)
    ).slice(0, 4);

    return (
        <div className="home" style={{ fontFamily }}>
            <div className="hero-content">
                {userDetails.profession && (
                    <p className="hero-eyebrow">{userDetails.profession}</p>
                )}
                <h1 className="name">{userDetails.name || userDetails.username}</h1>

                {userDetails.about && (
                    <p className="about">{userDetails.about}</p>
                )}

                {(activeSections.length > 0 || contactLinks.length > 0) && (
                    <div className="hero-cta">
                        {activeSections.map(section => (
                            <Link key={section.id} to={section.to} className="cta-link">
                                {section.label}
                            </Link>
                        ))}
                        {contactLinks.map((contact, i) => (
                            <a
                                key={i}
                                href={contactHref(contact)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="cta-link"
                            >
                                {contact.label}
                            </a>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
