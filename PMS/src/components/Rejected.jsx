import { Link } from 'react-router-dom';

export default function Rejected() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 px-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md text-center">
        <img
          src="./src/assets/logo.png"
          alt="Account Rejected"
          className="mx-auto w-24 h-24 mb-4"
        />
        <h2 className="text-xl font-bold text-red-700 mb-2">
          Account Rejected by Admin
        </h2>
        <p className="text-gray-600 mb-4">
          Unfortunately, your account request was rejected by the system admin.
          This could be due to incomplete profile details, invalid information, or other concerns.
        </p>

        <p className="text-sm text-gray-700 mb-4">
          If you believe this is a mistake or wish to inquire further, please contact us at:
          <br />
          <span className="font-medium text-indigo-600">CzAR.com</span>
        </p>

        <p className="text-xs text-gray-500 mb-4">
          Account reviews typically take 1–3 days. You may register again with updated details if needed.
        </p>

        <Link
          to="/"
          className="text-indigo-600 font-medium hover:underline"
        >
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}
