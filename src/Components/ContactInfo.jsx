import { useEffect, useState } from "react";
import { db } from "../Firebase";
import { useUser } from "../Context";
import { toast } from "react-toastify";
import { doc, updateDoc } from "firebase/firestore";
import { updateRecord } from '../editorData';
import { contactHref } from '../profileLinks';

export default function ContactInfo() {
    const { user, setUser, setLoading } = useUser();
    const [contacts, setContacts] = useState([]);

    useEffect(() => {
        if (user && user.contacts) {
            setContacts(user.contacts);
        } else {
            setContacts([
                { label: "Phone", value: "" },
                { label: "Email", value: "" }
            ]);
        }
    }, [user]);

    const handleContactChange = (index, field, value) => {
        setContacts(updateRecord(contacts, index, { [field]: value }));
    };

    const addContact = () => {
        setContacts([...contacts, { label: "", value: "" }]);
    };

    const removeContact = (index) => {
        const newContacts = contacts.filter((_, i) => i !== index);
        setContacts(newContacts);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const populated = contacts.filter(contact => contact.value.trim()).map(contact => ({ label: contact.label.trim(), value: contact.value.trim() }));
        if (populated.some(contact => !contact.label || !contactHref(contact))) {
            toast.error('Check your contact labels, email, phone number and website URLs.');
            return;
        }
        setLoading(true);

        try {
            await updateDoc(doc(db, 'users', user.uid), { contacts: populated });
            setContacts(populated);
            setUser(current => ({ ...current, contacts: populated }));
            toast.success("Contact information updated.");
        } catch (error) {
            console.error("Error saving contact information:", error);
            toast.error("Failed to save contact information.");
        }

        setLoading(false);
    };

    return (
        <section className="font-[raleway] flex flex-col gap-4">
            <h2 className="text-purple-700 text-3xl font-bold max-sm:text-2xl">How do we connect with you?</h2>
            <form className="flex flex-col gap-4" onSubmit={handleFormSubmit}>
                {contacts.map((contact, index) => (
                    <div key={index} className="flex flex-col gap-4 border p-4 rounded shadow">
                        <div className="flex justify-between items-center">
                            <h3 className="text-purple-700 text-lg font-bold">Contact {index + 1}</h3>
                            {(
                                <button
                                    type="button"
                                    onClick={() => removeContact(index)}
                                    className="rounded text-rose-600 text-lg font-medium px-3 py-0.5 transition-all duration-200 hover:text-white hover:shadow hover:bg-rose-600"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                        <div className='border hover:shadow-lg focus-within:shadow-lg group p-3 py-0 rounded-xl transition-all duration-200 flex w-full gap-3 items-center'>
                            <label htmlFor={`contact-label-${index}`} className='text-purple-700 text-lg font-medium'>Label:</label>
                            <input
                                type="text"
                                id={`contact-label-${index}`}
                                value={contact.label}
                                placeholder="Phone"
                                onChange={(e) => handleContactChange(index, "label", e.target.value)}
                                className="outline-none w-full bg-white h-full px-2 py-4 font-medium text-gray-600"
                            />
                        </div>
                        <div className='border hover:shadow-lg focus-within:shadow-lg group p-3 py-0 rounded-xl transition-all duration-200 flex w-full gap-3 items-center'>
                            <label htmlFor={`contact-value-${index}`} className='text-purple-700 text-lg font-medium'>Value:</label>
                            <input
                                type="text"
                                id={`contact-value-${index}`}
                                value={contact.value}
                                placeholder="1234567890"
                                onChange={(e) => handleContactChange(index, "value", e.target.value)}
                                className="outline-none w-full h-full px-2 py-4 font-medium text-gray-600"
                            />
                        </div>
                    </div>
                ))}
                <div className="flex justify-between">
                    <button
                        type="button"
                        onClick={addContact}
                        className="bg-gradient-to-bl from-violet-500 to-purple-700 text-white font-medium py-2 px-4 rounded hover:shadow-lg transition-all"
                    >
                        Add Contact
                    </button>
                    <button
                        type="submit"
                        className="bg-gradient-to-bl from-violet-500 to-purple-700 text-white font-medium py-2 px-4 rounded hover:shadow-lg transition-all"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </section>
    );
}
