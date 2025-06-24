// src/components/forms/CommonFormFields.jsx

import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import db from '../../../firebase/firestore';

export default function CommonFormFields({ formData, setFormData }) {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      const usersCol = collection(db, 'users');
      const snapshot = await getDocs(usersCol);
      const doctorList = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.role === 'doctor') {
          doctorList.push({ name: data.profile?.name || '', phone: data.profile?.phone || '' });
        }
      });
      setDoctors(doctorList);
    };

    fetchDoctors();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDoctorSelect = (doctor) => {
    setFormData({ ...formData, doctorName: doctor.name, doctorPhone: doctor.phone });
    setSearchTerm('');
  };

  const filteredDoctors = doctors.filter((doc) =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-semibold">Search Doctor</label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Type to search doctor name"
          className="border px-2 py-1 rounded w-full"
        />
        {searchTerm && (
          <ul className="border rounded mt-1 max-h-40 overflow-y-auto bg-white z-10 relative">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor, idx) => (
                <li
                  key={idx}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleDoctorSelect(doctor)}
                >
                  {doctor.name} ({doctor.phone})
                </li>
              ))
            ) : (
              <li className="p-2 text-gray-500">No doctors found</li>
            )}
          </ul>
        )}
      </div>

      <div>
        <label className="block font-semibold">Doctor Name</label>
        <input
          name="doctorName"
          value={formData.doctorName || ''}
          onChange={handleChange}
          className="border px-2 py-1 rounded w-full"
          required
          readOnly
        />
      </div>

      <div>
        <label className="block font-semibold">Doctor Phone</label>
        <input
          name="doctorPhone"
          value={formData.doctorPhone || ''}
          onChange={handleChange}
          className="border px-2 py-1 rounded w-full"
          required
          readOnly
        />
      </div>

      <div>
        <label className="block font-semibold">Patient Name</label>
        <input
          name="patientName"
          value={formData.patientName || ''}
          onChange={handleChange}
          className="border px-2 py-1 rounded w-full"
          required
        />
      </div>
    </div>
  );
}
