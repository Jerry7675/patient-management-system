import { 
  collection, 
  addDoc, 
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit 
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Email Service - Handles all email operations
 * Note: This uses a mock email service for development
 * In production, integrate with services like SendGrid, AWS SES, or Firebase Functions
 */

// Email templates for different scenarios
const EMAIL_TEMPLATES = {
  OTP_VERIFICATION: {
    subject: 'Patient Management System - OTP Verification',
    template: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Patient Management System</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">OTP Verification Required</h2>
          <p style="color: #666; line-height: 1.6;">Dear ${data.patientName},</p>
          <p style="color: #666; line-height: 1.6;">
            A medical record entry request has been initiated by our management team. 
            Please share the following OTP with the management personnel to authorize the record entry:
          </p>
          <div style="background: #f8f9fa; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h2 style="color: #667eea; font-size: 32px; margin: 0; letter-spacing: 5px;">${data.otp}</h2>
          </div>
          <p style="color: #666; line-height: 1.6;">
            <strong>Important:</strong> This OTP is valid for ${data.expiryMinutes} minutes only. 
            Do not share this OTP with anyone other than authorized management personnel.
          </p>
          <p style="color: #666; line-height: 1.6;">
            <strong>Management Details:</strong><br>
            Name: ${data.managementName}<br>
            Email: ${data.managementEmail}<br>
            Department: ${data.department || 'Medical Records'}
          </p>
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>Security Notice:</strong> If you did not request this OTP or are unsure about this request, 
              please contact our support team immediately.
            </p>
          </div>
          <p style="color: #666; line-height: 1.6;">Thank you for using our Patient Management System.</p>
        </div>
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>© 2025 Patient Management System. All rights reserved.</p>
        </div>
      </div>
    `
  },

  ACCOUNT_VERIFICATION: {
    subject: 'Account Verification Status Update',
    template: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: ${data.isApproved ? '#28a745' : '#dc3545'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Account ${data.isApproved ? 'Verified' : 'Rejected'}</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px;">
          <p style="color: #666; line-height: 1.6;">Dear ${data.userName},</p>
          ${data.isApproved ? 
            `<p style="color: #666; line-height: 1.6;">
              Congratulations! Your account has been verified by our admin team. 
              You can now access all features of the Patient Management System.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.loginUrl}" style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Login to Your Account
              </a>
            </div>` :
            `<p style="color: #666; line-height: 1.6;">
              We regret to inform you that your account verification has been rejected.
            </p>
            <p style="color: #666; line-height: 1.6;"><strong>Reason:</strong> ${data.rejectionReason}</p>
            <p style="color: #666; line-height: 1.6;">
              Please contact our support team if you believe this is an error or if you need assistance.
            </p>`
          }
        </div>
      </div>
    `
  },

  RECORD_NOTIFICATION: {
    subject: 'Medical Record Update',  
    template: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #17a2b8; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Medical Record ${data.action}</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px;">
          <p style="color: #666; line-height: 1.6;">Dear ${data.recipientName},</p>
          <p style="color: #666; line-height: 1.6;">${data.message}</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Record Details:</h3>
            <p style="color: #666; margin: 5px 0;"><strong>Patient:</strong> ${data.patientName}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Doctor:</strong> ${data.doctorName}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Date:</strong> ${data.recordDate}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Diagnosis:</strong> ${data.diagnosis}</p>
          </div>
          ${data.actionUrl ? 
            `<div style="text-align: center; margin: 30px 0;">
              <a href="${data.actionUrl}" style="background: #17a2b8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                ${data.actionText || 'View Record'}
              </a>
            </div>` : ''
          }
        </div>
      </div>
    `
  },

  PASSWORD_RESET: {
    subject: 'Password Reset Request',
    template: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #fd7e14; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Password Reset</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px;">
          <p style="color: #666; line-height: 1.6;">Dear ${data.userName},</p>
          <p style="color: #666; line-height: 1.6;">
            You have requested to reset your password. Click the button below to proceed:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetUrl}" style="background: #fd7e14; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; line-height: 1.6;">
            This link will expire in ${data.expiryHours} hours. If you did not request this reset, please ignore this email.
          </p>
        </div>
      </div>
    `
  },

  WELCOME: {
    subject: 'Welcome to Patient Management System',
    template: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Welcome to PMS</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px;">
          <p style="color: #666; line-height: 1.6;">Dear ${data.userName},</p>
          <p style="color: #666; line-height: 1.6;">
            Welcome to the Patient Management System! Your account has been created successfully.
          </p>
          <p style="color: #666; line-height: 1.6;">
            <strong>Your Role:</strong> ${data.userRole}<br>
            <strong>Account Status:</strong> Pending Admin Verification
          </p>
          <p style="color: #666; line-height: 1.6;">
            Our admin team will review and verify your account shortly. You will receive an email notification once your account is approved.
          </p>
        </div>
      </div>
    `
  }
};

// Mock email sending function (replace with actual email service)
const sendEmailViaService = async (to, subject, htmlContent) => {
  // In development, just log the email
  if (process.env.NODE_ENV === 'development') {
    console.log('📧 Email would be sent to:', to);
    console.log('📧 Subject:', subject);
    console.log('📧 Content:', htmlContent);
    return { success: true, messageId: 'mock_' + Date.now() };
  }
  
  // Production implementation would use actual email service
  // Example with fetch to your backend email endpoint:
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        html: htmlContent
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      return { success: true, messageId: result.messageId };
    } else {
      throw new Error('Email service error');
    }
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Send OTP email to patient
export const sendOTPEmail = async (patientEmail, otpData) => {
  try {
    const template = EMAIL_TEMPLATES.OTP_VERIFICATION;
    const htmlContent = template.template({
      patientName: otpData.patientName,
      otp: otpData.otp,
      expiryMinutes: otpData.expiryMinutes || 10,
      managementName: otpData.managementName,
      managementEmail: otpData.managementEmail,
      department: otpData.department
    });
    
    const result = await sendEmailViaService(patientEmail, template.subject, htmlContent);
    
    // Log email in database
    if (result.success) {
      await addDoc(collection(db, 'emailLogs'), {
        recipient: patientEmail,
        type: 'OTP_VERIFICATION',
        subject: template.subject,
        status: 'sent',
        messageId: result.messageId,
        metadata: {
          otpId: otpData.otpId,
          patientId: otpData.patientId,
          managementId: otpData.managementId
        },
        sentAt: serverTimestamp()
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

// Send account verification email
export const sendAccountVerificationEmail = async (userEmail, verificationData) => {
  try {
    const template = EMAIL_TEMPLATES.ACCOUNT_VERIFICATION;
    const htmlContent = template.template({
      userName: verificationData.userName,
      isApproved: verificationData.isApproved,
      rejectionReason: verificationData.rejectionReason,
      loginUrl: `${window.location.origin}/login`
    });
    
    const result = await sendEmailViaService(userEmail, template.subject, htmlContent);
    
    // Log email in database
    if (result.success) {
      await addDoc(collection(db, 'emailLogs'), {
        recipient: userEmail,
        type: 'ACCOUNT_VERIFICATION',
        subject: template.subject,
        status: 'sent',
        messageId: result.messageId,
        metadata: {
          userId: verificationData.userId,
          isApproved: verificationData.isApproved,
          adminId: verificationData.adminId
        },
        sentAt: serverTimestamp()
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};

// Send record notification email
export const sendRecordNotificationEmail = async (recipientEmail, recordData) => {
  try {
    const template = EMAIL_TEMPLATES.RECORD_NOTIFICATION;
    const htmlContent = template.template({
      recipientName: recordData.recipientName,
      message: recordData.message,
      action: recordData.action,
      patientName: recordData.patientName,
      doctorName: recordData.doctorName,
      recordDate: recordData.recordDate,
      diagnosis: recordData.diagnosis,
      actionUrl: recordData.actionUrl,
      actionText: recordData.actionText
    });
    
    const result = await sendEmailViaService(recipientEmail, template.subject, htmlContent);
    
    // Log email in database
    if (result.success) {
      await addDoc(collection(db, 'emailLogs'), {
        recipient: recipientEmail,
        type: 'RECORD_NOTIFICATION',
        subject: template.subject,
        status: 'sent',
        messageId: result.messageId,
        metadata: {
          recordId: recordData.recordId,
          recipientId: recordData.recipientId,
          action: recordData.action
        },
        sentAt: serverTimestamp()
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error sending record notification email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email
export const sendWelcomeEmail = async (userEmail, userData) => {
  try {
    const template = EMAIL_TEMPLATES.WELCOME;
    const htmlContent = template.template({
      userName: userData.userName,
      userRole: userData.userRole
    });
    
    const result = await sendEmailViaService(userEmail, template.subject, htmlContent);
    
    // Log email in database
    if (result.success) {
      await addDoc(collection(db, 'emailLogs'), {
        recipient: userEmail,
        type: 'WELCOME',
        subject: template.subject,
        status: 'sent',
        messageId: result.messageId,
        metadata: {
          userId: userData.userId,
          userRole: userData.userRole
        },
        sentAt: serverTimestamp()
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (userEmail, resetData) => {
  try {
    const template = EMAIL_TEMPLATES.PASSWORD_RESET;
    const htmlContent = template.template({
      userName: resetData.userName,
      resetUrl: resetData.resetUrl,
      expiryHours: resetData.expiryHours || 24
    });
    
    const result = await sendEmailViaService(userEmail, template.subject, htmlContent);
    
    // Log email in database
    if (result.success) {
      await addDoc(collection(db, 'emailLogs'), {
        recipient: userEmail,
        type: 'PASSWORD_RESET',
        subject: template.subject,
        status: 'sent',
        messageId: result.messageId,
        metadata: {
          userId: resetData.userId,
          resetToken: resetData.resetToken
        },
        sentAt: serverTimestamp()
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

// Get email logs for analytics
export const getEmailLogs = async (filters = {}) => {
  try {
    const emailLogsRef = collection(db, 'emailLogs');
    let q = query(emailLogsRef, orderBy('sentAt', 'desc'));
    
    if (filters.type) {
      q = query(emailLogsRef, where('type', '==', filters.type), orderBy('sentAt', 'desc'));
    }
    
    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }
    
    const snapshot = await getDocs(q);
    const logs = [];
    
    snapshot.forEach((doc) => {
      logs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, data: logs };
  } catch (error) {
    console.error('Error fetching email logs:', error);
    return { success: false, error: error.message };
  }
};

// Get email statistics
export const getEmailStatistics = async (days = 30) => {
  try {
    const emailLogsRef = collection(db, 'emailLogs');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const q = query(
      emailLogsRef,
      where('sentAt', '>=', startDate),
      orderBy('sentAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const stats = {
      total: 0,
      byType: {},
      byStatus: { sent: 0, failed: 0 },
      recentActivity: []
    };
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      stats.total++;
      
      // Count by type
      if (data.type) {
        stats.byType[data.type] = (stats.byType[data.type] || 0) + 1;
      }
      
      // Count by status
      if (data.status === 'sent') {
        stats.byStatus.sent++;
      } else {
        stats.byStatus.failed++;
      }
      
      // Add to recent activity
      if (stats.recentActivity.length < 10) {
        stats.recentActivity.push({
          type: data.type,
          recipient: data.recipient,
          status: data.status,
          sentAt: data.sentAt
        });
      }
    });
    
    return { success: true, data: stats };
  } catch (error) {
    console.error('Error fetching email statistics:', error);
    return { success: false, error: error.message };
  }
};

// Retry failed emails
export const retryFailedEmails = async (emailLogIds) => {
  try {
    const results = [];
    
    for (const logId of emailLogIds) {
      // This would implement retry logic based on stored email data
      // For now, just mark as retry attempted
      results.push({ logId, status: 'retry_attempted' });
    }
    
    return { success: true, results };
  } catch (error) {
    console.error('Error retrying failed emails:', error);
    return { success: false, error: error.message };
  }
};