import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import ProfileForm from '../../components/ProfileForm';

export default function CompleteProfile() {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  // Redirect to login if no user
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

 
  const handleProfileSaved = () => {
    if (!user) return;
    switch (user.role) {
      case 'patient':
        navigate('/patient/dashboard');
        break;
      case 'doctor':
        navigate('/doctor/dashboard');
        break;
      case 'management':
        navigate('/management/dashboard');
        break;
      case 'admin':
        navigate('/admin/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <ProfileForm onSaveSuccess={handleProfileSaved} />
      </div>
    </div>
  );
}
