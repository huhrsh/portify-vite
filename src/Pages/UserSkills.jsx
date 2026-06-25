import { useOutletContext } from "react-router-dom";
import React, { useEffect } from "react";

export default function UserSkills() {
    const { userDetails } = useOutletContext();
    const skills = userDetails.skills;

    useEffect(()=>{
        window.scrollTo(0, 0);
    },[])

    if(!skills){
        return(
            <h1 style={{ fontFamily: userDetails.selectedFont ? userDetails.selectedFont : 'Outfit' }} className="nothing-to-show">Nothing to show here</h1>
        )
    }

    return (
        <>
            <div className="skills-mobile" style={{ fontFamily: userDetails.selectedFont ? userDetails.selectedFont : 'Outfit' }}>
                <div className="">
                    {skills?.map((skill, index) => (
                        <div key={index} className="skill-container">
                            <h3 className="skill-heading">{skill.heading}</h3>
                            <ul className="skill-list">
                                {skill.points.map((point, idx) => (
                                    <li key={idx} className="skill-point">{point}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
            <div className="skills-desktop" style={{ fontFamily: userDetails.selectedFont ? userDetails.selectedFont : 'Outfit' }}>
                <div className="masonry">
                    {skills?.map((skill, index) => (
                        <div key={index} className="masonry-item">
                            <h3 className="skill-heading">{skill.heading}</h3>
                            <ul className="skill-list">
                                {skill.points.map((point, idx) => (
                                    <li key={idx} className="skill-point">{point}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
