// src/components/ProfileForm.jsx
import { useEffect, useState } from 'react';
import { getUserProfile, updateUserProfile } from '../firebase/firestore';
import { useAuthContext } from '../context/AuthContext';

export default function ProfileForm() {
  const { user } = useAuthContext();
  const [form, setForm] = useState({
    name: '',
    dob: '',
    phone: '',
    address: '',
    citizenshipNo: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

useEffect(() => {
  const fetchProfile = async () => {
    if (!user) return;
    const profile = await getUserProfile(user.uid);
    if (profile) {
      setForm({
        name: profile.name || '',
        dob: profile.dob || '',
        phone: profile.phone || '',
        address: profile.address || '',
        citizenshipNo: profile.citizenshipNo || '',
      });
    }
  };
  fetchProfile();
}, [user]);

const handleChange = (e) => {
  setForm({ ...form, [e.target.name]: e.target.value });
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserProfile(user.uid, form);
      setMessage('✅ Profile updated successfully!');
     
    } catch (err) {
      setMessage('❌ Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md w-full max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-indigo-600">User Profile</h2>

      {message && <p className="mb-2 text-sm text-center">{message}</p>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
          required
        />

        <input
          type="date"
          name="dob"
          placeholder="Date of Birth"
          value={form.dob}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
          required
        />

        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
          required
        />

        <input
          type="text"
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
          required
        />

        <input
          type="text"
          name="citizenshipNo"
          placeholder="Citizenship Number"
          value={form.citizenshipNo}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
