import React from 'react';
import bgImage from "../Assets/Images/pexels-tuesday-temptation-190692-3780104.jpg";
import 'animate.css'; 
import { Link } from 'react-router-dom';

export default function NoUser() {
    return (
        <>
            <div className="absolute h-screen inset-0 bg-cover backdrop-blur-lg " style={{ backgroundImage: `url(${bgImage})` }}></div>
            <div className="backdrop-blur-3xl w-screen h-screen "></div>
            <div className='h-screen w-screen flex items-center justify-center absolute top-0'>
                <div className='max-w-screen-lg flex items-start flex-col justify-center text-white gap-8 font-[Raleway'>
                    <h1 className='text-8xl max-sm:text-6xl max-sm:px-6 font-bold user-border-text'>
                        No user found by this username
                    </h1>
                    <span className='text-4xl max-sm:text-2xl max-sm:px-6 user-border-text'>Visit <Link to='/'>Portify</Link> to get your own website.</span>
                </div>
                {/* <div className='w-1/2 flex items-center justify-start'>
                    <h1 className='animate__animated animate__fadeInRight z-50 text-9xl font-semibold user-loading-text'>
                        {secondHalf}
                    </h1>
                </div> */}
            </div>
        </>
    );
}
