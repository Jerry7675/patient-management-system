import React from 'react';
import PrescriptionTable from './PrescriptionTable';

export default function HypertensionForm({ formData, onChange }) {
  return (
    <>
      <div>
        <label className="block font-semibold mb-1">Systolic Blood Pressure (mm Hg) *</label>
        <input
          type="number"
          name="systolicBP"
          value={formData.systolicBP || ''}
          onChange={onChange}
          required
          min={50}
          max={250}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="e.g. 140"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Diastolic Blood Pressure (mm Hg) *</label>
        <input
          type="number"
          name="diastolicBP"
          value={formData.diastolicBP || ''}
          onChange={onChange}
          required
          min={30}
          max={150}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="e.g. 90"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Heart Rate (bpm) *</label>
        <input
          type="number"
          name="heartRate"
          value={formData.heartRate || ''}
          onChange={onChange}
          required
          min={30}
          max={200}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="e.g. 75"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Duration of Hypertension (years) *</label>
        <input
          type="number"
          name="durationYears"
          value={formData.durationYears || ''}
          onChange={onChange}
          required
          min={0}
          max={100}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="e.g. 8"
        />
      </div>


      <div>
        <label className="block font-semibold mb-1">Associated Conditions (e.g. kidney disease, diabetes) *</label>
        <textarea
          name="associatedConditions"
          value={formData.associatedConditions || ''}
          onChange={onChange}
          required
          rows={3}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Mention any related conditions"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Lifestyle Recommendations *</label>
        <textarea
          name="lifestyleRecommendations"
          value={formData.lifestyleRecommendations || ''}
          onChange={onChange}
          required
          rows={3}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Diet, exercise, salt restriction, etc."
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
          placeholder="Any other relevant info"
        />
      </div>
    </>
  );
}
