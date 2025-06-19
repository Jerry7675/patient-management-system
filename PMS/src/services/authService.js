// src/services/authService.js
import { register, login } from '../firebase/auth';
import { saveUserRole, getUserRole } from '../firebase/firestore';

export const registerUser = async ({ email, password, role }) => {
  const { user } = await register(email, password);
  await saveUserRole(user.uid, email, role);
  return user;
};

export const loginUser = async (email, password) => {
  const { user } = await login(email, password);
  const role = await getUserRole(user.uid);
  return { user, role };
};
