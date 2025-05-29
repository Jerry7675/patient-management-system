// src/services/api/authService.js
import firebaseAuth from '../firebase/auth';
import firestoreService from '../firebase/firestore';
import { ROLES, USER_STATUS } from '../../utils/constants';

class AuthService {
  // Login with role-specific validation
  async login(email, password, expectedRole = null) {
    try {
      const result = await firebaseAuth.signIn(email, password);
      
      if (!result.success) {
        return result;
      }

      const user = result.user;

      // Check if account is verified by admin
      if (user.status !== USER_STATUS.APPROVED && user.role !== ROLES.ADMIN) {
        await firebaseAuth.signOut();
        return {
          success: false,
          error: 'Your account is pending admin approval. Please wait for verification.'
        };
      }

      // Validate role if specified
      if (expectedRole && user.role !== expectedRole) {
        await firebaseAuth.signOut();
        return {
          success: false,
          error: `Access denied. This login is for ${expectedRole} accounts only.`
        };
      }

      // Update last login time
      await firestoreService.updateDocument('users', user.uid, {
        lastLogin: new Date(),
        isOnline: true
      });

      return {
        success: true,
        user,
        message: 'Login successful'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Register new user with role-specific data
  async register(userData) {
    try {
      const { email, password, role, ...additionalData } = userData;

      // Validate required fields based on role
      const validation = this.validateRegistrationData(userData);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Check if email already exists
      const existingUser = await this.checkEmailExists(email);
      if (existingUser) {
        return {
          success: false,
          error: 'An account with this email already exists'
        };
      }

      // Prepare user data based on role
      const roleSpecificData = this.prepareRoleSpecificData(role, additionalData);

      const result = await firebaseAuth.signUp(email, password, {
        ...roleSpecificData,
        role,
        status: role === ROLES.ADMIN ? USER_STATUS.APPROVED : USER_STATUS.PENDING,
        emailVerified: false,
        profileComplete: false
      });

      if (!result.success) {
        return result;
      }

      // Create role-specific document
      await this.createRoleSpecificDocument(result.user.uid, role, roleSpecificData);

      // Send notification to admin for approval (except admin)
      if (role !== ROLES.ADMIN) {
        await this.notifyAdminForApproval(result.user);
      }

      return {
        success: true,
        user: result.user,
        message: role === ROLES.ADMIN ? 
          'Admin account created successfully' : 
          'Registration successful. Please wait for admin approval.'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Logout user
  async logout() {
    try {
      const currentUser = firebaseAuth.getCurrentUser();
      if (currentUser) {
        // Update online status
        await firestoreService.updateDocument('users', currentUser.uid, {
          isOnline: false,
          lastSeen: new Date()
        });
      }

      const result = await firebaseAuth.signOut();
      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      const result = await firebaseAuth.resetPassword(email);
      if (result.success) {
        return {
          success: true,
          message: 'Password reset email sent successfully'
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

  // Get current user data
  async getCurrentUser() {
    try {
      const currentUser = firebaseAuth.getCurrentUser();
      if (!currentUser) {
        return {
          success: false,
          error: 'No user logged in'
        };
      }

      const userData = await firebaseAuth.getUserData(currentUser.uid);
      return {
        success: true,
        user: {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          ...userData
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update user profile
  async updateProfile(userId, updateData) {
    try {
      const result = await firestoreService.updateDocument('users', userId, updateData);
      
      if (result.success) {
        // Update role-specific document if needed
        const userData = await firestoreService.getDocument('users', userId);
        if (userData.success) {
          await this.updateRoleSpecificDocument(userId, userData.data.role, updateData);
        }

        return {
          success: true,
          message: 'Profile updated successfully'
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

  // Validate registration data based on role
  validateRegistrationData(userData) {
    const errors = [];
    const { email, password, role, displayName } = userData;

    // Common validations
    if (!email || !email.includes('@')) {
      errors.push('Valid email is required');
    }
    if (!password || password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    if (!displayName || displayName.trim().length < 2) {
      errors.push('Display name must be at least 2 characters long');
    }
    if (!role || !Object.values(ROLES).includes(role)) {
      errors.push('Valid role is required');
    }

    // Role-specific validations
    switch (role) {
      case ROLES.PATIENT:
        if (!userData.dateOfBirth) errors.push('Date of birth is required for patients');
        if (!userData.phoneNumber) errors.push('Phone number is required for patients');
        if (!userData.address) errors.push('Address is required for patients');
        break;

      case ROLES.DOCTOR:
        if (!userData.licenseNumber) errors.push('License number is required for doctors');
        if (!userData.specialization) errors.push('Specialization is required for doctors');
        if (!userData.phoneNumber) errors.push('Phone number is required for doctors');
        break;

      case ROLES.MANAGEMENT:
        if (!userData.department) errors.push('Department is required for management');
        if (!userData.employeeId) errors.push('Employee ID is required for management');
        if (!userData.phoneNumber) errors.push('Phone number is required for management');
        break;

      case ROLES.ADMIN:
        if (!userData.adminCode) errors.push('Admin code is required');
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Prepare role-specific data
  prepareRoleSpecificData(role, additionalData) {
    const baseData = {
      displayName: additionalData.displayName,
      phoneNumber: additionalData.phoneNumber || '',
      createdAt: new Date()
    };

    switch (role) {
      case ROLES.PATIENT:
        return {
          ...baseData,
          dateOfBirth: additionalData.dateOfBirth,
          address: additionalData.address,
          emergencyContact: additionalData.emergencyContact || '',
          bloodGroup: additionalData.bloodGroup || '',
          allergies: additionalData.allergies || []
        };

      case ROLES.DOCTOR:
        return {
          ...baseData,
          licenseNumber: additionalData.licenseNumber,
          specialization: additionalData.specialization,
          experience: additionalData.experience || 0,
          qualification: additionalData.qualification || '',
          workingHours: additionalData.workingHours || {}
        };

      case ROLES.MANAGEMENT:
        return {
          ...baseData,
          department: additionalData.department,
          employeeId: additionalData.employeeId,
          position: additionalData.position || '',
          supervisor: additionalData.supervisor || ''
        };

      case ROLES.ADMIN:
        return {
          ...baseData,
          adminLevel: additionalData.adminLevel || 1,
          permissions: additionalData.permissions || []
        };

      default:
        return baseData;
    }
  }

  // Create role-specific document
  async createRoleSpecificDocument(userId, role, data) {
    const collections = {
      [ROLES.PATIENT]: 'patients',
      [ROLES.DOCTOR]: 'doctors',
      [ROLES.MANAGEMENT]: 'management',
      [ROLES.ADMIN]: 'admins'
    };

    const collectionName = collections[role];
    if (collectionName) {
      await firestoreService.addDocument(collectionName, {
        userId,
        ...data
      });
    }
  }

  // Update role-specific document
  async updateRoleSpecificDocument(userId, role, updateData) {
    const collections = {
      [ROLES.PATIENT]: 'patients',
      [ROLES.DOCTOR]: 'doctors',
      [ROLES.MANAGEMENT]: 'management',
      [ROLES.ADMIN]: 'admins'
    };

    const collectionName = collections[role];
    if (collectionName) {
      // Find the document by userId
      const docs = await firestoreService.getCollection(collectionName, [
        { type: 'where', field: 'userId', operator: '==', value: userId }
      ]);

      if (docs.success && docs.data.length > 0) {
        await firestoreService.updateDocument(collectionName, docs.data[0].id, updateData);
      }
    }
  }

  // Check if email already exists
  async checkEmailExists(email) {
    try {
      const users = await firestoreService.getCollection('users', [
        { type: 'where', field: 'email', operator: '==', value: email }
      ]);
      return users.success && users.data.length > 0;
    } catch (error) {
      return false;
    }
  }

  // Notify admin for approval
  async notifyAdminForApproval(user) {
    try {
      // Get all admins
      const admins = await firestoreService.getUsersByRole(ROLES.ADMIN);
      
      if (admins.success && admins.data.length > 0) {
        // Create notification for each admin
        const notifications = admins.data.map(admin => ({
          userId: admin.id,
          type: 'user_approval',
          title: 'New User Registration',
          message: `New ${user.role} account registered: ${user.displayName} (${user.email})`,
          data: {
            userId: user.uid,
            userRole: user.role,
            userEmail: user.email,
            userName: user.displayName
          },
          read: false,
          priority: 'medium'
        }));

        // Add notifications
        for (const notification of notifications) {
          await firestoreService.addDocument('notifications', notification);
        }
      }
    } catch (error) {
      console.error('Error sending admin notification:', error);
    }
  }

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return firebaseAuth.onAuthStateChanged(callback);
  }

  // Check if user is authenticated
  isAuthenticated() {
    return firebaseAuth.isAuthenticated();
  }
}

export default new AuthService();