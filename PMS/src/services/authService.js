import { register, login } from '../firebase/auth';
import { saveUserRole, getUserRole, isUserVerified } from '../firebase/firestore';

export const registerUser = async ({ email, password, role }) => {
  const { user } = await register(email, password);
  await saveUserRole(user.uid, email, role); // sets verified: false by default
  return user;
};

export const loginUser = async (email, password) => {
  const { user } = await login(email, password);
  const role = await getUserRole(user.uid);
  const verified = await isUserVerified(user.uid);
  return { user, role, verified };
};
