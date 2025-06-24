import React from 'react';
import PrescriptionTable from './PrescriptionTable';

export default function KidneyDiseaseForm({ formData, onChange }) {
  return (
    <>
      <div>
        <label className="block font-semibold mb-1">Kidney Disease Diagnosed *</label>
        <select
          name="kidneyDisease"
          value={formData.kidneyDisease || ''}
          onChange={onChange}
          required
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="">-- Select Disease --</option>
          <option value="chronic kidney disease">Chronic Kidney Disease (CKD)</option>
          <option value="acute kidney injury">Acute Kidney Injury (AKI)</option>
          <option value="glomerulonephritis">Glomerulonephritis</option>
          <option value="polycystic kidney disease">Polycystic Kidney Disease</option>
          <option value="kidney stones">Kidney Stones</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block font-semibold mb-1">Serum Creatinine (mg/dL) *</label>
        <input
          type="number"
          name="serumCreatinine"
          value={formData.serumCreatinine || ''}
          onChange={onChange}
          required
          step="0.01"
          min="0"
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="e.g. 1.2"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Blood Urea Nitrogen (BUN) (mg/dL) *</label>
        <input
          type="number"
          name="bun"
          value={formData.bun || ''}
          onChange={onChange}
          required
          step="0.1"
          min="0"
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="e.g. 15"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Estimated Glomerular Filtration Rate (eGFR) (mL/min/1.73m²) *</label>
        <input
          type="number"
          name="egfr"
          value={formData.egfr || ''}
          onChange={onChange}
          required
          step="0.1"
          min="0"
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="e.g. 60"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Urinalysis Results *</label>
        <textarea
          name="urinalysisResults"
          value={formData.urinalysisResults || ''}
          onChange={onChange}
          required
          rows={4}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Proteinuria, hematuria, casts etc."
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Kidney Ultrasound Findings *</label>
        <textarea
          name="kidneyUltrasound"
          value={formData.kidneyUltrasound || ''}
          onChange={onChange}
          required
          rows={4}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Size, structure, cysts, stones"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Medications *</label>
        <textarea
          name="medications"
          value={formData.medications || ''}
          onChange={onChange}
          required
          rows={3}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Drug names, doses"
        />
      </div>

      <div>
       <PrescriptionTable formData={formData} onChange={onChange} />
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
          placeholder="Diet, lifestyle, next tests"
        />
      </div>
    </>
  );
}
