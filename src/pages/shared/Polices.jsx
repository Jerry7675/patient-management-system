import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Lock, 
  FileText, 
  Users, 
  ArrowLeft, 
  ChevronDown, 
  ChevronRight,
  Eye,
  Database,
  UserCheck
} from 'lucide-react';

const Policies = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('privacy');
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpanded = (item) => {
    setExpandedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const sections = [
    { id: 'privacy', title: 'Privacy Policy', icon: Shield },
    { id: 'terms', title: 'Terms of Service', icon: FileText },
    { id: 'security', title: 'Security Policy', icon: Lock },
    { id: 'data', title: 'Data Protection', icon: Database },
    { id: 'roles', title: 'User Roles & Access', icon: Users }
  ];

  const privacyContent = [
    {
      title: 'Information We Collect',
      content: 'We collect personal health information, contact details, and medical records as necessary for patient care management. All data collection follows HIPAA compliance standards.'
    },
    {
      title: 'How We Use Your Information',
      content: 'Your information is used solely for medical record management, doctor-patient communication, and healthcare service delivery. We never sell or share your data with third parties.'
    },
    {
      title: 'Data Storage and Security',
      content: 'All patient data is encrypted and stored securely using Firebase security protocols. Access is restricted based on user roles and authentication.'
    },
    {
      title: 'Your Rights',
      content: 'You have the right to access, correct, or request deletion of your personal information. Contact your healthcare provider for any data-related requests.'
    }
  ];

  const termsContent = [
    {
      title: 'System Usage',
      content: 'This system is intended for authorized healthcare personnel and patients only. Misuse of the system may result in account suspension and legal action.'
    },
    {
      title: 'User Responsibilities',
      content: 'Users must maintain confidentiality of login credentials, report suspicious activities, and use the system only for legitimate healthcare purposes.'
    },
    {
      title: 'Account Verification',
      content: 'All accounts require admin verification before activation. False information provided during registration may result in permanent account suspension.'
    },
    {
      title: 'Record Accuracy',
      content: 'Medical records must be accurate and verified by licensed healthcare providers. Patients can request corrections through the proper channels.'
    }
  ];

  const securityContent = [
    {
      title: 'Authentication',
      content: 'Multi-factor authentication including OTP verification ensures secure access. Passwords must meet complexity requirements.'
    },
    {
      title: 'Role-Based Access',
      content: 'System access is strictly controlled based on user roles: Patient, Doctor, Management, and Admin. Each role has specific permissions.'
    },
    {
      title: 'Data Encryption',
      content: 'All data is encrypted in transit and at rest. Medical images and documents are stored using secure cloud storage protocols.'
    },
    {
      title: 'Audit Trails',
      content: 'All system activities are logged and monitored. Unauthorized access attempts are tracked and reported to administrators.'
    }
  ];

  const dataContent = [
    {
      title: 'HIPAA Compliance',
      content: 'Our system fully complies with HIPAA regulations for protecting patient health information and maintaining privacy standards.'
    },
    {
      title: 'Data Retention',
      content: 'Medical records are retained according to legal requirements and healthcare standards. Data deletion follows established protocols.'
    },
    {
      title: 'Backup and Recovery',
      content: 'Regular automated backups ensure data availability. Recovery procedures are tested regularly to prevent data loss.'
    },
    {
      title: 'Third-Party Services',
      content: 'We use Firebase for data storage and authentication, which maintains enterprise-level security and compliance standards.'
    }
  ];

  const rolesContent = [
    {
      title: 'Patient Access',
      content: 'Patients can view their medical records, request corrections, and update personal information. Cannot modify medical data directly.'
    },
    {
      title: 'Doctor Privileges',
      content: 'Doctors can verify records, edit medical information, approve corrections, and receive notifications for new entries requiring verification.'
    },
    {
      title: 'Management Role',
      content: 'Management staff can enter new records with patient consent (via OTP), upload medical reports, and manage patient data entry.'
    },
    {
      title: 'Admin Control',
      content: 'Administrators verify all user accounts, manage system access, oversee user roles, and maintain system security protocols.'
    }
  ];

  const getContentForSection = (sectionId) => {
    switch (sectionId) {
      case 'privacy': return privacyContent;
      case 'terms': return termsContent;
      case 'security': return securityContent;
      case 'data': return dataContent;
      case 'roles': return rolesContent;
      default: return privacyContent;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Policies & Guidelines
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Sections</h2>
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{section.title}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Section Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  {React.createElement(
                    sections.find(s => s.id === activeSection)?.icon || Shield,
                    { className: "w-6 h-6 text-blue-600" }
                  )}
                  <h2 className="text-xl font-semibold text-gray-900">
                    {sections.find(s => s.id === activeSection)?.title}
                  </h2>
                </div>
              </div>

              {/* Section Content */}
              <div className="p-6">
                <div className="space-y-4">
                  {getContentForSection(activeSection).map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleExpanded(`${activeSection}-${index}`)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        {expandedItems[`${activeSection}-${index}`] ? (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                      
                      {expandedItems[`${activeSection}-${index}`] && (
                        <div className="px-4 pb-4">
                          <p className="text-gray-700 leading-relaxed">
                            {item.content}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Eye className="w-5 h5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Important Notice</h4>
                  <p className="text-blue-700 text-sm mt-1">
                    These policies are regularly updated to ensure compliance with healthcare regulations. 
                    Users are responsible for staying informed about policy changes. Last updated: {new Date().toLocaleDateString()}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Policies;