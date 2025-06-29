import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../firebase/firestore';
import { useAuthContext } from '../context/AuthContext';

export default function ProfileForm({ userUid: externalUid, redirectAfterSave = false }) {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const effectiveUid = user?.uid || externalUid;

  const [form, setForm] = useState({
    name: '',
    dob: '',
    phone: '',
    address: '',
    citizenshipNo: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!effectiveUid) {
        setLoading(false);
        return;
      }

      const profile = await getUserProfile(effectiveUid);
      if (profile) {
        setForm({
          name: profile.name || '',
          dob: profile.dob || '',
          phone: profile.phone || '',
          address: profile.address || '',
          citizenshipNo: profile.citizenshipNo || '',
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [effectiveUid]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!effectiveUid) {
      setMessage('❌ No user ID available. Cannot save profile.');
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile(effectiveUid, form);
      setMessage('✅ Profile updated successfully!');

      if (redirectAfterSave) {
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-indigo-600 font-medium">
        Loading profile...
      </div>
    );
  }

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
          disabled={saving}
          className="bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
