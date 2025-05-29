// src/services/utils/otpService.js
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { sendEmail } from './emailService';

class OTPService {
  constructor() {
    this.otpCollection = 'otps';
    this.otpLength = 6;
    this.otpExpiration = 10 * 60 * 1000; // 10 minutes in milliseconds
  }

  // Generate random OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP to patient email
  async sendOTP(patientEmail, patientName, managementName) {
    try {
      // Clean up expired OTPs first
      await this.cleanupExpiredOTPs(patientEmail);

      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + this.otpExpiration);

      // Store OTP in Firestore
      const otpDoc = await addDoc(collection(db, this.otpCollection), {
        email: patientEmail,
        otp: otp,
        createdAt: serverTimestamp(),
        expiresAt: expiresAt,
        used: false,
        managementName: managementName,
        patientName: patientName
      });

      // Send email to patient
      const emailSubject = 'Medical Record Entry - OTP Verification';
      const emailBody = `
        Dear ${patientName},

        Management staff "${managementName}" is requesting to enter your medical records.
        
        Your One-Time Password (OTP) is: ${otp}
        
        This OTP is valid for 10 minutes only.
        Please share this OTP with the management staff to allow them to proceed with record entry.
        
        If you did not request this, please ignore this email.
        
        Best regards,
        Patient Management System
      `;

      await sendEmail(patientEmail, emailSubject, emailBody);

      return {
        success: true,
        message: 'OTP sent successfully',
        otpId: otpDoc.id
      };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        message: 'Failed to send OTP',
        error: error.message
      };
    }
  }

  // Verify OTP provided by patient to management
  async verifyOTP(patientEmail, providedOTP) {
    try {
      const otpQuery = query(
        collection(db, this.otpCollection),
        where('email', '==', patientEmail),
        where('otp', '==', providedOTP),
        where('used', '==', false)
      );

      const otpDocs = await getDocs(otpQuery);

      if (otpDocs.empty) {
        return {
          success: false,
          message: 'Invalid OTP or OTP not found'
        };
      }

      // Check if OTP is expired
      const otpData = otpDocs.docs[0].data();
      const now = new Date();
      const expiresAt = otpData.expiresAt.toDate();

      if (now > expiresAt) {
        // Delete expired OTP
        await deleteDoc(doc(db, this.otpCollection, otpDocs.docs[0].id));
        return {
          success: false,
          message: 'OTP has expired'
        };
      }

      // Mark OTP as used
      await deleteDoc(doc(db, this.otpCollection, otpDocs.docs[0].id));

      return {
        success: true,
        message: 'OTP verified successfully',
        patientName: otpData.patientName,
        managementName: otpData.managementName
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: 'Failed to verify OTP',
        error: error.message
      };
    }
  }

  // Clean up expired OTPs for a specific email
  async cleanupExpiredOTPs(email) {
    try {
      const otpQuery = query(
        collection(db, this.otpCollection),
        where('email', '==', email)
      );

      const otpDocs = await getDocs(otpQuery);
      const now = new Date();

      const deletePromises = otpDocs.docs
        .filter(doc => {
          const expiresAt = doc.data().expiresAt.toDate();
          return now > expiresAt;
        })
        .map(doc => deleteDoc(doc.ref));

      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
    }
  }

  // Get active OTP for email (for testing/debugging)
  async getActiveOTP(email) {
    try {
      const otpQuery = query(
        collection(db, this.otpCollection),
        where('email', '==', email),
        where('used', '==', false)
      );

      const otpDocs = await getDocs(otpQuery);
      
      if (otpDocs.empty) {
        return null;
      }

      const otpData = otpDocs.docs[0].data();
      const now = new Date();
      const expiresAt = otpData.expiresAt.toDate();

      if (now > expiresAt) {
        // Clean up expired OTP
        await deleteDoc(doc(db, this.otpCollection, otpDocs.docs[0].id));
        return null;
      }

      return {
        otp: otpData.otp,
        expiresAt: expiresAt,
        createdAt: otpData.createdAt.toDate(),
        managementName: otpData.managementName,
        patientName: otpData.patientName
      };
    } catch (error) {
      console.error('Error getting active OTP:', error);
      return null;
    }
  }

  // Resend OTP (if previous one expired or not received)
  async resendOTP(patientEmail, patientName, managementName) {
    try {
      // First cleanup any existing OTPs for this email
      await this.cleanupExpiredOTPs(patientEmail);
      
      // Delete any non-expired OTPs as well for resend
      const otpQuery = query(
        collection(db, this.otpCollection),
        where('email', '==', patientEmail)
      );
      
      const otpDocs = await getDocs(otpQuery);
      const deletePromises = otpDocs.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Send new OTP
      return await this.sendOTP(patientEmail, patientName, managementName);
    } catch (error) {
      console.error('Error resending OTP:', error);
      return {
        success: false,
        message: 'Failed to resend OTP',
        error: error.message
      };
    }
  }

  // Cleanup all expired OTPs (can be called periodically)
  async cleanupAllExpiredOTPs() {
    try {
      const otpQuery = query(collection(db, this.otpCollection));
      const otpDocs = await getDocs(otpQuery);
      const now = new Date();

      const deletePromises = otpDocs.docs
        .filter(doc => {
          const expiresAt = doc.data().expiresAt.toDate();
          return now > expiresAt;
        })
        .map(doc => deleteDoc(doc.ref));

      await Promise.all(deletePromises);
      
      return {
        success: true,
        deletedCount: deletePromises.length
      };
    } catch (error) {
      console.error('Error cleaning up all expired OTPs:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
const otpService = new OTPService();
export default otpService;

// Named exports for specific functions
export const {
  sendOTP,
  verifyOTP,
  resendOTP,
  getActiveOTP,
  cleanupExpiredOTPs,
  cleanupAllExpiredOTPs
} = otpService;