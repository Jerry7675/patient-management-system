import React from 'react';
import PrescriptionTable from './PrescriptionTable';

export default function AllergiesForm({ formData, onChange }) {
  return (
    <>
      <div>
        <label className="block font-semibold mb-1">Allergy Type *</label>
        <select
          name="allergyType"
          value={formData.allergyType || ''}
          onChange={onChange}
          required
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="">-- Select Allergy Type --</option>
          <option value="food">Food Allergy</option>
          <option value="drug">Drug Allergy</option>
          <option value="environmental">Environmental Allergy (e.g., pollen, dust)</option>
          <option value="insect">Insect Sting Allergy</option>
          <option value="latex">Latex Allergy</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block font-semibold mb-1">Allergy Triggers (List all known triggers) *</label>
        <textarea
          name="allergyTriggers"
          value={formData.allergyTriggers || ''}
          onChange={onChange}
          required
          rows={3}
          placeholder="e.g. peanuts, penicillin, pollen, bee sting"
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Severity of Reactions *</label>
        <select
          name="severity"
          value={formData.severity || ''}
          onChange={onChange}
          required
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="">-- Select Severity --</option>
          <option value="mild">Mild (rash, itching)</option>
          <option value="moderate">Moderate (swelling, hives)</option>
          <option value="severe">Severe (anaphylaxis, difficulty breathing)</option>
        </select>
      </div>

      <div>
        <label className="block font-semibold mb-1">Symptoms Experienced *</label>
        <textarea
          name="symptoms"
          value={formData.symptoms || ''}
          onChange={onChange}
          required
          rows={4}
          placeholder="Describe symptoms during allergic reactions"
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Allergy Testing Conducted *</label>
        <select
          name="allergyTesting"
          value={formData.allergyTesting || ''}
          onChange={onChange}
          required
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="">-- Select Testing Done --</option>
          <option value="skinPrickTest">Skin Prick Test</option>
          <option value="bloodTest">Blood Test (IgE)</option>
          <option value="patchTest">Patch Test</option>
          <option value="none">No Testing</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block font-semibold mb-1">Test Results Details *</label>
        <textarea
          name="testResults"
          value={formData.testResults || ''}
          onChange={onChange}
          required
          rows={3}
          placeholder="Include any relevant notes or results from allergy tests"
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Medications and Treatments *</label>
        <textarea
          name="medications"
          value={formData.medications || ''}
          onChange={onChange}
          required
          rows={3}
          placeholder="Include antihistamines, epinephrine, corticosteroids, etc."
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div>
       <PrescriptionTable formData={formData} onChange={onChange} />
      </div>

      <div>
        <label className="block font-semibold mb-1">Emergency Action Plan *</label>
        <textarea
          name="emergencyActionPlan"
          value={formData.emergencyActionPlan || ''}
          onChange={onChange}
          required
          rows={4}
          placeholder="Instructions for managing severe allergic reactions or anaphylaxis"
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Last Allergy Incident Date *</label>
        <input
          type="date"
          name="lastIncidentDate"
          value={formData.lastIncidentDate || ''}
          onChange={onChange}
          required
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Additional Notes *</label>
        <textarea
          name="additionalNotes"
          value={formData.additionalNotes || ''}
          onChange={onChange}
          required
          rows={3}
          placeholder="Any other relevant allergy info"
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>
    </>
  );
}
