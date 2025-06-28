import { register, login, logout } from '../firebase/auth';
import { saveUserRole, getUserRole, getUserStatus } from '../firebase/firestore';
import { sendOTP } from './otpService';

export const registerUser = async ({ email, password, role }) => {
  const { user } = await register(email, password);
  await saveUserRole(user.uid, email, role); // sets status: 'pending' by default
  return user;
};

export const loginUser = async (email, password) => {
  const { user } = await login(email, password);
  const role = await getUserRole(user.uid);
  const status = await getUserStatus(user.uid);
  
  // For verified users, we'll send OTP but not complete login yet
  if (status === 'verified') {
    await logout(); // Don't stay logged in yet
    await sendOTP(email, user.uid);
  }
  
  return { user, role, status };
};

export const verifyUserWithOTP = async (uid, otp) => {
  // This would use your existing OTP verification service
  const isValid = await verifyOTP(uid, otp);
  if (!isValid) throw new Error('Invalid OTP');
  
  // Re-authenticate the user
  const { user } = await login(email, password); // You'll need to handle this
  return { user };
};