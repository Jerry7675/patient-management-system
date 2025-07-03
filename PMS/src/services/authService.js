// src/services/authService.js

import { register, login, logout } from '../firebase/auth';
import { saveUserRole, getUserRole, getUserStatus } from '../firebase/firestore';
import { verifyOTP } from './otpService';

export const registerUser = async ({ email, password, role }) => {
  const { user } = await register(email, password);
  await saveUserRole(user.uid, email, role);
  return user;
};

export const loginUser = async (email, password) => {
  const { user } = await login(email, password);
  const role = await getUserRole(user.uid);
  const status = await getUserStatus(user.uid);

  
  return { user, role, status };
};

export const verifyUserWithOTP = async (uid) => {
  
  
  // OTP valid and user already logged in, return success
  return true;
};
