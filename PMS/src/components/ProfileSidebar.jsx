// src/components/ProfileSidebar.jsx
import { useState } from 'react';
import ProfileForm from './ProfileForm';
import { X } from 'lucide-react'; // Optional: you can use another icon or SVG

export default function ProfileSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Button to open sidebar */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
      >
        Profile
      </button>

      {/* Overlay + Sidebar */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      ></div>

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-lg z-50 transform transition-transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Close button */}
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-lg font-semibold text-indigo-600">Your Profile</h2>
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-red-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Profile form */}
        <div className="p-4 overflow-y-auto h-full">
          <ProfileForm />
        </div>
      </div>
    </>
  );
}
