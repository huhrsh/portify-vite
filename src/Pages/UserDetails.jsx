import { useEffect } from "react";
import cross from "../Assets/Images/cross-circle.png"

export default function UserDetails({ userDetails, setSelectedUser }) {

    useEffect(()=>{
        window.scrollTo(0, 0);
    },[])

    return (
        <div className="admin-user-details relative bg-white text-gray-900 p-8 rounded-lg shadow-lg w-full max-w-4xl mx-auto my-8 border border-gray-300"
             style={{ fontFamily: 'Raleway' }}>
            <img className="absolute top-0 right-0 h-10 translate-x-[50%] -translate-y-[50%] bg-white cursor-pointer rounded-full" onClick={()=>{setSelectedUser()}} src={cross} alt="close"/>
            <h1 className="text-3xl font-bold mb-4 text-purple-700">{userDetails.username}</h1>
            <p className="mb-2"><strong>Email:</strong> {userDetails.email}</p>
            <p className="mb-2"><strong>Profession:</strong> {userDetails.profession}</p>
            <p className="mb-6"><strong>About:</strong> {userDetails.about}</p>

            <h2 className="text-2xl font-semibold mb-4 text-purple-700">Education</h2>
            {userDetails.education?.map((edu, index) => (
                <div key={index} className="mb-4 p-4 rounded-md border border-gray-200 shadow-sm">
                    <h3 className="text-xl font-semibold mb-2 text-purple-700">{edu.level}</h3>
                    <p><strong>Institution:</strong> {edu.data.institution}</p>
                    <p><strong>Board:</strong> {edu.data.board}</p>
                    <p><strong>Grade:</strong> {edu.data.grade}</p>
                    <p><strong>End Year:</strong> {edu.data.end}</p>
                </div>
            ))}

            <h2 className="text-2xl font-semibold mb-4 text-purple-700">Projects</h2>
            {userDetails.projects?.map((project, index) => (
                <div key={index} className="mb-4 p-4 rounded-md border border-gray-200 shadow-sm">
                    <h3 className="text-xl font-semibold mb-2 text-purple-700">{project.projectTitle}</h3>
                    <p><strong>Tagline:</strong> {project.tagline}</p>
                    <p><strong>Overview:</strong> {project.overview}</p>
                    <p><strong>Technologies:</strong> {project.technologies.join(', ')}</p>
                    <p><strong>GitHub Link:</strong> <a href={project.githubLink} className="text-purple-700 hover:underline">{project.githubLink}</a></p>
                </div>
            ))}

            <h2 className="text-2xl font-semibold mb-4 text-purple-700">Experiences</h2>
            {userDetails.experiences?.map((exp, index) => (
                <div key={index} className="mb-4 p-4 rounded-md border border-gray-200 shadow-sm">
                    <h3 className="text-xl font-semibold mb-2 text-purple-700">{exp.role}</h3>
                    <p><strong>Company:</strong> {exp.company}</p>
                    <p><strong>Start:</strong> {exp.start}</p>
                    <p><strong>End:</strong> {exp.end}</p>
                    <p><strong>Current:</strong> {exp.current ? 'Yes' : 'No'}</p>
                    <p><strong>Points:</strong> {exp.points.join(', ')}</p>
                </div>
            ))}

            <h2 className="text-2xl font-semibold mb-4 text-purple-700">Skills</h2>
            {userDetails.skills?.map((skill, index) => (
                <div key={index} className="mb-4 p-4 rounded-md border border-gray-200 shadow-sm">
                    <h3 className="text-xl font-semibold mb-2 text-purple-700">{skill.heading}</h3>
                    <p>{skill.points.join(', ')}</p>
                </div>
            ))}
        </div>
    );
}
