// src/components/ProfileSidebar.jsx
import { useState } from 'react';
import ProfileForm from './ProfileForm';
import { X } from 'lucide-react';

export default function ProfileSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Button to open sidebar - unchanged */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
      >
        Profile
      </button>

      {/* Overlay with transparent background */}
      <div
        className={`fixed inset-0 z-40 transition-opacity ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Sidebar with glass-like effect */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md z-50 transform transition-transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="relative h-full">
          {/* Glass panel container */}
          <div className="absolute inset-0 bg-white bg-opacity-90 backdrop-blur-sm border-l border-gray-200 shadow-lg">
            {/* Close button and header */}
            <div className="flex justify-between items-center px-4 py-3 border-b">
              <h2 className="text-lg font-semibold text-indigo-600">Your Profile</h2>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-gray-500 hover:text-red-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Profile form */}
            <div className="p-4 overflow-y-auto h-[calc(100%-56px)]">
              <ProfileForm />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}