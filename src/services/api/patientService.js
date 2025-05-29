// src/services/api/patientService.js
import firestoreService from '../firebase/firestore';
import storageService from '../firebase/storage';
import { RECORD_STATUS, CORRECTION_STATUS } from '../../utils/constants';

class PatientService {
  // Get patient's medical records
  async getPatientRecords(patientId) {
    try {
      const records = await firestoreService.getCollection('medicalRecords', [
        { type: 'where', field: 'patientId', operator: '==', value: patientId },
        { type: 'where', field: 'status', operator: '==', value: RECORD_STATUS.VERIFIED },
        { type: 'orderBy', field: 'createdAt', direction: 'desc' }
      ]);

      if (records.success) {
        // Enrich records with doctor and management info
        const enrichedRecords = await Promise.all(
          records.data.map(async (record) => {
            const doctorInfo = await this.getDoctorInfo(record.doctorId);
            const managementInfo = await this.getManagementInfo(record.enteredBy);
            
            return {
              ...record,
              doctorInfo: doctorInfo.success ? doctorInfo.data : null,
              managementInfo: managementInfo.success ? managementInfo.data : null
            };
          })
        );

        return {
          success: true,
          data: enrichedRecords
        };
      }

      return records;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get specific medical record details
  async getRecordDetails(recordId, patientId) {
    try {
      const record = await firestoreService.getDocument('medicalRecords', recordId);
      
      if (!record.success) {
        return record;
      }

      // Verify patient owns this record
      if (record.data.patientId !== patientId) {
        return {
          success: false,
          error: 'Access denied: Record does not belong to this patient'
        };
      }

      // Only show verified records to patients
      if (record.data.status !== RECORD_STATUS.VERIFIED) {
        return {
          success: false,
          error: 'Record is not yet verified by doctor'
        };
      }

      // Get additional information
      const doctorInfo = await this.getDoctorInfo(record.data.doctorId);
      const managementInfo = await this.getManagementInfo(record.data.enteredBy);
      
      // Get report images if any
      const reports = await storageService.getPatientReports(patientId, recordId);

      return {
        success: true,
        data: {
          ...record.data,
          doctorInfo: doctorInfo.success ? doctorInfo.data : null,
          managementInfo: managementInfo.success ? managementInfo.data : null,
          reportImages: reports.success ? reports.files : []
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Request correction for a medical record
  async requestCorrection(correctionData) {
    try {
      const { recordId, patientId, reason, description, suggestedChanges } = correctionData;

      // Verify the record exists and belongs to patient
      const record = await firestoreService.getDocument('medicalRecords', recordId);
      
      if (!record.success) {
        return {
          success: false,
          error: 'Medical record not found'
        };
      }

      if (record.data.patientId !== patientId) {
        return {
          success: false,
          error: 'Access denied: Record does not belong to this patient'
        };
      }

      // Check if there's already a pending correction request for this record
      const existingRequests = await firestoreService.getCollection('correctionRequests', [
        { type: 'where', field: 'recordId', operator: '==', value: recordId },
        { type: 'where', field: 'status', operator: '==', value: CORRECTION_STATUS.PENDING }
      ]);

      if (existingRequests.success && existingRequests.data.length > 0) {
        return {
          success: false,
          error: 'A correction request for this record is already pending'
        };
      }

      // Create correction request
      const correctionRequest = {
        recordId,
        patientId,
        doctorId: record.data.doctorId, // Send to the doctor who verified the record
        reason,
        description,
        suggestedChanges: suggestedChanges || {},
        status: CORRECTION_STATUS.PENDING,
        requestDate: new Date(),
        originalRecord: record.data // Store original record data for reference
      };

      const result = await firestoreService.addDocument('correctionRequests', correctionRequest);

      if (result.success) {
        // Notify the doctor about the correction request
        await this.notifyDoctorAboutCorrection(record.data.doctorId, {
          requestId: result.id,
          patientId,
          recordId,
          reason
        });

        return {
          success: true,
          requestId: result.id,
          message: 'Correction request submitted successfully. The doctor will review it shortly.'
        };
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get patient's correction requests
  async getCorrectionRequests(patientId) {
    try {
      const requests = await firestoreService.getCollection('correctionRequests', [
        { type: 'where', field: 'patientId', operator: '==', value: patientId },
        { type: 'orderBy', field: 'requestDate', direction: 'desc' }
      ]);

      if (requests.success) {
        // Enrich with record and doctor information
        const enrichedRequests = await Promise.all(
          requests.data.map(async (request) => {
            const recordInfo = await firestoreService.getDocument('medicalRecords', request.recordId);
            const doctorInfo = await this.getDoctorInfo(request.doctorId);

            return {
              ...request,
              recordInfo: recordInfo.success ? recordInfo.data : null,
              doctorInfo: doctorInfo.success ? doctorInfo.data : null
            };
          })
        );

        return {
          success: true,
          data: enrichedRequests
        };
      }

      return requests;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get patient profile information
  async getPatientProfile(patientId) {
    try {
      // Get user data
      const userResult = await firestoreService.getDocument('users', patientId);
      
      if (!userResult.success) {
        return userResult;
      }

      // Get patient-specific data
      const patientData = await firestoreService.getCollection('patients', [
        { type: 'where', field: 'userId', operator: '==', value: patientId }
      ]);

      // Get basic statistics
      const recordsCount = await this.getPatientRecordsCount(patientId);
      const correctionRequestsCount = await this.getCorrectionRequestsCount(patientId);

      return {
        success: true,
        data: {
          ...userResult.data,
          patientInfo: patientData.success && patientData.data.length > 0 ? patientData.data[0] : null,
          statistics: {
            totalRecords: recordsCount,
            totalCorrectionRequests: correctionRequestsCount
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update patient profile
  async updatePatientProfile(patientId, updateData) {
    try {
      // Update user document
      const userUpdateResult = await firestoreService.updateDocument('users', patientId, {
        displayName: updateData.displayName,
        phoneNumber: updateData.phoneNumber,
        profileComplete: true
      });

      if (!userUpdateResult.success) {
        return userUpdateResult;
      }

      // Update patient-specific document
      const patientDocs = await firestoreService.getCollection('patients', [
        { type: 'where', field: 'userId', operator: '==', value: patientId }
      ]);

      if (patientDocs.success && patientDocs.data.length > 0) {
        const patientDocId = patientDocs.data[0].id;
        await firestoreService.updateDocument('patients', patientDocId, {
          dateOfBirth: updateData.dateOfBirth,
          address: updateData.address,
          emergencyContact: updateData.emergencyContact,
          bloodGroup: updateData.bloodGroup,
          allergies: updateData.allergies || []
        });
      }

      return {
        success: true,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get patient notifications
  async getPatientNotifications(patientId) {
    try {
      return await firestoreService.getUserNotifications(patientId);
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      return await firestoreService.markNotificationAsRead(notificationId);
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get patient's medical history summary
  async getMedicalHistorySummary(patientId) {
    try {
      const records = await this.getPatientRecords(patientId);
      
      if (!records.success) {
        return records;
      }

      // Analyze medical history
      const diseases = [...new Set(records.data.map(record => record.diagnosedDisease).filter(Boolean))];
      const doctors = [...new Set(records.data.map(record => record.doctorInfo?.displayName).filter(Boolean))];
      const recentRecords = records.data.slice(0, 5); // Last 5 records
      
      // Categorize by improvement status
      const improving = records.data.filter(record => record.caseStatus === 'improving').length;
      const stable = records.data.filter(record => record.caseStatus === 'stable').length;
      const deteriorating = records.data.filter(record => record.caseStatus === 'deteriorating').length;

      return {
        success: true,
        data: {
          totalRecords: records.data.length,
          uniqueDiseases: diseases,
          treatedByDoctors: doctors,
          recentRecords,
          caseStatusSummary: {
            improving,
            stable,
            deteriorating
          },
          lastVisit: records.data.length > 0 ? records.data[0].createdAt : null
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Helper methods
  async getDoctorInfo(doctorId) {
    try {
      const userInfo = await firestoreService.getDocument('users', doctorId);
      if (userInfo.success) {
        const doctorData = await firestoreService.getCollection('doctors', [
          { type: 'where', field: 'userId', operator: '==', value: doctorId }
        ]);
        
        return {
          success: true,
          data: {
            ...userInfo.data,
            doctorInfo: doctorData.success && doctorData.data.length > 0 ? doctorData.data[0] : null
          }
        };
      }
      return userInfo;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getManagementInfo(managementId) {
    try {
      const userInfo = await firestoreService.getDocument('users', managementId);
      if (userInfo.success) {
        const managementData = await firestoreService.getCollection('management', [
          { type: 'where', field: 'userId', operator: '==', value: managementId }
        ]);
        
        return {
          success: true,
          data: {
            ...userInfo.data,
            managementInfo: managementData.success && managementData.data.length > 0 ? managementData.data[0] : null
          }
        };
      }
      return userInfo;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getPatientRecordsCount(patientId) {
    try {
      const records = await firestoreService.getCollection('medicalRecords', [
        { type: 'where', field: 'patientId', operator: '==', value: patientId },
        { type: 'where', field: 'status', operator: '==', value: RECORD_STATUS.VERIFIED }
      ]);
      return records.success ? records.data.length : 0;
    } catch (error) {
      return 0;
    }
  }

  async getCorrectionRequestsCount(patientId) {
    try {
      const requests = await firestoreService.getCollection('correctionRequests', [
        { type: 'where', field: 'patientId', operator: '==', value: patientId }
      ]);
      return requests.success ? requests.data.length : 0;
    } catch (error) {
      return 0;
    }
  }

  async notifyDoctorAboutCorrection(doctorId, correctionInfo) {
    try {
      const notification = {
        userId: doctorId,
        type: 'correction_request',
        title: 'New Correction Request',
        message: `Patient has requested a correction for medical record. Reason: ${correctionInfo.reason}`,
        data: correctionInfo,
        read: false,
        priority: 'high'
      };

      await firestoreService.addDocument('notifications', notification);
    } catch (error) {
      console.error('Error notifying doctor about correction:', error);
    }
  }

  // Real-time listeners for patient dashboard
  onPatientRecordsChange(patientId, callback) {
    return firestoreService.onCollectionSnapshot('medicalRecords', callback, [
      { type: 'where', field: 'patientId', operator: '==', value: patientId },
      { type: 'where', field: 'status', operator: '==', value: RECORD_STATUS.VERIFIED },
      { type: 'orderBy', field: 'createdAt', direction: 'desc' }
    ]);
  }

  onPatientNotificationsChange(patientId, callback) {
    return firestoreService.onCollectionSnapshot('notifications', callback, [
      { type: 'where', field: 'userId', operator: '==', value: patientId },
      { type: 'where', field: 'read', operator: '==', value: false },
      { type: 'orderBy', field: 'createdAt', direction: 'desc' }
    ]);
  }
}

export default new PatientService();