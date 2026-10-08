import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import PortfolioImage from '../Components/PortfolioImage';
import { normalizeWebUrl } from '../profileLinks';

const fmtDate = (val) => {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d.toLocaleDateString();
};

export default function UserCertifications() {
    const { userDetails } = useOutletContext();
    const certifications = userDetails.certifications;

    useEffect(()=>{
        window.scrollTo(0, 0);
    },[])

    if(!certifications?.length){
        return(
            <h1 style={{ fontFamily: userDetails.selectedFont ? userDetails.selectedFont : 'Outfit' }} className="nothing-to-show">Nothing to show here</h1>
        )
    }

    return (
        <div className="certification-outer-div" style={{ fontFamily: userDetails.selectedFont ? userDetails.selectedFont : 'Outfit' }}>
            <div className="certification-inner-div">
                {certifications.map((cert, index) => (
                    <a href={normalizeWebUrl(cert.link) || undefined} target="_blank" rel="noopener noreferrer" key={index} className="certificate-div group" >
                        <div className="certificate-container-div">
                            <PortfolioImage src={cert.imageUrl || cert.image} alt={cert.title} />
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
                    </a>
                ))}
            </div>
        </div>
    );
}
