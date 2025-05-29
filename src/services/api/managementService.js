// src/services/api/managementService.js
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { notificationService } from './notificationService';
import { otpService } from '../utils/otpService';
import { emailService } from '../utils/emailService';

export const managementService = {
  // Verify patient credentials and send OTP
  async initiateRecordEntry(patientEmail, patientPassword, managementId) {
    try {
      // Find patient by email
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef, 
        where('email', '==', patientEmail),
        where('role', '==', 'patient')
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        throw new Error('Patient not found with this email');
      }
      
      const patientDoc = snapshot.docs[0];
      const patientData = patientDoc.data();
      
      // Verify patient password (in real app, use proper password hashing)
      if (patientData.password !== patientPassword) {
        throw new Error('Invalid patient credentials');
      }
      
      // Check if patient account is verified
      if (!patientData.isVerified) {
        throw new Error('Patient account is not verified by admin');
      }
      
      // Generate and send OTP
      const otp = otpService.generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      // Store OTP temporarily
      const otpRef = await addDoc(collection(db, 'tempOtps'), {
        patientId: patientDoc.id,
        managementId: managementId,
        otp: otp,
        expiresAt: otpExpiry,
        createdAt: serverTimestamp(),
        isUsed: false
      });
      
      // Send OTP via email
      await emailService.sendOTP(patientEmail, otp, patientData.name);
      
      return {
        success: true,
        message: 'OTP sent to patient email',
        sessionId: otpRef.id,
        patientId: patientDoc.id,
        patientName: patientData.name
      };
    } catch (error) {
      throw new Error(`Failed to initiate record entry: ${error.message}`);
    }
  },

  // Verify OTP and allow record entry
  async verifyOTPForRecordEntry(sessionId, enteredOTP) {
    try {
      const otpRef = doc(db, 'tempOtps', sessionId);
      const otpDoc = await getDoc(otpRef);
      
      if (!otpDoc.exists()) {
        throw new Error('Invalid session');
      }
      
      const otpData = otpDoc.data();
      
      // Check if OTP is already used
      if (otpData.isUsed) {
        throw new Error('OTP already used');
      }
      
      // Check if OTP is expired
      if (new Date() > otpData.expiresAt.toDate()) {
        throw new Error('OTP has expired');
      }
      
      // Verify OTP
      if (otpData.otp !== enteredOTP) {
        throw new Error('Invalid OTP');
      }
      
      // Mark OTP as used
      await updateDoc(otpRef, {
        isUsed: true,
        usedAt: serverTimestamp()
      });
      
      // Get patient details
      const patientRef = doc(db, 'users', otpData.patientId);
      const patientDoc = await getDoc(patientRef);
      
      return {
        success: true,
        message: 'OTP verified successfully',
        patientId: otpData.patientId,
        patientData: patientDoc.data(),
        managementId: otpData.managementId
      };
    } catch (error) {
      throw new Error(`OTP verification failed: ${error.message}`);
    }
  },

  // Add new medical record
  async addMedicalRecord(recordData, managementId) {
    try {
      // Validate required fields
      const requiredFields = [
        'patientId', 'patientName', 'doctorId', 'doctorName', 
        'date', 'diagnosedDisease', 'prescription'
      ];
      
      for (const field of requiredFields) {
        if (!recordData[field]) {
          throw new Error(`${field} is required`);
        }
      }
      
      // Get doctor details to verify
      const doctorRef = doc(db, 'users', recordData.doctorId);
      const doctorDoc = await getDoc(doctorRef);
      
      if (!doctorDoc.exists() || doctorDoc.data().role !== 'doctor') {
        throw new Error('Invalid doctor selected');
      }
      
      // Upload report images if provided
      let reportImageUrls = [];
      if (recordData.reportImages && recordData.reportImages.length > 0) {
        reportImageUrls = await this.uploadReportImages(
          recordData.reportImages, 
          recordData.patientId
        );
      }
      
      // Create medical record
      const medicalRecord = {
        patientId: recordData.patientId,
        patientName: recordData.patientName,
        doctorId: recordData.doctorId,
        doctorName: recordData.doctorName,
        date: recordData.date,
        diagnosedDisease: recordData.diagnosedDisease,
        prescription: {
          medicine: recordData.prescription.medicine,
          dosage: recordData.prescription.dosage,
          frequency: recordData.prescription.frequency,
          duration: recordData.prescription.duration,
          instructions: recordData.prescription.instructions
        },
        recommendations: recordData.recommendations || '',
        caseStatus: recordData.caseStatus || 'stable', // improving, stable, deteriorating
        reportImages: reportImageUrls,
        symptoms: recordData.symptoms || '',
        vitalSigns: recordData.vitalSigns || {},
        enteredBy: managementId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isVerified: false,
        verifiedAt: null,
        verifiedBy: null
      };
      
      // Add record to database
      const recordRef = await addDoc(collection(db, 'medicalRecords'), medicalRecord);
      
      // Send notification to doctor for verification
      await notificationService.createNotification({
        userId: recordData.doctorId,
        userType: 'doctor',
        type: 'new_record_verification',
        title: 'New Record Requires Verification',
        message: `A new medical record for patient ${recordData.patientName} requires your verification.`,
        recordId: recordRef.id,
        createdAt: serverTimestamp()
      });
      
      // Send notification to patient
      await notificationService.createNotification({
        userId: recordData.patientId,
        userType: 'patient',
        type: 'record_added',
        title: 'New Medical Record Added',
        message: `A new medical record has been added and is pending doctor verification.`,
        recordId: recordRef.id,
        createdAt: serverTimestamp()
      });
      
      return {
        success: true,
        message: 'Medical record added successfully',
        recordId: recordRef.id
      };
    } catch (error) {
      throw new Error(`Failed to add medical record: ${error.message}`);
    }
  },

  // Upload report images to Firebase Storage
  async uploadReportImages(imageFiles, patientId) {
    try {
      const uploadPromises = imageFiles.map(async (file, index) => {
        const timestamp = Date.now();
        const fileName = `reports/${patientId}/${timestamp}_${index}_${file.name}`;
        const storageRef = ref(storage, fileName);
        
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        
        return {
          url: downloadURL,
          fileName: file.name,
          uploadedAt: new Date().toISOString()
        };
      });
      
      return await Promise.all(uploadPromises);
    } catch (error) {
      throw new Error(`Failed to upload report images: ${error.message}`);
    }
  },

  // Search for patients
  async searchPatients(searchTerm) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('role', '==', 'patient'),
        where('isVerified', '==', true)
      );
      
      const snapshot = await getDocs(q);
      const patients = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filter patients based on search term (name or email)
      const filteredPatients = patients.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      return filteredPatients.map(patient => ({
        id: patient.id,
        name: patient.name,
        email: patient.email,
        dateOfBirth: patient.dateOfBirth,
        phone: patient.phone
      }));
    } catch (error) {
      throw new Error(`Failed to search patients: ${error.message}`);
    }
  },

  // Get all doctors for selection
  async getDoctors() {
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('role', '==', 'doctor'),
        where('isVerified', '==', true)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        specialization: doc.data().specialization,
        email: doc.data().email
      }));
    } catch (error) {
      throw new Error(`Failed to fetch doctors: ${error.message}`);
    }
  },

  // Get recent records entered by management
  async getRecentRecords(managementId, limitCount = 10) {
    try {
      const recordsRef = collection(db, 'medicalRecords');
      const q = query(
        recordsRef,
        where('enteredBy', '==', managementId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Failed to fetch recent records: ${error.message}`);
    }
  },

  // Get management dashboard statistics
  async getDashboardStats(managementId) {
    try {
      const recordsRef = collection(db, 'medicalRecords');
      
      // Get total records entered by this management user
      const totalQuery = query(recordsRef, where('enteredBy', '==', managementId));
      const totalSnapshot = await getDocs(totalQuery);
      
      // Get today's records
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayRecords = totalSnapshot.docs.filter(doc => {
        const createdAt = doc.data().createdAt?.toDate();
        return createdAt && createdAt >= today;
      });
      
      // Get pending verification records
      const pendingQuery = query(
        recordsRef,
        where('enteredBy', '==', managementId),
        where('isVerified', '==', false)
      );
      const pendingSnapshot = await getDocs(pendingQuery);
      
      // Get verified records
      const verifiedQuery = query(
        recordsRef,
        where('enteredBy', '==', managementId),
        where('isVerified', '==', true)
      );
      const verifiedSnapshot = await getDocs(verifiedQuery);
      
      return {
        totalRecords: totalSnapshot.size,
        todayRecords: todayRecords.length,
        pendingVerification: pendingSnapshot.size,
        verifiedRecords: verifiedSnapshot.size
      };
    } catch (error) {
      throw new Error(`Failed to fetch dashboard statistics: ${error.message}`);
    }
  },

  // Resend OTP
  async resendOTP(sessionId) {
    try {
      const otpRef = doc(db, 'tempOtps', sessionId);
      const otpDoc = await getDoc(otpRef);
      
      if (!otpDoc.exists()) {
        throw new Error('Invalid session');
      }
      
      const otpData = otpDoc.data();
      
      // Generate new OTP
      const newOtp = otpService.generateOTP();
      const newExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      // Update OTP in database
      await updateDoc(otpRef, {
        otp: newOtp,
        expiresAt: newExpiry,
        isUsed: false,
        updatedAt: serverTimestamp()
      });
      
      // Get patient details for email
      const patientRef = doc(db, 'users', otpData.patientId);
      const patientDoc = await getDoc(patientRef);
      const patientData = patientDoc.data();
      
      // Send new OTP via email
      await emailService.sendOTP(patientData.email, newOtp, patientData.name);
      
      return {
        success: true,
        message: 'New OTP sent successfully'
      };
    } catch (error) {
      throw new Error(`Failed to resend OTP: ${error.message}`);
    }
  }
};

export default managementService;