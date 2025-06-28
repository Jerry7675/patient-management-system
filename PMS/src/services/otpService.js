import emailjs from '@emailjs/browser';
import  db  from '../firebase/config'; // Your Firebase config
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

// Initialize EmailJS
emailjs.init(process.env.VITE_EMAILJS_PUBLIC_KEY);

export const sendOTP = async (email, userId) => {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Timestamp.fromDate(new Date(Date.now() + 5 * 60 * 1000)); // 5 minutes expiry

  try {
    // Store OTP in Firestore
    await setDoc(doc(db, 'otps', userId), {
      otp,
      email,
      expiresAt,
      attempts: 0
    });

    // Send OTP via EmailJS
    await emailjs.send(
      process.env.VITE_EMAILJS_SERVICE_ID,
      process.env.VITE_EMAILJS_TEMPLATE_ID,
      {
        to_email: email,
        otp_code: otp,
      }
    );

    return true;
  } catch (error) {
    console.error('OTP Error:', error);
    throw new Error('Failed to send OTP');
  }
};

export const verifyOTP = async (userId, userEnteredOtp) => {
  try {
    const otpRef = doc(db, 'otps', userId);
    const otpSnap = await getDoc(otpRef);

    if (!otpSnap.exists()) {
      throw new Error('OTP expired or not found');
    }

    const otpData = otpSnap.data();

    // Check if OTP is expired
    if (otpData.expiresAt.toDate() < new Date()) {
      await deleteDoc(otpRef);
      throw new Error('OTP expired');
    }

    // Check attempt limit (optional security measure)
    if (otpData.attempts >= 3) {
      await deleteDoc(otpRef);
      throw new Error('Too many attempts');
    }

    // Increment attempts
    await setDoc(otpRef, { attempts: otpData.attempts + 1 }, { merge: true });

    // Verify OTP
    if (otpData.otp !== userEnteredOtp) {
      throw new Error('Invalid OTP');
    }

    // OTP is valid - delete it
    await deleteDoc(otpRef);
    return true;
  } catch (error) {
    console.error('OTP Verification Error:', error);
    throw error;
  }
};