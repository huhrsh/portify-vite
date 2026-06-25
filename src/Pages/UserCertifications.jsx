import React, { useCallback, useEffect, useState } from "react";

const FALLBACK_BG = 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 50%, #c4b5fd 100%)';
import { Link, useOutletContext } from "react-router-dom";
import defaultImage from "../Assets/Images/Certification-cuate.png";

const fmtDate = (val) => {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d.toLocaleDateString();
};

export default function UserCertifications() {
    const { userDetails } = useOutletContext();
    const certifications = userDetails.certifications;
    const [imgState, setImgState] = useState({});
    const setLoaded = useCallback((i) => setImgState(p => ({...p, [i]: 'loaded'})), []);
    const setError  = useCallback((i) => setImgState(p => ({...p, [i]: 'error'})),  []);

    useEffect(()=>{
        window.scrollTo(0, 0);
    },[])

    if(!certifications){
        return(
            <h1 style={{ fontFamily: userDetails.selectedFont ? userDetails.selectedFont : 'Outfit' }} className="nothing-to-show">Nothing to show here</h1>
        )
    }

    return (
        <div className="certification-outer-div" style={{ fontFamily: userDetails.selectedFont ? userDetails.selectedFont : 'Outfit' }}>
            <div className="certification-inner-div">
                {certifications.map((cert, index) => (
                    <Link to={cert.link} target="_blank" key={index} className="certificate-div group" >
                        <div className="certificate-container-div">
                            {/* Fallback / shimmer — always rendered, reserves height */}
                            <div
                                className={`image flex items-center justify-center p-5 text-center
                                    ${imgState[index] === 'loaded' ? 'hidden' : ''}`}
                                style={{
                                    aspectRatio: '16/9',
                                    background: FALLBACK_BG,
                                }}
                            >
                                <span style={{
                                    fontSize: 18, fontWeight: 800, lineHeight: 1.4,
                                    color: 'rgba(109,40,217,0.45)',
                                    fontFamily: 'raleway, sans-serif',
                                    userSelect: 'none', textAlign: 'center',
                                }}>
                                    {cert.title || '?'}
                                </span>
                            </div>
                            {/* Real image */}
                            {cert.imageUrl && (
                                <img
                                    src={cert.imageUrl}
                                    alt={cert.title}
                                    loading="lazy"
                                    className={`image ${imgState[index] === 'loaded' ? '' : 'hidden'}`}
                                    onLoad={() => setLoaded(index)}
                                    onError={() => setError(index)}
                                />
                            )}
                            <div className="certificate-data-div group-hover:py-8 h-0 group-hover:h-full">
                                <h2 className="certificate-heading">{cert.title}</h2>
                                <p className="certificate-organizer">by {cert.organizer}</p>
                                {fmtDate(cert.issueDate) && <p className="certificate-point-desktop">Issued on: {fmtDate(cert.issueDate)}</p>}
                                <p className="certificate-point-desktop">{cert.validity === 'Lifetime' ? 'Validity: Lifetime' : fmtDate(cert.validity) ? "Valid till: " + fmtDate(cert.validity) : null}</p>
                                <p className="certificate-point-mobile">
                                    {fmtDate(cert.issueDate) || "—"} – {cert.validity === 'Lifetime' ? 'Lifetime' : fmtDate(cert.validity) || "—"}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
