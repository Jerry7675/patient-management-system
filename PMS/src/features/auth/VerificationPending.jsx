import { Link } from 'react-router-dom';

export default function VerificationPending() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-50 px-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md text-center">
        <img
          src="/verification.svg"
          alt="Verification Pending"
          className="mx-auto w-24 h-24 mb-4"
        />
        <h2 className="text-xl font-bold text-yellow-700 mb-2">
          Your account is pending admin verification
        </h2>
        <p className="text-gray-600 mb-4">
          Once the admin verifies your account, you will be able to log in.
          Please check back later.
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
