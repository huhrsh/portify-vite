import { useContext, createContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./Firebase";
import { doc, getDoc } from "firebase/firestore";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    useEffect(() => {
        setLoading(true);
        let requestId = 0;
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            const currentRequest = ++requestId;
            setLoading(true);
            setAuthError(null);
            try {
                let profile = null;
                if (firebaseUser) {
                    const docSnap = await getDoc(doc(db, "users", firebaseUser.uid));
                    if (docSnap.exists()) {
                        profile = { uid: firebaseUser.uid, ...docSnap.data() };
                    } else {
                        const adminDocSnap = await getDoc(doc(db, "admin", firebaseUser.uid));
                        if (adminDocSnap.exists()) profile = { uid: firebaseUser.uid, ...adminDocSnap.data(), admin: true };
                    }
                }
                if (currentRequest === requestId) setUser(profile);
            } catch {
                if (currentRequest === requestId) {
                    setUser(null);
                    setAuthError('Your account details could not be loaded. Check your connection and retry.');
                }
            } finally {
                if (currentRequest === requestId) setLoading(false);
            }
        });
        return () => { requestId++; unsubscribe(); };
    }, []);

    return (
        <UserContext.Provider value={{ loading, setLoading, user, setUser, authError }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
