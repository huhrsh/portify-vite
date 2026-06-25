import React, { useState, useEffect, useRef } from "react";
import { Link, useOutletContext } from "react-router-dom";
import defaultImage from "../Assets/Images/6974855_4380.jpg";
import link from "../Assets/Images/link.png";

export default function UserProjects() {
    const { userDetails } = useOutletContext();
    const projects = userDetails.projects;

    const [selectedProject, setSelectedProject] = useState(null);
    const projectDetailsRef = useRef(null);

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
                            <img src={project.image || defaultImage} alt={project.projectTitle} className="image group-hover:scale-105 group-hover:brightness-90 transition-all duration-300" onError={e => { e.currentTarget.src = defaultImage; }} />
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
