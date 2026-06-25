import { useContext, createContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./Firebase";
import { doc, getDoc } from "firebase/firestore";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const docSnap = await getDoc(doc(db, "users", firebaseUser.uid));
                if (docSnap.exists()) {
                    setUser({ uid: firebaseUser.uid, ...docSnap.data() });
                    setLoading(false);
                } else {
                    const adminDocSnap = await getDoc(doc(db, "admin", firebaseUser.uid));
                    if (adminDocSnap.exists()) {
                        setUser({ uid: firebaseUser.uid, ...adminDocSnap.data(), admin: true });
                        setLoading(false);
                    } else {
                        setUser(null);
                        setLoading(false);
                    }
                }
            } else {
                setUser(null);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <UserContext.Provider value={{ loading, setLoading, user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
