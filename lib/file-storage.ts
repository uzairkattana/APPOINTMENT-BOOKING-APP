import { supabase } from './supabase'

export interface FileUploadResult {
  url: string
  fileName: string
  fileSize: number
  fileType: string
  path: string
}

export class FileStorageService {
  // Upload file to Supabase Storage
  static async uploadFile(
    file: File,
    bucket: string = 'chat-files',
    folder: string = 'general'
  ): Promise<FileUploadResult> {
    try {
      console.log('Starting file upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        bucket: bucket,
        folder: folder
      })

      // Check if bucket exists first
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
      if (bucketError) {
        console.error('Error listing buckets:', bucketError)
        throw new Error(`Storage error: ${bucketError.message}`)
      }

      const bucketExists = buckets?.some(b => b.name === bucket)
      if (!bucketExists) {
        console.error(`Bucket '${bucket}' does not exist`)
        throw new Error(`Storage bucket '${bucket}' does not exist. Please create it first.`)
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${folder}/${fileName}`

      console.log('Uploading to path:', filePath)

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Supabase upload error:', error)
        throw new Error(`Upload failed: ${error.message}`)
      }

      console.log('Upload successful:', data)

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      console.log('Public URL:', publicUrl)

      return {
        url: publicUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        path: filePath
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      console.error('Supabase error details:', JSON.stringify(error, null, 2))
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Delete file from Supabase Storage
  static async deleteFile(
    filePath: string,
    bucket: string = 'chat-files'
  ): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath])

      if (error) throw error
    } catch (error) {
      console.error('Error deleting file:', error)
      throw new Error('Failed to delete file')
    }
  }

  // Get file type category
  static getFileTypeCategory(fileType: string): 'image' | 'video' | 'audio' | 'document' | 'other' {
    if (fileType.startsWith('image/')) return 'image'
    if (fileType.startsWith('video/')) return 'video'
    if (fileType.startsWith('audio/')) return 'audio'
    if (fileType.includes('pdf') || fileType.includes('document') || 
        fileType.includes('text') || fileType.includes('sheet') || 
        fileType.includes('presentation')) return 'document'
    return 'other'
  }

  // Format file size
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  // Validate file type
  static isValidFileType(fileType: string): boolean {
    const allowedTypes = [
      // Images
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      // Videos
      'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
      // Audio
      'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mpeg',
      // Documents
      'application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      // Archives
      'application/zip', 'application/x-rar-compressed'
    ]
    return allowedTypes.includes(fileType)
  }

  // Get file icon based on type
  static getFileIcon(fileType: string): string {
    const category = this.getFileTypeCategory(fileType)
    switch (category) {
      case 'image': return '🖼️'
      case 'video': return '🎥'
      case 'audio': return '🎵'
      case 'document': return '📄'
      default: return '📎'
    }
  }
}

// Create storage bucket if it doesn't exist
export async function ensureStorageBucket(bucketName: string = 'chat-files') {
  try {
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName)

    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: [
          'image/*', 'video/*', 'audio/*', 'application/pdf',
          'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.*',
          'application/zip'
        ],
        fileSizeLimit: 10 * 1024 * 1024 // 10MB
      })

      if (error) {
        console.error('Error creating bucket:', error)
      }
    }
  } catch (error) {
    console.error('Error ensuring bucket exists:', error)
  }
}
