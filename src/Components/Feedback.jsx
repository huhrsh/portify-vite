import feedback from "../Assets/Images/Feedback-rafiki.png"
import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Rating from '@mui/material/Rating';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAltOutlined';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import { useUser } from "../Context";
import { useState } from "react";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../Firebase";

const StyledRating = styled(Rating)(({ theme }) => ({
    '& .MuiRating-iconEmpty .MuiSvgIcon-root': {
        color: theme.palette.action.disabled,
    },
}));

const customIcons = {
    1: {
        icon: <SentimentVeryDissatisfiedIcon color="error" fontSize="large" />,
        label: 'Very Dissatisfied',
    },
    2: {
        icon: <SentimentDissatisfiedIcon color="error" fontSize="large" />,
        label: 'Dissatisfied',
    },
    3: {
        icon: <SentimentSatisfiedIcon color="warning" fontSize="large" />,
        label: 'Neutral',
    },
    4: {
        icon: <SentimentSatisfiedAltIcon color="success" fontSize="large" />,
        label: 'Satisfied',
    },
    5: {
        icon: <SentimentVerySatisfiedIcon color="success" fontSize="large" />,
        label: 'Very Satisfied',
    },
};

function IconContainer(props) {
    const { value, ...other } = props;
    return <span {...other}>{customIcons[value].icon}</span>;
}

IconContainer.propTypes = {
    value: PropTypes.number.isRequired,
};

export default function Feedback() {
    const { user,  setLoading } = useUser()
    const [email, setEmail] = useState()
    const [rating, setRating] = useState()
    const [feedbacks, setFeedbacks] = useState("")

    useEffect(() => {
        if (user) {
            setEmail(user.email);
        }
    }, [user])

    const handleRatingChange = (event, newValue) => {
        setRating(newValue);
    };

    async function handleFeedback() {
        try {
            if (!rating) {
                toast.warn("Please give a rating.");
                return;
            }
            if (!email) {
                toast.warn("Please enter email.");
                return;
            }
            setLoading(true);
            const feedbackDoc = await addDoc(collection(db, 'feedback'), {
                email,
                rating,
                feedbacks
            })

            if (feedbackDoc.id) {
                toast.success("Feeback submitted.")
            }
            else {
                toast.error("Error in submitting feedback")
            }
            setFeedbacks("")
            setRating()
            setEmail("")
            setLoading(false)
        }
        catch (err) {
            console.log("Error in sending feedback",err);
        }
    }

    return (
        <>
            <div className="flex w-full items-center px-24 py-6 gap-24 font-[raleway] max-sm:p-0 max-sm:flex-col max-sm:gap-4">
                <img className="w-5/12 max-sm:w-full max-sm:scale-110" src={feedback} alt="feedback" />
                <div className="flex flex-col gap-6 max-sm:w-full">
                    <h1 className="text-4xl max-sm:text-2xl antialiased font-semibold text-transparent bg-gradient-to-tr from-violet-800 to-purple-500 bg-clip-text">
                        We're eager to improve. <br />Share your thoughts with us!
                    </h1>
                    <div className="flex p-4 px-6 min-h-48 rounded-3xl shadow-md gap-3 flex-col bg-white">
                        <StyledRating
                            name="highlight-selected-only"
                            sx={{color:"White"}}
                            value={rating} 
                            onChange={handleRatingChange}
                            IconContainerComponent={IconContainer}
                            getLabelText={(value) => customIcons[value].label}
                            highlightSelectedOnly
                        />
                        {!user &&
                            <input type="email" placeholder="johndoe@gmail.com" className="border py-2 px-3 rounded-xl text-lg font-medium outline-none hover:shadow-md transition-all duration-200 focus:shadow-md text-gray-600" value={email} onChange={(e) => { setEmail(e.target.value) }} />
                        }
                        <textarea placeholder="your feedback" className="border py-1.5 px-3 rounded-xl text-lg font-medium min-h-32 outline-none hover:shadow-md transition-all duration-200 focus:shadow-md text-gray-600" value={feedbacks} onChange={(e) => { setFeedbacks(e.target.value) }}>

                        </textarea>
                        <button onClick={() => { handleFeedback() }} className="rounded px-3 py-1 transition-all duration-200 text-white shadow hover:shadow-lg bg-gradient-to-tr from-purple-700 to-violet-500 w-fit text-xl max-sm:text-lg font-medium" >Submit</button>
                    </div>
                </div>
            </div>
        </>

    )
}