// src/services/firebase/storage.js
import { 
  ref, 
  uploadBytes, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  listAll 
} from 'firebase/storage';
import { storage } from './config';

class StorageService {
  // Upload file with progress tracking
  async uploadFile(file, path, onProgress = null) {
    try {
      const storageRef = ref(storage, path);
      
      if (onProgress) {
        // Use resumable upload for progress tracking
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        return new Promise((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              // Progress tracking
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress(progress);
            },
            (error) => {
              reject({
                success: false,
                error: error.message
              });
            },
            async () => {
              // Upload completed successfully
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve({
                  success: true,
                  downloadURL,
                  path,
                  fullPath: uploadTask.snapshot.ref.fullPath
                });
              } catch (error) {
                reject({
                  success: false,
                  error: error.message
                });
              }
            }
          );
        });
      } else {
        // Simple upload without progress tracking
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return {
          success: true,
          downloadURL,
          path,
          fullPath: snapshot.ref.fullPath
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(files, basePath, onProgress = null) {
    try {
      const uploadPromises = files.map((file, index) => {
        const fileName = `${Date.now()}_${index}_${file.name}`;
        const filePath = `${basePath}/${fileName}`;
        
        return this.uploadFile(file, filePath, onProgress ? 
          (progress) => onProgress(index, progress) : null
        );
      });

      const results = await Promise.all(uploadPromises);
      
      const successfulUploads = results.filter(result => result.success);
      const failedUploads = results.filter(result => !result.success);

      return {
        success: failedUploads.length === 0,
        successfulUploads,
        failedUploads,
        totalFiles: files.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get download URL for existing file
  async getDownloadURL(path) {
    try {
      const storageRef = ref(storage, path);
      const downloadURL = await getDownloadURL(storageRef);
      
      return {
        success: true,
        downloadURL
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete file
  async deleteFile(path) {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete multiple files
  async deleteMultipleFiles(paths) {
    try {
      const deletePromises = paths.map(path => this.deleteFile(path));
      const results = await Promise.all(deletePromises);
      
      const successfulDeletes = results.filter(result => result.success);
      const failedDeletes = results.filter(result => !result.success);

      return {
        success: failedDeletes.length === 0,
        successfulDeletes: successfulDeletes.length,
        failedDeletes: failedDeletes.length,
        totalFiles: paths.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // List all files in a directory
  async listFiles(path) {
    try {
      const storageRef = ref(storage, path);
      const result = await listAll(storageRef);
      
      const files = await Promise.all(
        result.items.map(async (itemRef) => {
          const downloadURL = await getDownloadURL(itemRef);
          return {
            name: itemRef.name,
            fullPath: itemRef.fullPath,
            downloadURL
          };
        })
      );

      return {
        success: true,
        files,
        folders: result.prefixes.map(folderRef => folderRef.fullPath)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Specific methods for Patient Management System

  // Upload medical report image
  async uploadMedicalReport(file, patientId, recordId, onProgress = null) {
    const path = `medical-reports/${patientId}/${recordId}/${Date.now()}_${file.name}`;
    return this.uploadFile(file, path, onProgress);
  }

  // Upload multiple medical reports
  async uploadMedicalReports(files, patientId, recordId, onProgress = null) {
    const basePath = `medical-reports/${patientId}/${recordId}`;
    return this.uploadMultipleFiles(files, basePath, onProgress);
  }

  // Upload prescription image
  async uploadPrescription(file, patientId, recordId, onProgress = null) {
    const path = `prescriptions/${patientId}/${recordId}/${Date.now()}_${file.name}`;
    return this.uploadFile(file, path, onProgress);
  }

  // Upload user profile image
  async uploadProfileImage(file, userId, onProgress = null) {
    const path = `profile-images/${userId}/${Date.now()}_${file.name}`;
    return this.uploadFile(file, path, onProgress);
  }

  // Get patient's medical reports
  async getPatientReports(patientId, recordId = null) {
    const path = recordId ? 
      `medical-reports/${patientId}/${recordId}` : 
      `medical-reports/${patientId}`;
    return this.listFiles(path);
  }

  // Delete patient's medical reports
  async deletePatientReports(patientId, recordId) {
    try {
      const reportsResult = await this.getPatientReports(patientId, recordId);
      
      if (reportsResult.success && reportsResult.files.length > 0) {
        const paths = reportsResult.files.map(file => file.fullPath);
        return this.deleteMultipleFiles(paths);
      }
      
      return { success: true, message: 'No files to delete' };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Validate file type and size
  validateFile(file, allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'], maxSize = 5 * 1024 * 1024) { // 5MB default
    const errors = [];

    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    if (file.size > maxSize) {
      errors.push(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${(maxSize / 1024 / 1024).toFixed(2)}MB`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate multiple files
  validateFiles(files, allowedTypes, maxSize) {
    const results = files.map(file => ({
      file,
      validation: this.validateFile(file, allowedTypes, maxSize)
    }));

    const validFiles = results.filter(result => result.validation.isValid).map(result => result.file);
    const invalidFiles = results.filter(result => !result.validation.isValid);

    return {
      validFiles,
      invalidFiles,
      allValid: invalidFiles.length === 0
    };
  }
}

export default new StorageService();