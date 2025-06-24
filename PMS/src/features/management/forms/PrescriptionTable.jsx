import { useEffect, useState } from 'react';

export default function PrescriptionTable({ prescription, setPrescription }) {
  const [rows, setRows] = useState(prescription?.length ? prescription : [{ medicine: '', times: [''] }]);

  useEffect(() => {
    setPrescription(rows);
  }, [rows]);

  const addRow = () => {
    const newRows = [...rows, { medicine: '', times: [''] }];
    setRows(newRows);
  };

  const addColumn = () => {
    const newRows = rows.map((row) => ({
      ...row,
      times: row.times ? [...row.times, ''] : [''],
    }));
    setRows(newRows);
  };

  const handleMedicineChange = (index, value) => {
    const newRows = [...rows];
    newRows[index].medicine = value;
    setRows(newRows);
  };

  const handleTimeChange = (rowIndex, colIndex, value) => {
    const newRows = [...rows];
    if (!newRows[rowIndex].times) newRows[rowIndex].times = [];
    newRows[rowIndex].times[colIndex] = value;
    setRows(newRows);
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Prescription Table</h3>

      {rows.length > 0 && rows[0].times && (
        <table className="w-full border text-sm">
          <thead>
            <tr>
              <th className="border px-2 py-1">Medicine</th>
              {rows[0].times.map((_, idx) => (
                <th key={idx} className="border px-2 py-1">Time {idx + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className="border px-2 py-1">
                  <input
                    type="text"
                    value={row.medicine}
                    onChange={(e) => handleMedicineChange(rowIndex, e.target.value)}
                    className="w-full px-2 py-1 border"
                  />
                </td>
                {row.times?.map((time, colIndex) => (
                  <td key={colIndex} className="border px-2 py-1">
                    <input
                      type="text"
                      value={time}
                      onChange={(e) =>
                        handleTimeChange(rowIndex, colIndex, e.target.value)
                      }
                      className="w-full px-2 py-1 border"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex gap-3 mt-3">
        <button
          type="button"
          onClick={addRow}
          className="bg-green-500 text-white px-3 py-1 rounded"
        >
          Add Row
        </button>
        <button
          type="button"
          onClick={addColumn}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Add Time Column
        </button>
      </div>
    </div>
  );
}
