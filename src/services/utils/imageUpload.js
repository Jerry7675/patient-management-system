// src/services/utils/imageUpload.js
import { 
  ref, 
  uploadBytes, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  listAll 
} from 'firebase/storage';
import { storage } from '../firebase/config';
import { v4 as uuidv4 } from 'uuid';

class ImageUploadService {
  constructor() {
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    this.compressionQuality = 0.8;
  }

  // Validate file before upload
  validateFile(file) {
    const errors = [];

    if (!file) {
      errors.push('No file provided');
      return { isValid: false, errors };
    }

    // Check file type
    if (!this.allowedTypes.includes(file.type)) {
      errors.push('File type not supported. Please upload JPEG, PNG, GIF, or WebP images.');
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      errors.push(`File size exceeds ${this.maxFileSize / (1024 * 1024)}MB limit`);
    }

    // Check if file is actually an image
    if (!file.type.startsWith('image/')) {
      errors.push('File must be an image');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Compress image before upload
  async compressImage(file) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 1920x1080)
        let { width, height } = img;
        const maxWidth = 1920;
        const maxHeight = 1080;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            }));
          },
          file.type,
          this.compressionQuality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // Generate storage path for medical records
  generateStoragePath(patientId, recordId, fileName) {
    const timestamp = new Date().toISOString().split('T')[0];
    const uniqueId = uuidv4().substring(0, 8);
    const fileExtension = fileName.split('.').pop();
    
    return `medical-records/${patientId}/${recordId}/${timestamp}_${uniqueId}.${fileExtension}`;
  }

  // Upload single image with progress callback
  async uploadImage(file, patientId, recordId, onProgress = null) {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Compress image if it's large
      let processedFile = file;
      if (file.size > 1024 * 1024) { // 1MB
        processedFile = await this.compressImage(file);
      }

      // Generate storage path
      const storagePath = this.generateStoragePath(patientId, recordId, file.name);
      const storageRef = ref(storage, storagePath);

      // Upload with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, processedFile);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Progress callback
            if (onProgress) {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress(progress);
            }
          },
          (error) => {
            console.error('Upload error:', error);
            reject(new Error(`Upload failed: ${error.message}`));
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({
                success: true,
                url: downloadURL,
                path: storagePath,
                fileName: file.name,
                size: processedFile.size,
                type: file.type
              });
            } catch (error) {
              reject(new Error(`Failed to get download URL: ${error.message}`));
            }
          }
        );
      });
    } catch (error) {
      console.error('Image upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Upload multiple images
  async uploadMultipleImages(files, patientId, recordId, onProgress = null) {
    try {
      const results = [];
      const totalFiles = files.length;
      let completedFiles = 0;

      for (const file of files) {
        const result = await this.uploadImage(
          file, 
          patientId, 
          recordId, 
          (fileProgress) => {
            // Calculate overall progress
            if (onProgress) {
              const overallProgress = ((completedFiles * 100) + fileProgress) / totalFiles;
              onProgress(overallProgress, completedFiles + 1, totalFiles);
            }
          }
        );

        results.push(result);
        completedFiles++;
      }

      const successfulUploads = results.filter(r => r.success);
      const failedUploads = results.filter(r => !r.success);

      return {
        success: failedUploads.length === 0,
        results,
        successCount: successfulUploads.length,
        failureCount: failedUploads.length,
        uploadedImages: successfulUploads
      };
    } catch (error) {
      console.error('Multiple image upload error:', error);
      return {
        success: false,
        error: error.message,
        results: []
      };
    }
  }

  // Delete image from storage
  async deleteImage(imagePath) {
    try {
      const storageRef = ref(storage, imagePath);
      await deleteObject(storageRef);
      
      return {
        success: true,
        message: 'Image deleted successfully'
      };
    } catch (error) {
      console.error('Delete image error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete multiple images
  async deleteMultipleImages(imagePaths) {
    try {
      const deletePromises = imagePaths.map(path => this.deleteImage(path));
      const results = await Promise.all(deletePromises);
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;

      return {
        success: failureCount === 0,
        successCount,
        failureCount,
        results
      };
    } catch (error) {
      console.error('Delete multiple images error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get all images for a specific record
  async getRecordImages(patientId, recordId) {
    try {
      const folderPath = `medical-records/${patientId}/${recordId}`;
      const folderRef = ref(storage, folderPath);
      
      const listResult = await listAll(folderRef);
      
      const imagePromises = listResult.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          name: itemRef.name,
          path: itemRef.fullPath,
          url: url
        };
      });

      const images = await Promise.all(imagePromises);
      
      return {
        success: true,
        images
      };
    } catch (error) {
      console.error('Get record images error:', error);
      return {
        success: false,
        error: error.message,
        images: []
      };
    }
  }

  // Get image metadata and URL
  async getImageDetails(imagePath) {
    try {
      const storageRef = ref(storage, imagePath);
      const url = await getDownloadURL(storageRef);
      
      return {
        success: true,
        url,
        path: imagePath
      };
    } catch (error) {
      console.error('Get image details error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update image (replace existing)
  async updateImage(oldImagePath, newFile, patientId, recordId, onProgress = null) {
    try {
      // Delete old image first
      const deleteResult = await this.deleteImage(oldImagePath);
      if (!deleteResult.success) {
        console.warn('Failed to delete old image:', deleteResult.error);
      }

      // Upload new image
      const uploadResult = await this.uploadImage(newFile, patientId, recordId, onProgress);
      
      return uploadResult;
    } catch (error) {
      console.error('Update image error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate thumbnail URL (for display optimization)
  generateThumbnailUrl(originalUrl, size = '200x200') {
    // This would work with Firebase Extensions or custom cloud functions
    // For now, return original URL - can be enhanced later
    return originalUrl;
  }

  // Batch operations for record management
  async handleRecordImageOperations(operations) {
    try {
      const results = [];
      
      for (const operation of operations) {
        let result;
        
        switch (operation.type) {
          case 'upload':
            result = await this.uploadImage(
              operation.file,
              operation.patientId,
              operation.recordId,
              operation.onProgress
            );
            break;
            
          case 'delete':
            result = await this.deleteImage(operation.imagePath);
            break;
            
          case 'update':
            result = await this.updateImage(
              operation.oldImagePath,
              operation.newFile,
              operation.patientId,
              operation.recordId,
              operation.onProgress
            );
            break;
            
          default:
            result = { success: false, error: 'Unknown operation type' };
        }
        
        results.push({ operation: operation.type, ...result });
      }
      
      return {
        success: results.every(r => r.success),
        results
      };
    } catch (error) {
      console.error('Batch operations error:', error);
      return {
        success: false,
        error: error.message,
        results: []
      };
    }
  }
}

// Export singleton instance
const imageUploadService = new ImageUploadService();
export default imageUploadService;

// Named exports for common functions
export const {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
  getRecordImages,
  getImageDetails,
  updateImage,
  validateFile
} = imageUploadService;