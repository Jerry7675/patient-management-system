import { register, login } from '../firebase/auth';
import { saveUserRole, getUserRole, getUserStatus } from '../firebase/firestore';

export const registerUser = async ({ email, password, role }) => {
  const { user } = await register(email, password);
  await saveUserRole(user.uid, email, role); // sets status: 'pending' by default
  return user;
};

export const loginUser = async (email, password) => {
  const { user } = await login(email, password);
  const role = await getUserRole(user.uid);
  const status = await getUserStatus(user.uid); // 'pending', 'verified', 'rejected'
  return { user, role, status };
};
