import React from 'react';
import PrescriptionTable from './PrescriptionTable';

export default function NeurologyForm({ formData, onChange }) {
  return (
    <>
      <div>
        <label className="block font-semibold mb-1">Neurological Diagnosis *</label>
        <input
          name="diagnosis"
          type="text"
          value={formData.diagnosis || ''}
          onChange={onChange}
          required
          placeholder="E.g., Migraine, Epilepsy, Parkinson’s Disease"
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Presenting Symptoms *</label>
        <textarea
          name="symptoms"
          value={formData.symptoms || ''}
          onChange={onChange}
          required
          rows={4}
          placeholder="Describe current neurological symptoms"
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Neurological Exam Findings *</label>
        <textarea
          name="examFindings"
          value={formData.examFindings || ''}
          onChange={onChange}
          required
          rows={4}
          placeholder="Details of neurological examination"
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Imaging & Test Reports (MRI, CT, EEG, etc.) *</label>
        <textarea
          name="imagingReports"
          value={formData.imagingReports || ''}
          onChange={onChange}
          required
          rows={4}
          placeholder="Summarize imaging and test results"
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Current Medications *</label>
        <textarea
          name="medications"
          value={formData.medications || ''}
          onChange={onChange}
          required
          rows={3}
          placeholder="List neurological medications prescribed"
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div>
       <PrescriptionTable formData={formData} onChange={onChange} />
      </div>

      <div>
        <label className="block font-semibold mb-1">Therapies and Rehabilitation *</label>
        <textarea
          name="therapies"
          value={formData.therapies || ''}
          onChange={onChange}
          required
          rows={4}
          placeholder="E.g., Physical therapy, Occupational therapy, Speech therapy"
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Follow-up Plan *</label>
        <textarea
          name="followUpPlan"
          value={formData.followUpPlan || ''}
          onChange={onChange}
          required
          rows={3}
          placeholder="Plan for future assessments and treatment"
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Doctor’s Notes *</label>
        <textarea
          name="doctorsNotes"
          value={formData.doctorsNotes || ''}
          onChange={onChange}
          required
          rows={3}
          placeholder="Additional observations or remarks"
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>
    </>
  );
}
