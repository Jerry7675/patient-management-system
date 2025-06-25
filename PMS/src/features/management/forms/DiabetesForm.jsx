import React from 'react';
import PrescriptionTable from './PrescriptionTable';

export default function DiabetesForm({ formData, onChange }) {
  return (
    <>
      <div>
        <label className="block font-semibold mb-1">Fasting Blood Sugar (mg/dL) *</label>
        <input
          type="number"
          name="fastingBloodSugar"
          value={formData.fastingBloodSugar || ''}
          onChange={onChange}
          required
          min={0}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="e.g. 110"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Postprandial Blood Sugar (mg/dL) *</label>
        <input
          type="number"
          name="postprandialBloodSugar"
          value={formData.postprandialBloodSugar || ''}
          onChange={onChange}
          required
          min={0}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="e.g. 160"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">HbA1c (%) *</label>
        <input
          type="number"
          name="hba1c"
          value={formData.hba1c || ''}
          onChange={onChange}
          required
          step="0.1"
          min={0}
          max={20}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="e.g. 7.2"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Duration of Diabetes (years) *</label>
        <input
          type="number"
          name="durationYears"
          value={formData.durationYears || ''}
          onChange={onChange}
          required
          min={0}
          max={100}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="e.g. 5"
        />
      </div>



      <div>
        <label className="block font-semibold mb-1">Complications (e.g. neuropathy, retinopathy) *</label>
        <textarea
          name="complications"
          value={formData.complications || ''}
          onChange={onChange}
          required
          rows={3}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Describe any diabetes-related complications"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Diet & Lifestyle Recommendations *</label>
        <textarea
          name="dietRecommendations"
          value={formData.dietRecommendations || ''}
          onChange={onChange}
          required
          rows={3}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Diet, exercise, lifestyle instructions"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Additional Notes *</label>
        <textarea
          name="notes"
          value={formData.notes || ''}
          onChange={onChange}
          required
          rows={2}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Any other relevant information"
        />
      </div>
    </>
  );
}
