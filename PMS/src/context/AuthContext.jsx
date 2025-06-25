import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import auth from '../firebase/auth';
import { getUserRole, getUserProfile } from '../firebase/firestore'; // Make sure this function exists

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [profile, setProfile] = useState(null); // <-- NEW: for doctor name, phone, etc.
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const fetchedRole = await getUserRole(firebaseUser.uid);
      const fetchedProfile = await getUserProfile(firebaseUser.uid); // <- fetch profile
      setUser({ ...firebaseUser, profile: fetchedProfile }); // <- attach profile here
      setRole(fetchedRole);
      setProfile(fetchedProfile); 
    } else {
      setUser(null);
      setRole(null);
    }
    setLoading(false);
  });
  return () => unsubscribe();
}, []);


  return (
    <AuthContext.Provider value={{ user, role, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
