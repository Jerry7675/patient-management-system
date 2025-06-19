// src/components/Modal.jsx
import React from 'react';

export default function Modal({ isOpen, title, children, onClose, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-gray-600 hover:text-gray-900"
          >
            &#x2715;
          </button>
        </div>
        <div className="mb-6">
          {children}
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-700"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
