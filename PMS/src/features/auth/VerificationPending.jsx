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

        <p className="text-gray-700 mb-3">
          Thank you for registering! Your account has been created but is currently awaiting admin approval.
        </p>

        <p className="text-gray-700 mb-3">
          This process typically takes <span className="font-semibold">1 to 3 days</span>. If there is any issue or delay,
          it may be due to incomplete or incorrect details.
        </p>

        <p className="text-gray-700 mb-4">
          If you believe this is a mistake or need assistance, please <span className="font-semibold">contact us</span> at:<br />
          <a href="mailto:support@yourdomain.com" className="text-indigo-600 underline">CzAR@gmail.com</a>
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
