import React, { useEffect, useState } from 'react';
import CommonFormFields from './CommonFormFields';
import FeverForm from './FeverForm';
import DiabetesForm from './DiabetesForm';
import CardiacForm from './CardiacForm';
import NeurologyForm from './NeuroForm';
import PrescriptionTable from './PrescriptionTable';
import AllergiesForm from './AllergiesForm';
import RespiratoryForm from './RespiratoryForm';
import HypertensionForm from './HypertensionForm';
import KidneyDiseaseForm from './KidneyDiseaseForm';

export default function DiseaseFormSelector({ type, onSubmit, patient }) {
  const [formData, setFormData] = useState({});
  const [prescription, setPrescription] = useState([]);

useEffect(() => {
  // Reset both form data and prescriptions when type changes
  setFormData({ disease: type }); 
  setPrescription([]);
}, [type]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!patient) {
      alert('Please select a patient first.');
      return;
    }

    const finalData = {
      ...formData,
      prescription,
      disease: type,
      patientUid: patient.uid,
      patientEmail: patient.email,
    };

    onSubmit(finalData);
  };

  const renderDiseaseForm = () => {
    switch (type) {
      case 'diabetes':
        return <DiabetesForm formData={formData} onChange={handleChange} />;
      case 'fever':
        return <FeverForm formData={formData} onChange={handleChange} />;
      case 'cardiac':
        return <CardiacForm formData={formData} onChange={handleChange} />;
      case 'neurology':
        return <NeurologyForm formData={formData} onChange={handleChange} />;
      case 'allergies':
        return <AllergiesForm formData={formData} onChange={handleChange} />;
      case 'respiratory':
        return <RespiratoryForm formData={formData} onChange={handleChange} />;
      case 'hypertension':
        return <HypertensionForm formData={formData} onChange={handleChange} />;
      case 'kidneyDisease':
        return <KidneyDiseaseForm formData={formData} onChange={handleChange} />;
      default:
        return <p className="text-red-500">Select a valid disease form.</p>;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <CommonFormFields formData={formData} setFormData={setFormData} />
      {renderDiseaseForm()}

      <div>
        <h3 className="font-semibold">Prescription</h3>
        <PrescriptionTable
          prescription={prescription}
          setPrescription={setPrescription}
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Submit Record
      </button>
    </form>
  );
}
