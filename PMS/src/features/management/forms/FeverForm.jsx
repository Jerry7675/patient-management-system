import React from 'react';
import PrescriptionTable from './PrescriptionTable';

export default function FeverForm({ formData, onChange }) {
  return (
    <>
      <div>
        <label className="block font-semibold mb-1">Duration of Fever (days) *</label>
        <input
          type="number"
          name="durationDays"
          value={formData.durationDays || ''}
          onChange={onChange}
          required
          min={1}
          max={365}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Number of days"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Maximum Temperature Recorded (°C) *</label>
        <input
          type="number"
          step="0.1"
          name="maxTemperature"
          value={formData.maxTemperature || ''}
          onChange={onChange}
          required
          min={35}
          max={45}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="e.g. 39.5"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Associated Symptoms *</label>
        <textarea
          name="symptoms"
          value={formData.symptoms || ''}
          onChange={onChange}
          required
          rows={3}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Cough, chills, sweating, headache, etc."
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Laboratory Test Reports *</label>
        <textarea
          name="labReports"
          value={formData.labReports || ''}
          onChange={onChange}
          required
          rows={4}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Blood test, cultures, imaging findings, etc."
        />
      </div>

      

      <div>
        <label className="block font-semibold mb-1">Recommended Follow-up Actions *</label>
        <textarea
          name="followUp"
          value={formData.followUp || ''}
          onChange={onChange}
          required
          rows={3}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Additional tests, monitoring"
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
          placeholder="Other relevant information"
        />
      </div>
    </>
  );
}
