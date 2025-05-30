import emailjs from '@emailjs/browser';

// Initialize EmailJS with your public key
const initEmailJS = () => {
  const publicKey = import.meta.env.VITE_EMAIL_PUBLIC_KEY;
  if (!publicKey) {
    throw new Error('EmailJS public key not found in environment variables');
  }
  emailjs.init(publicKey);
};

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email to patient
export const sendOTPEmail = async (patientEmail, patientName, otpCode, managementDetails, doctorName) => {
  try {
    initEmailJS();

    const templateParams = {
      patient_name: patientName,
      patient_email: patientEmail,
      otp_code: otpCode,
      management_name: managementDetails.name,
      management_email: managementDetails.email,
      doctor_name: doctorName,
      request_time: new Date().toLocaleString(),
      to_email: patientEmail // EmailJS needs this to know where to send
    };

    const result = await emailjs.send(
      import.meta.env.VITE_EMAIL_SERVICE_ID,
      import.meta.env.VITE_EMAIL_TEMPLATE_ID,
      templateParams
    );

    if (result.status === 200) {
      return {
        success: true,
        message: 'OTP sent successfully',
        otpCode: otpCode // You'll store this for verification
      };
    } else {
      throw new Error('Failed to send email');
    }

  } catch (error) {
    console.error('Error sending OTP email:', error);
    return {
      success: false,
      message: 'Failed to send OTP email',
      error: error.message
    };
  }
};

// Send notification email to doctor about new record
export const sendDoctorNotification = async (doctorEmail, doctorName, patientName, managementName) => {
  try {
    initEmailJS();

    const templateParams = {
      doctor_name: doctorName,
      patient_name: patientName,
      management_name: managementName,
      notification_time: new Date().toLocaleString(),
      to_email: doctorEmail
    };

    // You'll need to create another template for doctor notifications
    const result = await emailjs.send(
      import.meta.env.VITE_EMAIL_SERVICE_ID,
      'template_doctor_notification', // Create this template too
      templateParams
    );

    return result.status === 200;
  } catch (error) {
    console.error('Error sending doctor notification:', error);
    return false;
  }
};

// Verify OTP
export const verifyOTP = (enteredOTP, storedOTP, timestamp) => {
  const now = new Date().getTime();
  const otpAge = now - timestamp;
  const expiryTime = parseInt(import.meta.env.VITE_OTP_EXPIRY_MINUTES) * 60 * 1000; // Convert to milliseconds

  if (otpAge > expiryTime) {
    return {
      valid: false,
      message: 'OTP has expired'
    };
  }

  if (enteredOTP === storedOTP) {
    return {
      valid: true,
      message: 'OTP verified successfully'
    };
  }

  return {
    valid: false,
    message: 'Invalid OTP'
  };
};