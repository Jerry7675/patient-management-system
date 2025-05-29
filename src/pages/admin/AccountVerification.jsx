import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, XCircle, Eye, Mail, Phone, Calendar, User, Shield } from 'lucide-react';

const AccountVerification = () => {
  const [pendingAccounts, setPendingAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Mock data - replace with actual Firebase calls
  useEffect(() => {
    const mockAccounts = [
      {
        id: '1',
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@hospital.com',
        phone: '+1234567890',
        role: 'doctor',
        registrationDate: '2024-01-15',
        licenseNumber: 'MD12345',
        specialty: 'Cardiology',
        status: 'pending',
        documents: ['license.pdf', 'certificate.pdf']
      },
      {
        id: '2',
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1234567891',
        role: 'patient',
        registrationDate: '2024-01-16',
        dateOfBirth: '1990-05-20',
        address: '123 Main St, City',
        status: 'pending',
        documents: ['id_card.pdf']
      },
      {
        id: '3',
        name: 'Management Team A',
        email: 'team.a@hospital.com',
        phone: '+1234567892',
        role: 'management',
        registrationDate: '2024-01-17',
        department: 'Records Management',
        employeeId: 'EMP001',
        status: 'pending',
        documents: ['employment_letter.pdf']
      }
    ];
    
    setTimeout(() => {
      setPendingAccounts(mockAccounts);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredAccounts = pendingAccounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || account.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleVerifyAccount = async (accountId, approved) => {
    try {
      // Here you would call your Firebase function to update account status
      setPendingAccounts(prev => prev.filter(acc => acc.id !== accountId));
      
      // Show success notification
      alert(`Account ${approved ? 'approved' : 'rejected'} successfully!`);
      
      // Send notification to user about verification status
      // await sendVerificationNotification(accountId, approved);
      
    } catch (error) {
      console.error('Error updating account status:', error);
      alert('Error updating account status. Please try again.');
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      doctor: 'bg-blue-100 text-blue-800',
      patient: 'bg-green-100 text-green-800',
      management: 'bg-purple-100 text-purple-800',
      admin: 'bg-red-100 text-red-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleIcon = (role) => {
    const icons = {
      doctor: <Shield className="w-4 h-4" />,
      patient: <User className="w-4 h-4" />,
      management: <User className="w-4 h-4" />
    };
    return icons[role] || <User className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Verification</h1>
        <p className="text-gray-600">Review and verify pending user accounts</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="doctor">Doctors</option>
          <option value="patient">Patients</option>
          <option value="management">Management</option>
        </select>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAccounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{account.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {account.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {account.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(account.role)}`}>
                      {getRoleIcon(account.role)}
                      <span className="ml-1 capitalize">{account.role}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(account.registrationDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedAccount(account);
                          setShowModal(true);
                        }}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm bg-white text-gray-700 hover:bg-gray-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleVerifyAccount(account.id, true)}
                        className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm bg-green-600 text-white hover:bg-green-700"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleVerifyAccount(account.id, false)}
                        className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm bg-red-600 text-white hover:bg-red-700"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAccounts.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending accounts</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterRole !== 'all' 
                ? 'No accounts match your search criteria.'
                : 'All accounts have been verified.'}
            </p>
          </div>
        )}
      </div>

      {/* Account Details Modal */}
      {showModal && selectedAccount && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Account Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="text-sm text-gray-900">{selectedAccount.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900">{selectedAccount.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-sm text-gray-900">{selectedAccount.phone}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <p className="text-sm text-gray-900 capitalize">{selectedAccount.role}</p>
                </div>
                
                {selectedAccount.licenseNumber && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">License Number</label>
                    <p className="text-sm text-gray-900">{selectedAccount.licenseNumber}</p>
                  </div>
                )}
                
                {selectedAccount.specialty && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Specialty</label>
                    <p className="text-sm text-gray-900">{selectedAccount.specialty}</p>
                  </div>
                )}
                
                {selectedAccount.dateOfBirth && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <p className="text-sm text-gray-900">{selectedAccount.dateOfBirth}</p>
                  </div>
                )}
                
                {selectedAccount.department && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <p className="text-sm text-gray-900">{selectedAccount.department}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Documents</label>
                  <div className="mt-1">
                    {selectedAccount.documents.map((doc, index) => (
                      <div key={index} className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                        📄 {doc}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    handleVerifyAccount(selectedAccount.id, false);
                    setShowModal(false);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    handleVerifyAccount(selectedAccount.id, true);
                    setShowModal(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountVerification;