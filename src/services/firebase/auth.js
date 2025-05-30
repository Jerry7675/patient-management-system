// src/services/firebase/auth.js
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from './config'

// Listen to authentication state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback)
}

// Get current user data from Firestore
export const getCurrentUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists()) {
      return { id: uid, ...userDoc.data() }
    }
    return null
  } catch (error) {
    console.error('Error getting user data:', error)
    throw error
  }
}

// Sign in user
export const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const userData = await getCurrentUserData(userCredential.user.uid)
    return { user: userCredential.user, userData }
  } catch (error) {
    console.error('Error signing in:', error)
    throw error
  }
}

// Sign out user
export const signOutUser = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

// Register new user
export const registerUser = async (userData) => {
  try {
    const { email, password, ...otherData } = userData
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update display name
    if (otherData.fullName) {
      await updateProfile(user, { displayName: otherData.fullName })
    }

    // Save user data to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      fullName: otherData.fullName,
      role: otherData.role,
      phone: otherData.phone || '',
      isVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...otherData
    })

    return { user, userData: { id: user.uid, ...otherData } }
  } catch (error) {
    console.error('Error registering user:', error)
    throw error
  }
}

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    console.error('Error sending password reset email:', error)
    throw error
  }
}

// Update user profile
export const updateUserProfile = async (uid, updateData) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...updateData,
      updatedAt: new Date().toISOString()
    })
    return await getCurrentUserData(uid)
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

// Verify user account (admin function)
export const verifyUserAccount = async (uid) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      isVerified: true,
      verifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error verifying user account:', error)
    throw error
  }
}