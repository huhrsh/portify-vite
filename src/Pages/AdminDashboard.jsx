
import { useState, useEffect } from "react";
import { db } from "../Firebase";
import { useUser } from "../Context";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import UserDetails from "./UserDetails";

export default function AdminDashboard() {
    const { user, loading, setLoading } = useUser();
    const [pendingUsers, setPendingUsers] = useState([]);
    const navigate = useNavigate()
    const [selectedUser, setSelectedUser] = useState()
    
    
    useEffect(()=>{
        window.scrollTo(0, 0);
    },[])

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            if (user) {
                if (user.admin) {
                    try {
                        const q = query(collection(db, 'users'), where('websiteStatus', '==', 'pending'));
                        const snapshot = await getDocs(q);
                        const pendingUsersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                        setPendingUsers(pendingUsersData);
                    } catch {
                        toast.error("Error fetching pending users.");
                    }
                } else {
                    toast.error("Access denied.");
                    navigate('/');
                }
            }
            setLoading(false);
        };

        fetchData();
    }, [user, navigate, setLoading]);


    const handleApprove = async (userId) => {
        try {
            await updateDoc(doc(db, 'users', userId), {
                websiteStatus: 'active'
            })
            const updatedPendingUsers = pendingUsers.filter((user) => user.id !== userId);
            setPendingUsers(updatedPendingUsers);
        } catch {
            toast.error("Error approving user.");
        }
    };

    const handleReject = async (userId) => {
        try {
            await updateDoc(doc(db, 'users', userId), {
                websiteStatus: 'inactive'
            })
            const updatedPendingUsers = pendingUsers.filter((user) => user.id !== userId);
            setPendingUsers(updatedPendingUsers);
        } catch {
            toast.error("Error rejecting user.");
        }
    };

    const handleUserClick = (user) => {
        setSelectedUser(user)
    };

    return (
        <>
            <div className="p-4 px-12 font-[raleway] max-sm:px-6">
                <h2 className="text-purple-700 text-2xl font-bold mb-4">Pending Users</h2>
                <div className="grid grid-cols-2 max-sm:grid-cols-1 grid-flow-row">
                    {pendingUsers.map((user) => (
                        <div key={user.id} className="border rounded-md p-4 mb-4">
                            <h3 className="text-xl font-bold text-purple-700">{user.name}</h3>
                            <div className="flex gap-2 text-lg text-gray-600 font-medium">
                                <h3 className="text-purple-700 text-lg font-semibold">Email:</h3>
                                {user.email}</div>
                            <div className="flex gap-2 text-lg text-gray-600 font-medium">
                                <h3 className="text-purple-700 text-lg font-semibold">Username:</h3>
                                {user.username}</div>
                            <div className="mt-4">
                                <button onClick={() => handleApprove(user.id)} className="bg-lime-500 text-white font-medium py-2 px-4 mr-4 rounded outline-none focus:shadow-outline transition-all  duration-200">
                                    Approve
                                </button>
                                <button onClick={() => handleReject(user.id)} className="bg-rose-500  text-white font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-200">
                                    Reject
                                </button>
                                <button onClick={() => handleUserClick(user)} className="text-blue-500 hover:underline ml-4 cursor-pointer">View Details</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {selectedUser && <UserDetails userDetails={selectedUser} setSelectedUser={setSelectedUser}/>}
        </>
    );
}
