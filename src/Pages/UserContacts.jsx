import { useOutletContext } from "react-router-dom";
import React, { useEffect } from "react";
import { contactHref } from '../profileLinks';

export default function UserContacts() {
    const { userDetails } = useOutletContext();
    const contacts = (userDetails.contacts || []).filter(contact => contact.value?.trim());

    useEffect(()=>{
        window.scrollTo(0, 0);
    },[])

    if(!contacts.length){
        return(
            <h1 style={{ fontFamily: userDetails.selectedFont ? userDetails.selectedFont : 'Outfit' }} className="nothing-to-show">Nothing to show here</h1>
        )
    }

    return (
        <div className="contact-outer-div" style={{ fontFamily: userDetails.selectedFont ? userDetails.selectedFont : 'Outfit' }}>
            <div className='contact-inner-div'>
                {contacts.map((contact, index) => (
                        <a target="_blank" rel="noopener noreferrer" key={index} href={contactHref(contact) || undefined} className="group contact-div">
                            <h3 className="contact-label">{contact.label} </h3>
                            <p className="contact-data">{contact.value}</p>
                            <span className="dash">|</span>
                        </a>

                ))}
            </div>
        </div>
    );
}
