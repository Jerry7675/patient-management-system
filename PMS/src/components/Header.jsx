// src/components/Header.jsx
import { Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { logout } from '../firebase/auth';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png'; 

export default function Header() {
  const { user, role } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-indigo-600 text-white shadow-md py-4 px-6 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <img src={logo} alt="PMS Logo" className="h-12 w-15" />
        <h1 className="text-xl font-bold">Patient Management System</h1>
      </div>

      <nav className="flex items-center gap-4">
        {role && (
          <span className="text-sm bg-white text-indigo-700 px-3 py-1 rounded-full capitalize">
            {role}
          </span>
        )}
        {user ? (
          <button
            onClick={handleLogout}
            className="bg-white text-indigo-600 font-semibold px-4 py-2 rounded hover:bg-gray-100"
          >
            Logout
          </button>
        ) : (
          <Link
            to="/"
            className="bg-white text-indigo-600 font-semibold px-4 py-2 rounded hover:bg-gray-100"
          >
            
          </Link>
        )}
      </nav>
    </header>
  );
}