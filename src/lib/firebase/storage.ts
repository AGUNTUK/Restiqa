'use client'

import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage'
import { getFirebaseStorage } from './config'

export interface UploadResult {
  url: string
  path: string
  error?: string
}

export class FirebaseStorageService {
  private storage = getFirebaseStorage()

  // Upload an image file
  async uploadImage(
    file: File,
    folder: string = 'images',
    fileName?: string
  ): Promise<UploadResult> {
    try {
      const storage = getFirebaseStorage()
      
      // Generate unique filename
      const timestamp = Date.now()
      const extension = file.name.split('.').pop()
      const name = fileName || `${timestamp}-${Math.random().toString(36).substring(7)}`
      const fullPath = `${folder}/${name}.${extension}`

      const storageRef = ref(storage, fullPath)
      
      // Upload the file
      const snapshot = await uploadBytes(storageRef, file)
      
      // Get the download URL
      const url = await getDownloadURL(snapshot.ref)
      
      return {
        url,
        path: fullPath
      }
    } catch (error: any) {
      console.error('Error uploading file:', error)
      return {
        url: '',
        path: '',
        error: error.message || 'Failed to upload file'
      }
    }
  }

  // Upload multiple images
  async uploadImages(
    files: File[],
    folder: string = 'images'
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = []
    
    for (const file of files) {
      const result = await this.uploadImage(file, folder)
      results.push(result)
    }
    
    return results
  }

  // Delete an image
  async deleteImage(path: string): Promise<{ success: boolean; error?: string }> {
    try {
      const storage = getFirebaseStorage()
      const storageRef = ref(storage, path)
      
      await deleteObject(storageRef)
      return { success: true }
    } catch (error: any) {
      console.error('Error deleting file:', error)
      return { success: false, error: error.message }
    }
  }

  // Get all images in a folder
  async getImages(folder: string): Promise<{ urls: string[]; error?: string }> {
    try {
      const storage = getFirebaseStorage()
      const folderRef = ref(storage, folder)
      
      const result = await listAll(folderRef)
      
      const urls: string[] = []
      for (const itemRef of result.items) {
        const url = await getDownloadURL(itemRef)
        urls.push(url)
      }
      
      return { urls }
    } catch (error: any) {
      console.error('Error listing files:', error)
      return { urls: [], error: error.message }
    }
  }

  // Upload property images
  async uploadPropertyImages(
    propertyId: string,
    images: File[]
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = []
    
    for (let i = 0; i < images.length; i++) {
      const result = await this.uploadImage(
        images[i],
        `properties/${propertyId}`,
        `image-${i + 1}`
      )
      results.push(result)
    }
    
    return results
  }

  // Upload user avatar
  async uploadAvatar(
    userId: string,
    file: File
  ): Promise<UploadResult> {
    return this.uploadImage(file, `avatars`, userId)
  }

  // Get placeholder image URL (for fallback)
  getPlaceholderImage(width: number = 400, height: number = 300): string {
    return `https://picsum.photos/${width}/${height}`
  }
}

// Singleton instance
let storageServiceInstance: FirebaseStorageService | null = null

export function getStorageService(): FirebaseStorageService {
  if (!storageServiceInstance) {
    storageServiceInstance = new FirebaseStorageService()
  }
  return storageServiceInstance
}
