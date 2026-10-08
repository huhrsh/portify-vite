import { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import PortfolioImage from '../Components/PortfolioImage';
import { normalizeWebUrl } from '../profileLinks';

export default function UserProjects() {
    const { userDetails } = useOutletContext();
    const projects = userDetails.projects;

    const [selectedProject, setSelectedProject] = useState(null);
    const projectDetailsRef = useRef(null);

    useEffect(()=>{
        window.scrollTo(0, 0);
    },[])

    useEffect(() => {
        if (selectedProject) projectDetailsRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }, [selectedProject]);

    if(!projects?.length){
        return(
            <h1 style={{ fontFamily: userDetails.selectedFont ? userDetails.selectedFont : 'Outfit' }} className="nothing-to-show">Nothing to show here</h1>
        )
    }

    return (
        <div className="project-outer-div" style={{ fontFamily: userDetails.selectedFont ? userDetails.selectedFont : 'Outfit' }}>
            <div className="project-grid">
                {projects.map((project, index) => (
                    <button type="button" key={index} aria-expanded={selectedProject === project} aria-controls="project-details" className={`project-card ${selectedProject === project ? 'selected-project group' : 'not-selected-project group'}`} onClick={() => setSelectedProject(project)} >
                        <div className="group project-div">
                            <p className="know-more-text">Know More &gt;</p>
                            <PortfolioImage src={project.image} alt={project.projectTitle} />
                        </div>
                        <h2 className="heading">{project.projectTitle}</h2>
                        <p className="title">{project.tagline}</p>
                    </button>
                ))}
            </div>

            {selectedProject && (
                <div id="project-details" ref={projectDetailsRef} className="project-that-is-opened" style={{ scrollMarginTop: 100 }}>
                    <h2 className="heading">{selectedProject.projectTitle}</h2>
                    <p className="tagline"> {selectedProject.tagline}</p>
                    <div className="inner-div">
                        <h3 className="heading">Overview</h3>
                        <p className="overview">{selectedProject.overview}</p>
                    </div>
                    <div className="inner-div">
                        <h3 className="heading">Technologies/ Libraries used:</h3>
                        <ul className="list">
                            {(selectedProject.technologies || []).map((tech, index) => (
                                <li className="points" key={index}>{tech}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="inner-div">
                        <h3 className="heading">Challenges faced:</h3>
                        <ul className="list">
                            {(selectedProject.challenges || []).map((challenge, index) => (
                                <li className="points" key={index}>{challenge}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="inner-div">
                        <h3 className="heading">Lessons learnt:</h3>
                        <ul className="list">
                            {(selectedProject.lessons || []).map((lesson, index) => (
                                <li className="points" key={index}>{lesson}</li>
                            ))}
                        </ul>
                    </div>
                    {normalizeWebUrl(selectedProject.githubLink) && <a href={normalizeWebUrl(selectedProject.githubLink)} target="_blank" rel="noopener noreferrer" className="project-link">
                        Project Link
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                            <polyline points="15 3 21 3 21 9"/>
                            <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                    </a>}
                </div>
            )}
        </div>
    );
}
