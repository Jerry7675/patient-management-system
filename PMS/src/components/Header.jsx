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
    <header className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md py-4 px-6 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <img src={logo} alt="PMS Logo" className="h-12 w-15" />
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-blue-700">Patient Management System</h1>
      </div>

      <nav className="flex items-center gap-4">
        {role && (
          <span className="text-x bg-gradient-to-r from-red-200 to-orange-400 text-indigo-700 px-3 py-1 rounded-full capitalize">
            {role}
          </span>
        )}
        {user ? (
          <button
            onClick={handleLogout}
            className="text-x bg-gradient-to-r from-red-200 to-orange-400 text-indigo-600 font-semibold px-4 py-2 rounded hover:bg-gray-100"
          >
            Logout
          </button>
        ) : (
          <Link
            to="/"
            className="bg-white text-indigo-600 font-semibold px-4 py-2 rounded hover:bg-gray-100"
          >
            /
          </Link>
        )}
      </nav>
    </header>
  );
}