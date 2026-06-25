import React, { useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';

export default function UserHome() {
    const { userDetails } = useOutletContext();
    const fontFamily = userDetails.selectedFont || 'outfit';

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const desiredOrder = ['education', 'projects', 'experience', 'certifications', 'skills', 'contacts'];
    const activeSections = userDetails.selectedSections
        ? Object.keys(userDetails.selectedSections)
              .filter(s => userDetails.selectedSections[s])
              .sort((a, b) => desiredOrder.indexOf(a) - desiredOrder.indexOf(b))
        : [];

    const contactLinks = (userDetails.contacts || []).filter(c =>
        ['LinkedIn', 'GitHub', 'Email', 'Website'].includes(c.label)
    ).slice(0, 4);

    return (
        <div className="home" style={{ fontFamily }}>
            <div className="hero-content">
                {userDetails.profession && (
                    <p className="hero-eyebrow">{userDetails.profession}</p>
                )}
                <h1 className="name">{userDetails.name}</h1>

                {userDetails.about && (
                    <p className="about">{userDetails.about}</p>
                )}

                {(activeSections.length > 0 || contactLinks.length > 0) && (
                    <div className="hero-cta">
                        {activeSections.slice(0, 3).map(section => (
                            <Link key={section} to={section} className="cta-link">
                                {section}
                            </Link>
                        ))}
                        {(userDetails.customSections || []).slice(0, 2).map(s => (
                            <Link key={s.id} to={`custom/${s.id}`} className="cta-link">
                                {s.title}
                            </Link>
                        ))}
                        {contactLinks.map((contact, i) => (
                            <a
                                key={i}
                                href={
                                    contact.label === 'Email'   ? `mailto:${contact.value}` :
                                    contact.label === 'Phone'   ? `tel:${contact.value}` :
                                    contact.value
                                }
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
