import React, { useState } from 'react';
import { Eye, Edit, CheckCircle, Clock, AlertTriangle, Image as ImageIcon } from 'lucide-react';

const RecordsTable = ({ 
  records = [], 
  userRole, 
  onViewRecord, 
  onEditRecord, 
  onVerifyRecord,
  onRequestCorrection,
  loading = false 
}) => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
      'verified': { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
      'correction_requested': { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle }
    };

    const config = statusConfig[status] || statusConfig['pending'];
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getCaseStatusBadge = (caseStatus) => {
    const statusConfig = {
      'improving': { color: 'bg-green-50 text-green-700', icon: '↗️' },
      'deteriorating': { color: 'bg-red-50 text-red-700', icon: '↘️' },
      'stable': { color: 'bg-blue-50 text-blue-700', icon: '→' }
    };

    const config = statusConfig[caseStatus] || statusConfig['stable'];

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {caseStatus.toUpperCase()}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleImageView = (record) => {
    setSelectedRecord(record);
    setShowImageModal(true);
  };

  const canEdit = (record) => {
    return userRole === 'doctor' || (userRole === 'management' && record.status === 'pending');
  };

  const canVerify = (record) => {
    return userRole === 'doctor' && record.status === 'pending';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!records.length) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="text-gray-500 mb-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Records Found</h3>
        <p className="text-gray-500">There are no medical records to display at this time.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diagnosis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Case Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reports
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {record.patientName}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {record.patientId}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.doctorName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs">
                      {record.diagnosedDisease}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(record.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(record.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getCaseStatusBadge(record.caseStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.reportImages && record.reportImages.length > 0 ? (
                      <button
                        onClick={() => handleImageView(record)}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                      >
                        <ImageIcon className="w-3 h-3 mr-1" />
                        {record.reportImages.length} Report{record.reportImages.length > 1 ? 's' : ''}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">No reports</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onViewRecord(record)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {canEdit(record) && (
                        <button
                          onClick={() => onEditRecord(record)}
                          className="text-yellow-600 hover:text-yellow-900 transition-colors"
                          title="Edit Record"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      
                      {canVerify(record) && (
                        <button
                          onClick={() => onVerifyRecord(record)}
                          className="text-green-600 hover:text-green-900 transition-colors"
                          title="Verify Record"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      
                      {userRole === 'patient' && record.status === 'verified' && (
                        <button
                          onClick={() => onRequestCorrection(record)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Request Correction"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  Medical Reports - {selectedRecord.patientName}
                </h3>
                <button
                  onClick={() => setShowImageModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedRecord.reportImages?.map((image, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <img
                      src={image.url}
                      alt={`Report ${index + 1}`}
                      className="w-full h-64 object-cover"
                    />
                    <div className="p-2 bg-gray-50">
                      <p className="text-sm text-gray-600">
                        {image.name || `Report ${index + 1}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RecordsTable;