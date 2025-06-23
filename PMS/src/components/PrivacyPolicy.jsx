import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-3xl font-bold text-indigo-600 mb-4">Privacy Policy</h1>
        <p className="text-sm text-gray-600 mb-6">Last updated: June 23, 2025</p>

        <div className="space-y-5 text-gray-700 text-sm leading-relaxed">
          <p>
            We are committed to protecting your personal information. This policy explains how we
            collect, use, and safeguard your data when you use our Patient Management System.
          </p>

          <h2 className="text-lg font-semibold text-indigo-700">Information We Collect</h2>
          <ul className="list-disc pl-5">
            <li>Your name, email, address, phone number, and citizenship number</li>
            <li>Health-related records entered by authorized personnel</li>
            <li>Usage and access data for security and analytics</li>
          </ul>

          <h2 className="text-lg font-semibold text-indigo-700">How We Use Your Information</h2>
          <ul className="list-disc pl-5">
            <li>To provide personalized health management services</li>
            <li>To verify your identity and protect your data</li>
            <li>To contact you with important updates or security notices</li>
          </ul>

          <h2 className="text-lg font-semibold text-indigo-700">Data Sharing & Security</h2>
          <p>
            Your information is shared only with authorized roles such as doctors and management
            when necessary. We implement strict security protocols and do not share your data
            with third parties without your consent.
          </p>

          <h2 className="text-lg font-semibold text-indigo-700">Your Rights</h2>
          <p>
            You have the right to request access, correction, or deletion of your personal data.
            Contact us at <span className="text-indigo-600 font-medium">CzAR@gmail.com</span>.
          </p>

          <h2 className="text-lg font-semibold text-indigo-700">Changes to Policy</h2>
          <p>
            We may update this policy occasionally. Changes will be reflected on this page with a
            new date. Continued use of the system indicates acceptance.
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-indigo-600 hover:underline font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
