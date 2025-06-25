import React from 'react';
import PrescriptionTable from './PrescriptionTable';

export default function RespiratoryForm({ formData, onChange }) {
  return (
    <>
      <div>
        <label className="block font-semibold mb-1">Respiratory Disease Diagnosed *</label>
        <select
          name="respiratoryDisease"
          value={formData.respiratoryDisease || ''}
          onChange={onChange}
          required
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="">-- Select Disease --</option>
          <option value="asthma">Asthma</option>
          <option value="bronchitis">Bronchitis</option>
          <option value="pneumonia">Pneumonia</option>
          <option value="copd">COPD</option>
          <option value="tuberculosis">Tuberculosis</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block font-semibold mb-1">Symptoms *</label>
        <textarea
          name="symptoms"
          value={formData.symptoms || ''}
          onChange={onChange}
          required
          rows={3}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Cough, shortness of breath, wheezing, chest pain, etc."
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Duration of Symptoms (days) *</label>
        <input
          type="number"
          name="symptomDuration"
          value={formData.symptomDuration || ''}
          onChange={onChange}
          required
          min={1}
          max={365}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Number of days"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Pulmonary Function Test (PFT) Results *</label>
        <textarea
          name="pftResults"
          value={formData.pftResults || ''}
          onChange={onChange}
          required
          rows={4}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="FEV1, FVC, FEV1/FVC ratio, etc."
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Chest X-Ray/CT Scan Findings *</label>
        <textarea
          name="imagingFindings"
          value={formData.imagingFindings || ''}
          onChange={onChange}
          required
          rows={4}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Summary of radiological findings"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Prescribed Medications *</label>
        <textarea
          name="medications"
          value={formData.medications || ''}
          onChange={onChange}
          required
          rows={3}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Inhalers, steroids, antibiotics, etc."
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Recommendations and Follow-up *</label>
        <textarea
          name="recommendations"
          value={formData.recommendations || ''}
          onChange={onChange}
          required
          rows={3}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Lifestyle advice, further tests, etc."
        />
      </div>
    </>
  );
}
