import React, { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';

export default function UserEducation() {

    useEffect(()=>{
        window.scrollTo(0, 0);
    },[])

    const { userDetails } = useOutletContext();
    const educationDetails = userDetails?.education?.filter((edu) => edu.complete);

    const desiredOrder = ['Doctorate', 'Postgraduate', 'Undergraduate', '12th', '10th'];

    const sortedEducationDetails = educationDetails?.sort((a, b) =>
        desiredOrder.indexOf(a.level) - desiredOrder.indexOf(b.level)
    );

    const educationLabel = {
        cgpa_4: 'CGPA (out of 4)',
        cgpa_10: 'CGPA (out of 10)',
        grade: 'Grade',
        percentage: 'Percentage',
    };

    const renderEducationDetails = (edu) => {
        switch (edu.level) {
            case '10th':
            case '12th':
                return (
                    <div className="education-div" style={{ fontFamily: userDetails.selectedFont ? userDetails.selectedFont : 'Outfit' }} >
                        <h2 className=''>{edu.level}</h2>
                        <div><span>School:</span> {edu.data.institution}</div>
                        <div><span>Year:</span> {edu.data.end}</div>
                        <div><span>Board:</span> {edu.data.board}</div>
                        <div><span>{educationLabel[edu.data.gradeType]}:</span>{edu.data.grade}</div>
                    </div>
                );
            case 'Undergraduate':
            case 'Postgraduate':
            case 'Doctorate':
                return (
                    <div className="education-div" style={{ fontFamily: userDetails.selectedFont ? userDetails.selectedFont : 'Outfit' }} >
                        <h2 className=''>{edu.level}</h2>
                        <div><span>University:</span> {edu.data.institution}</div>
                        <div><span>Duration:</span> {edu.data.start} - {edu.data.end}</div>
                        <div><span>{educationLabel[edu.data.gradeType]}: </span>{edu.data.grade}</div>
                        <div><span>Degree:</span> {edu.data.degree}</div>
                        <div><span>Branch:</span> {edu.data.branch}</div>
                    </div>
                );
            default:
                return null;
        }
    };

    if(!educationDetails){
        return(
            <h1 style={{ fontFamily: userDetails.selectedFont ? userDetails.selectedFont : 'Outfit' }} className="nothing-to-show">Nothing to show here</h1>
        )
    }

    return (
        <>
            <section className="education-desktop">
                <Timeline position="alternate-reverse">
                    {sortedEducationDetails?.map((edu) => (
                        <TimelineItem key={edu.level}>
                            <TimelineSeparator>
                                <TimelineDot />
                                <TimelineConnector />
                            </TimelineSeparator>
                            <TimelineContent>
                                <div className="education-details">{renderEducationDetails(edu)}</div>
                            </TimelineContent>
                        </TimelineItem>
                    ))}
                </Timeline>
            </section>
            <section className="education-mobile">
                <Timeline position="right">
                    {sortedEducationDetails?.map((edu) => (
                        <TimelineItem key={edu.level}>
                            <TimelineSeparator>
                                <TimelineDot />
                                <TimelineConnector />
                            </TimelineSeparator>
                            <TimelineContent>
                                <div className="education-details">{renderEducationDetails(edu)}</div>
                            </TimelineContent>
                        </TimelineItem>
                    ))}
                </Timeline>
            </section>
        </>
    );
}
