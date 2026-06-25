import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";

export default function UserExperience() {
    const { userDetails } = useOutletContext();
    const experiences = userDetails.experiences;
    const fontFamily = userDetails.selectedFont || 'outfit';

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!experiences || experiences.length === 0) {
        return (
            <h1
                style={{ fontFamily }}
                className="nothing-to-show"
            >
                Nothing to show here
            </h1>
        );
    }

    const fmtDate = (val) => {
        if (!val) return null;
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    return (
        <div className="experience-outer-div" style={{ fontFamily }}>
            <div className="max-w-3xl">
            {experiences.map((exp, index) => (
                <div key={index} className="experience-item">
                    <h3 className="experience-role">{exp.role}</h3>
                    <p className="experience-company">{exp.company}</p>
                    {(fmtDate(exp.start) || exp.current) && (
                        <p className="experience-date">
                            {fmtDate(exp.start) || ''}
                            {(fmtDate(exp.start) || exp.current) && ' – '}
                            {exp.current ? 'Present' : fmtDate(exp.end) || ''}
                        </p>
                    )}
                    {exp.points && exp.points.length > 0 && (
                        <ul className="experience-list">
                            {exp.points.map((point, idx) => (
                                <li key={idx} className="experience-point">{point}</li>
                            ))}
                        </ul>
                    )}
                </div>
            ))}
            </div>
        </div>
    );
}
