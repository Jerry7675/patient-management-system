import React from 'react';
import PrescriptionTable from './PrescriptionTable';

export default function CardiovascularForm({ formData, onChange }) {
  return (
    <>
      <div>
        <label className="block font-semibold mb-1">Cardiovascular Disease Diagnosed *</label>
        <select
          name="cardioDisease"
          value={formData.cardioDisease || ''}
          onChange={onChange}
          required
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="">-- Select Disease --</option>
          <option value="hypertension">Hypertension</option>
          <option value="coronary artery disease">Coronary Artery Disease</option>
          <option value="heart failure">Heart Failure</option>
          <option value="arrhythmia">Arrhythmia</option>
          <option value="stroke">Stroke</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block font-semibold mb-1">Blood Pressure (Systolic/Diastolic mmHg) *</label>
        <input
          type="text"
          name="bloodPressure"
          value={formData.bloodPressure || ''}
          onChange={onChange}
          required
          placeholder="e.g., 120/80"
          className="w-full border border-gray-300 rounded px-3 py-2"
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
          placeholder="Beats per minute"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">ECG/EKG Results *</label>
        <textarea
          name="ecgResults"
          value={formData.ecgResults || ''}
          onChange={onChange}
          required
          rows={4}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Summary of ECG/EKG findings"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Cholesterol Levels (mg/dL) *</label>
        <input
          type="text"
          name="cholesterolLevels"
          value={formData.cholesterolLevels || ''}
          onChange={onChange}
          required
          placeholder="Total, LDL, HDL"
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Echocardiogram Findings *</label>
        <textarea
          name="echoFindings"
          value={formData.echoFindings || ''}
          onChange={onChange}
          required
          rows={4}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Summary of echocardiogram results"
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
          placeholder="Include drug names and doses"
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
          placeholder="Lifestyle advice, tests, referrals"
        />
      </div>
    </>
  );
}
