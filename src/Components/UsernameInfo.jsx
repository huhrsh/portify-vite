import { useRef, useEffect, useState } from "react"
import { useUser } from "../Context"
import { db } from "../Firebase"
import { toast } from "react-toastify"
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore"

const RESERVED = ['no-user', 'dashboard', 'sign-in', 'sign-up', 'admin-dashboard', 'forgot-password', 'api', 'assets'];
const DEFAULT_SECTIONS = { education: true, projects: true, experience: true, certifications: true, skills: true, contacts: true };
const SECTION_ORDER = ['education', 'projects', 'experience', 'certifications', 'skills', 'contacts'];

export default function UsernameInfo() {
    const usernameRef = useRef(null)
    const availabilityRequest = useRef(0);
    const { user, setUser, setLoading } = useUser()
    const [username, setUsername] = useState("")
    const [availability, setAvailability] = useState(null); // null | 'checking' | 'available' | 'taken' | 'reserved' | 'invalid' | 'same'
    const [selectedSections, setSelectedSections] = useState({
        education: true,
        experience: true,
        projects: true,
        certifications: true,
        skills: true,
        contacts: true
    });

    useEffect(() => {
        if (user) {
            setUsername(user.username ? user.username.toLowerCase() : "")
            const sortedSections = Object.fromEntries(
                Object.entries(user.selectedSections || DEFAULT_SECTIONS).sort(
                    ([sectionA], [sectionB]) => SECTION_ORDER.indexOf(sectionA) - SECTION_ORDER.indexOf(sectionB)
                )
            );
            setSelectedSections(sortedSections);
            // setSelectedSections(user.selectedSections ? user.selectedSections : selectedSections)
        }
    }, [user])


    const checkAvailability = async () => {
        const val = username.trim().toLowerCase();
        const request = ++availabilityRequest.current;
        if (!val) { setAvailability('invalid'); return; }
        if (val === user.username) { setAvailability('same'); return; }
        if (RESERVED.includes(val)) { setAvailability('reserved'); return; }
        const regex = /^[a-z0-9_-]+$/;
        if (!regex.test(val)) { setAvailability('invalid'); return; }
        setAvailability('checking');
        try {
            const q = query(collection(db, 'users'), where('username', '==', val));
            const snap = await getDocs(q);
            if (request === availabilityRequest.current) setAvailability(snap.empty ? 'available' : 'taken');
        } catch {
            if (request === availabilityRequest.current) {
                setAvailability(null);
                toast.error('Could not check availability. Please retry.');
            }
        }
    };

    const handleSectionCheckboxChange = (section) => {
        setSelectedSections(prevState => ({
            ...prevState,
            [section]: !prevState[section]
        }));
    };

    async function handleUsernameChange(e) {
        e.preventDefault();
        usernameRef.current?.blur()
        const value = username.trim().toLowerCase();
        if (!value) {
            toast.warn("Username cannot be blank.")
            return;
        }
        if (RESERVED.includes(value)) {
            toast.warn("That username is reserved. Please choose a different one.");
            return;
        }
        // console.log(user.selectedSections)
        // console.log(selectedSections)
        if (value === user.username && SECTION_ORDER.every(section => selectedSections[section] === user.selectedSections?.[section])) {
            toast.warn("No change detected.")
            return;
        }
        setLoading(true);
        const regex = /^[a-z0-9_-]+$/;

        if (regex.test(value)) {
            try {
                const userRef = collection(db, 'users');
                const userQuery = query(userRef, where('username', '==', value));
                const querySnapshot = await getDocs(userQuery);

                if (querySnapshot.empty) {
                    await updateDoc(doc(db, 'users', user.uid), {
                        username: value,
                        selectedSections: selectedSections
                    });
                    setUser(current => ({ ...current, username: value, selectedSections }))
                    // console.log("User updated");
                    toast.success("General section updated.")
                } else if (value === user.username) {
                    await updateDoc(doc(db, 'users', user.uid), {
                        // username: username,
                        selectedSections: selectedSections
                    });
                    setUser(current => ({ ...current, username: value, selectedSections }))
                    // console.log("User updated");
                    toast.success("General section updated.")
                } else {
                    toast.warn("Username already taken.");
                }
            } catch (error) {
                console.error('Error updating user:', error);
                toast.error('Failed to save general settings. Please retry.');
            }
        } else {
            toast.warn("Please enter a valid username.");
        }
        setLoading(false);
    }
    // console.log(user);
    return (
        <section className="font-[raleway] flex flex-col gap-4">
            <h2 className='text-purple-700 text-3xl max-sm:text-2xl font-bold'>Get yourself a unique username</h2>
            <div className="flex flex-col gap-2 pr-12 max-sm:pr-0 mb-2">
                <div className="flex gap-3 items-center">
                    <div className='border hover:shadow-lg focus-within:shadow-lg group p-3 py-0 rounded-xl transition-all duration-200 flex flex-1 gap-3 items-center'>
                        <label htmlFor="portfolio-username" className='text-purple-700 text-lg font-medium'>Username:</label>
                        <input
                            ref={usernameRef}
                            id="portfolio-username"
                            className='outline-none w-full min-w-0 h-full px-2 py-4 font-medium text-gray-600'
                            type='text'
                            placeholder='johnDoe'
                            onChange={e => { availabilityRequest.current++; setUsername(e.target.value); setAvailability(null); }}
                            value={username}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={checkAvailability}
                        disabled={availability === 'checking'}
                        className="flex-shrink-0 px-4 py-2.5 rounded-xl border border-purple-200 text-sm font-semibold text-purple-700 hover:bg-purple-50 transition-all duration-150 disabled:opacity-50"
                    >
                        {availability === 'checking' ? 'Checking…' : 'Check'}
                    </button>
                </div>

                {availability && availability !== 'checking' && (
                    <p className={`text-sm font-semibold px-1 ${
                        availability === 'available' ? 'text-emerald-600' :
                        availability === 'same'      ? 'text-sky-600' :
                        'text-rose-500'
                    }`}>
                        {availability === 'available' ? '✓ Username is available!' :
                         availability === 'taken'     ? '✗ Username is already taken.' :
                         availability === 'reserved'  ? '✗ That username is reserved.' :
                         availability === 'same'      ? '✓ This is your current username.' :
                         '✗ Invalid username — use only a-z, 0-9, - or _'}
                    </p>
                )}
            </div>
            <section className="shadow shadow-purple-200 border rounded-xl p-4 mr-12 max-sm:m-0 bg-purple-50">
                <h3 className="text-2xl max-sm:text-xl max-sm:mb-4 font-bold text-gray-600">Points to remember when choosing a username</h3>
                <ul>
                    <li className="list-disc ml-6 max-sm:ml-3 font-medium text-lg max-sm:text-base text-gray-700" >Username has to be unique, and gets displayed on your website URL.</li>
                    <li className="list-disc ml-6 max-sm:ml-3 font-medium text-lg max-sm:text-base text-gray-700" >Valid characters include: a-z, 0-9, -, _</li>
                    <li className="list-disc ml-6 max-sm:ml-3 font-medium text-lg max-sm:text-base text-gray-700" >You can create only one website per user</li>
                </ul>
            </section>
            <h2 className='text-purple-700 text-3xl max-sm:text-2xl font-bold mt-8'>Please select the sections you want to display.</h2>
            <div className="grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-3 gap-2 max-sm:mb-3">
                {Object.entries(selectedSections).map(([section, isSelected]) => (
                    <label key={section} className="flex items-center min-h-11 text-base font-medium text-gray-600 capitalize">
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSectionCheckboxChange(section)}
                            className="mr-2 py-2"
                        />
                        <span>{section}</span>
                    </label>
                ))}
            </div>
            <section className="shadow shadow-purple-200 border rounded-xl p-4 mr-12 max-sm:m-0 bg-purple-50">
                <h3 className="text-2xl max-sm:text-xl max-sm:mb-4 font-bold text-gray-600">Tips on selecting the right section</h3>
                <ul>
                    <li className="list-disc ml-6 font-medium text-lg max-sm:text-base max-sm:ml-3 text-gray-700" >Showcase the sections that you are confident about.</li>
                    <li className="list-disc ml-6 font-medium text-lg max-sm:text-base max-sm:ml-3 text-gray-700" >For example, if you don&apos;t have any work experience, do not select experience section.</li>
                    {/* <li className="list-disc ml-6 font-medium text-lg text-gray-700" >You can create only one website per user</li> */}
                </ul>
            </section>
            <button className="flex-shrink-0 bg-gradient-to-bl hover:shadow-lg hover:shadow-gray-300 duration-200 from-violet-500 to-purple-700 transition-all w-fit  px-3 py-2 text-lg font-medium rounded text-white " onClick={(e) => { handleUsernameChange(e) }}>Save Changes</button>

        </section>
    )
}
