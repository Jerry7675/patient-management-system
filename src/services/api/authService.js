// src/services/api/authService.js
import firebaseAuth from '../firebase/auth';
import firestoreService from '../firebase/firestore';
import { USER_ROLES, RECORD_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../utils/constants';

// MISSING CONSTANT ADDED
const USER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended'
};

class AuthService {
  async login(email, password, expectedRole = null) {
    try {
      const result = await firebaseAuth.signIn(email, password);
      if (!result.success) return result;
      const user = result.user;

      // ✅ FIX: null/undefined safety check
      if (!user || !user.uid || !user.role) {
        return { success: false, error: 'Invalid user credentials' };
      }

      // Role/status validation
      if (user.status !== USER_STATUS.APPROVED && user.role !== USER_ROLES.ADMIN) {
        await firebaseAuth.signOut();
        return {
          success: false,
          error: 'Your account is pending admin approval. Please wait for verification.'
        };
      }

      if (expectedRole && user.role !== expectedRole) {
        await firebaseAuth.signOut();
        return {
          success: false,
          error: `Access denied. This login is for ${expectedRole} accounts only.`
        };
      }

      await firestoreService.updateDocument('users', user.uid, {
        lastLogin: new Date(),
        isOnline: true
      });

      return { success: true, user, message: SUCCESS_MESSAGES.LOGIN_SUCCESS || 'Login successful' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async register(userData) {
    const validation = this.validateRegistrationData(userData);
    if (!validation.isValid) {
      return { success: false, error: validation.errors, user: null };
    }

    if (await this.checkEmailExists(userData.email)) {
      return {
        success: false,
        error: ['Email already registered'],
        user: null
      };
    }

    const authResult = await firebaseAuth.signUp(
      userData.email,
      userData.password,
      { displayName: userData.displayName || userData.name }
    );

    if (!authResult.success) return authResult;

    const userProfile = {
      uid: authResult.user.uid,
      email: authResult.user.email,
      name: userData.name,
      displayName: userData.displayName || userData.name,
      role: userData.role,
      status: userData.role === USER_ROLES.PATIENT ? USER_STATUS.APPROVED : USER_STATUS.PENDING,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const profileResult = await firestoreService.setDocument('users', authResult.user.uid, userProfile);

    if (!profileResult.success) {
      await firebaseAuth.deleteUser(authResult.user.uid);
      return profileResult;
    }

    // ✅ FIX: Ensure role-specific document is created
    const roleData = this.prepareRoleSpecificData(userData.role, userData);
    await this.createRoleSpecificDocument(authResult.user.uid, userData.role, roleData);

    // ✅ FIX: Notify admins (optional but defined)
    await this.notifyAdminForApproval(userProfile);

    return {
      success: true,
      user: { ...authResult.user, ...userProfile },
      error: null
    };
  }

  async logout() {
    try {
      const currentUser = firebaseAuth.getCurrentUser();
      if (currentUser) {
        await firestoreService.updateDocument('users', currentUser.uid, {
          isOnline: false,
          lastSeen: new Date()
        });
      }
      await firebaseAuth.signOut();
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async resetPassword(email) {
    try {
      const result = await firebaseAuth.resetPassword(email);
      return result.success
        ? { success: true, message: 'Password reset email sent successfully' }
        : result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getCurrentUser() {
    try {
      const currentUser = firebaseAuth.getCurrentUser();
      if (!currentUser) return { success: false, error: 'No user logged in' };
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
      return { success: false, error: error.message };
    }
  }

  async updateProfile(userId, updateData) {
    try {
      const result = await firestoreService.updateDocument('users', userId, updateData);
      if (result.success) {
        const userData = await firestoreService.getDocument('users', userId);
        if (userData.success) {
          await this.updateRoleSpecificDocument(userId, userData.data.role, updateData);
        }
        return { success: true, message: 'Profile updated successfully' };
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  validateRegistrationData(userData) {
    const errors = [];
    const { email, password, role, displayName } = userData;

    if (!email || !email.includes('@')) errors.push('Valid email is required');
    if (!password || password.length < 6) errors.push('Password must be at least 6 characters');
    if (!displayName || displayName.trim().length < 2) errors.push('Display name required');
    if (!role || !Object.values(USER_ROLES).includes(role)) errors.push('Valid role is required');

    switch (role) {
      case USER_ROLES.PATIENT:
        if (!userData.dateOfBirth) errors.push('Date of birth required');
        if (!userData.phoneNumber) errors.push('Phone number required');
        if (!userData.address) errors.push('Address required');
        break;
      case USER_ROLES.DOCTOR:
        if (!userData.licenseNumber) errors.push('License number required');
        if (!userData.specialization) errors.push('Specialization required');
        if (!userData.phoneNumber) errors.push('Phone number required');
        break;
      case USER_ROLES.MANAGEMENT:
        if (!userData.department) errors.push('Department required');
        if (!userData.employeeId) errors.push('Employee ID required');
        if (!userData.phoneNumber) errors.push('Phone number required');
        break;
      case USER_ROLES.ADMIN:
        if (!userData.adminCode) errors.push('Admin code required');
        break;
    }

    return { isValid: errors.length === 0, errors };
  }

  prepareRoleSpecificData(role, additionalData) {
    const base = {
      displayName: additionalData.displayName,
      phoneNumber: additionalData.phoneNumber || '',
      createdAt: new Date()
    };

    switch (role) {
      case USER_ROLES.PATIENT:
        return {
          ...base,
          dateOfBirth: additionalData.dateOfBirth,
          address: additionalData.address,
          emergencyContact: additionalData.emergencyContact || '',
          bloodGroup: additionalData.bloodGroup || '',
          allergies: additionalData.allergies || []
        };
      case USER_ROLES.DOCTOR:
        return {
          ...base,
          licenseNumber: additionalData.licenseNumber,
          specialization: additionalData.specialization,
          experience: additionalData.experience || 0,
          qualification: additionalData.qualification || '',
          workingHours: additionalData.workingHours || {}
        };
      case USER_ROLES.MANAGEMENT:
        return {
          ...base,
          department: additionalData.department,
          employeeId: additionalData.employeeId,
          position: additionalData.position || '',
          supervisor: additionalData.supervisor || ''
        };
      case USER_ROLES.ADMIN:
        return {
          ...base,
          adminLevel: additionalData.adminLevel || 1,
          permissions: additionalData.permissions || []
        };
      default:
        return base;
    }
  }

  async createRoleSpecificDocument(userId, role, data) {
    const collections = {
      [USER_ROLES.PATIENT]: 'patients',
      [USER_ROLES.DOCTOR]: 'doctors',
      [USER_ROLES.MANAGEMENT]: 'management',
      [USER_ROLES.ADMIN]: 'admins'
    };
    const col = collections[role];
    if (col) await firestoreService.addDocument(col, { userId, ...data });
  }

  async updateRoleSpecificDocument(userId, role, updateData) {
    const collections = {
      [USER_ROLES.PATIENT]: 'patients',
      [USER_ROLES.DOCTOR]: 'doctors',
      [USER_ROLES.MANAGEMENT]: 'management',
      [USER_ROLES.ADMIN]: 'admins'
    };
    const col = collections[role];
    if (col) {
      const docs = await firestoreService.getCollection(col, [
        { type: 'where', field: 'userId', operator: '==', value: userId }
      ]);
      if (docs.success && docs.data.length > 0) {
        await firestoreService.updateDocument(col, docs.data[0].id, updateData);
      }
    }
  }

  async checkEmailExists(email) {
    try {
      const users = await firestoreService.getCollection('users', [
        { type: 'where', field: 'email', operator: '==', value: email }
      ]);
      return users.success && users.data.length > 0;
    } catch {
      return false;
    }
  }

  async notifyAdminForApproval(user) {
    try {
      const admins = await firestoreService.getUsersByRole(USER_ROLES.ADMIN);
      if (admins.success && admins.data.length > 0) {
        const notifications = admins.data.map(admin => ({
          userId: admin.id,
          type: 'user_approval',
          title: 'New User Registration',
          message: `New ${user.role} account registered: ${user.displayName || user.email}`,
          data: {
            userId: user.uid,
            userRole: user.role,
            userEmail: user.email,
            userName: user.displayName
          },
          read: false,
          priority: 'medium'
        }));
        for (const note of notifications) {
          await firestoreService.addDocument('notifications', note);
        }
      }
    } catch (error) {
      console.error('Error sending admin notification:', error);
    }
  }

  onAuthStateChanged(callback) {
    return firebaseAuth.onAuthStateChanged(callback);
  }

  isAuthenticated() {
    return firebaseAuth.isAuthenticated();
  }
}

export default new AuthService();
