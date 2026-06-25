import React, { useState, useEffect, useRef, useCallback } from "react";

const FALLBACK_BG = 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 50%, #c4b5fd 100%)';
import { Link, useOutletContext } from "react-router-dom";
import link from "../Assets/Images/link.png";

export default function UserProjects() {
    const { userDetails } = useOutletContext();
    const projects = userDetails.projects;

    const [selectedProject, setSelectedProject] = useState(null);
    const projectDetailsRef = useRef(null);
    // 'loading' | 'loaded' | 'error'
    const [imgState, setImgState] = useState({});
    const setLoaded = useCallback((i) => setImgState(p => ({...p, [i]: 'loaded'})), []);
    const setError  = useCallback((i) => setImgState(p => ({...p, [i]: 'error'})),  []);

    useEffect(()=>{
        window.scrollTo(0, 0);
    },[])

    const handleProjectClick = (project) => {
        setSelectedProject(project);
        setTimeout(() => {
            projectDetailsRef.current.scrollIntoView({ behavior: "smooth" });
        }, 100);  
    };

    if(!projects){
        return(
            <h1 style={{ fontFamily: userDetails.selectedFont ? userDetails.selectedFont : 'Outfit' }} className="nothing-to-show">Nothing to show here</h1>
        )
    }

    return (
        <div className="project-outer-div" style={{ fontFamily: userDetails.selectedFont ? userDetails.selectedFont : 'Outfit' }}>
            <div className="project-grid">
                {projects.map((project, index) => (
                    <div key={index} className={` ${selectedProject === project ? 'selected-project group' : 'not-selected-project group'}`} onClick={() => handleProjectClick(project)} >
                        <div className="group project-div">
                            <p className="know-more-text">Know More &gt;</p>
                            {/* Fallback / shimmer — always rendered so height is always reserved */}
                            <div
                                className={`image flex items-center justify-center p-4 text-center
                                    ${imgState[index] === 'loaded' ? 'hidden' : ''}`}
                                style={{ background: FALLBACK_BG }}
                            >
                                <span style={{
                                    fontSize: 18, fontWeight: 800, lineHeight: 1.4,
                                    color: 'rgba(109,40,217,0.45)',
                                    fontFamily: 'raleway, sans-serif',
                                    userSelect: 'none', textAlign: 'center',
                                }}>
                                    {project.projectTitle || '?'}
                                </span>
                            </div>
                            {/* Real image — hidden until loaded so fallback handles sizing */}
                            {project.image && (
                                <img
                                    src={project.image}
                                    alt={project.projectTitle}
                                    loading="lazy"
                                    className={`image group-hover:scale-105 group-hover:brightness-90 transition-all duration-300 ${imgState[index] === 'loaded' ? '' : 'hidden'}`}
                                    onLoad={() => setLoaded(index)}
                                    onError={() => setError(index)}
                                />
                            )}
                        </div>
                        <h2 className="heading">{project.projectTitle}</h2>
                        <p className="title">{project.tagline}</p>
                    </div>
                ))}
            </div>

            {selectedProject && (
                <div ref={projectDetailsRef} className="project-that-is-opened">
                    <h2 className="heading">{selectedProject.projectTitle}</h2>
                    <p className="tagline"> {selectedProject.tagline}</p>
                    <div className="inner-div">
                        <h3 className="heading">Overview</h3>
                        <p className="overview">{selectedProject.overview}</p>
                    </div>
                    <div className="inner-div">
                        <h3 className="heading">Technologies/ Libraries used:</h3>
                        <ul className="list">
                            {selectedProject.technologies.map((tech, index) => (
                                <li className="points" key={index}>{tech}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="inner-div">
                        <h3 className="heading">Challenges faced:</h3>
                        <ul className="list">
                            {selectedProject.challenges.map((challenge, index) => (
                                <li className="points" key={index}>{challenge}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="inner-div">
                        <h3 className="heading">Lessons learnt:</h3>
                        <ul className="list">
                            {selectedProject.lessons.map((lesson, index) => (
                                <li className="points" key={index}>{lesson}</li>
                            ))}
                        </ul>
                    </div>
                    <a href={`https://${selectedProject.githubLink}`} target="_blank" rel="noopener noreferrer" className="project-link">
                        Project Link <img className="h-5" src={link} alt="link"/>
                    </a>
                </div>
            )}
        </div>
    );
}
