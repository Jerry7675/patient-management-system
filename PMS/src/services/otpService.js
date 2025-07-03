import emailjs from '@emailjs/browser';
import { db } from '../firebase/config'; 
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

// Initialize EmailJS with your actual credentials
const emailjsConfig = {
  serviceId: 'service_6hebjro',
  templateId: 'template_ayfu3mn',
  publicKey: 'D4yxLK0hIfEMCRWfQ'
};

emailjs.init(emailjsConfig.publicKey);

export const sendOTP = async (email, userId) => {
  // Validate inputs
  if (!email || !userId) {
    throw new Error('Email and User ID are required');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Timestamp.fromDate(new Date(Date.now() + 10 * 60 * 1000)); // 10 min expiry

  try {
    // Create document reference - IMPORTANT: Use doc() with db
     
    const otpDocRef = doc(db, 'otps', userId);
    
    await setDoc(otpDocRef, {
      otp,
      email,
      expiresAt,
      attempts: 0,
      createdAt: Timestamp.now()
    });
     
    // Send email
    await emailjs.send(
      emailjsConfig.serviceId,
      emailjsConfig.templateId,
      {
        email: email,
        otp_code: otp,
      }
    );

    return true;
  } catch (error) {
    console.error('Failed to send OTP:', error);
    throw new Error('Failed to send OTP. Please try again later.');
  }
};

export const verifyOTP = async (userId, userEnteredOtp) => {
  if (!userId || !userEnteredOtp) {
    throw new Error('User ID and OTP are required');
  }

  try {
    const otpDocRef = doc(db, 'otps', userId);
    const otpSnapshot = await getDoc(otpDocRef);

    if (!otpSnapshot.exists()) {
     
      throw new Error('OTP not found or expired');
    }

    const otpData = otpSnapshot.data();

   

    if (otpData.expiresAt.toDate() < new Date()) {
      await deleteDoc(otpDocRef);
      throw new Error('OTP has expired');
    }

    if (otpData.attempts >= 3) {
      await deleteDoc(otpDocRef);
      throw new Error('Too many failed attempts');
    }

    if (otpData.otp !== userEnteredOtp.trim()) {
      await setDoc(otpDocRef, { attempts: otpData.attempts + 1 }, { merge: true });
      throw new Error('Invalid OTP');
    }

    // ✅ Success
    await deleteDoc(otpDocRef);
    return true;

  } catch (error) {
    console.error('OTP verification failed:', error);
    throw error;
  }
};
