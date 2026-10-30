// Media Storage Service - Handle file uploads, downloads, and storage
// Integrates with Supabase Storage for media files

import { supabase } from './supabase'

export interface MediaFile {
  id: string
  name: string
  type: 'voice' | 'video' | 'image' | 'file'
  mimeType: string
  size: number
  url: string
  duration?: number
  thumbnail?: string
  userId: string
  createdAt: string
  expiresAt?: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

class MediaStorageService {
  private static instance: MediaStorageService
  private readonly BUCKET_NAME = 'chat-media'
  private readonly MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
  private readonly ALLOWED_MIME_TYPES = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
    audio: ['audio/webm', 'audio/ogg', 'audio/wav', 'audio/mpeg'],
    document: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  }

  public static getInstance(): MediaStorageService {
    if (!MediaStorageService.instance) {
      MediaStorageService.instance = new MediaStorageService()
    }
    return MediaStorageService.instance
  }

  // Validate file before upload
  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds ${this.formatFileSize(this.MAX_FILE_SIZE)} limit`
      }
    }

    // Check MIME type
    const isAllowed = Object.values(this.ALLOWED_MIME_TYPES).some(types => 
      types.includes(file.type)
    )

    if (!isAllowed) {
      return {
        valid: false,
        error: 'File type not supported'
      }
    }

    return { valid: true }
  }

  // Get media type from MIME type
  getMediaType(mimeType: string): 'voice' | 'video' | 'image' | 'file' {
    if (this.ALLOWED_MIME_TYPES.image.includes(mimeType)) return 'image'
    if (this.ALLOWED_MIME_TYPES.video.includes(mimeType)) return 'video'
    if (this.ALLOWED_MIME_TYPES.audio.includes(mimeType)) return 'voice'
    return 'file'
  }

  // Generate unique file name
  generateFileName(file: File, userId: string): string {
    const timestamp = new Date().getTime()
    const randomString = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop() || ''
    return `${userId}/${timestamp}-${randomString}.${extension}`
  }

  // Upload file to Supabase Storage
  async uploadFile(
    file: File, 
    userId: string, 
    onProgress?: (progress: UploadProgress) => void
  ): Promise<MediaFile> {
    const validation = this.validateFile(file)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    const fileName = this.generateFileName(file, userId)
    const mediaType = this.getMediaType(file.type)

    try {
      // Upload file with progress tracking
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Simulate progress for now (Supabase doesn't provide progress callbacks)
      if (onProgress) {
        const progressInterval = setInterval(() => {
          const progress = Math.random() * 100
          onProgress({
            loaded: Math.floor((progress / 100) * file.size),
            total: file.size,
            percentage: Math.floor(progress)
          })
          
          if (progress >= 100) {
            clearInterval(progressInterval)
          }
        }, 200)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName)

      // Generate thumbnail for videos
      let thumbnail: string | undefined
      if (mediaType === 'video') {
        thumbnail = await this.generateVideoThumbnail(publicUrl)
      }

      // Get duration for audio/video files
      let duration: number | undefined
      if (mediaType === 'voice' || mediaType === 'video') {
        duration = await this.getMediaDuration(publicUrl, mediaType)
      }

      // Create media file record
      const mediaFile: MediaFile = {
        id: data.id || data.path?.split('/').pop() || '',
        name: file.name,
        type: mediaType,
        mimeType: file.type,
        size: file.size,
        url: publicUrl,
        duration,
        thumbnail,
        userId,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      }

      // Save to database
      await this.saveMediaRecord(mediaFile)

      return mediaFile

    } catch (error) {
      console.error('Upload failed:', error)
      throw new Error(`Upload failed: ${error}`)
    }
  }

  // Upload voice recording from blob
  async uploadVoiceRecording(
    audioBlob: Blob, 
    userId: string,
    duration: number,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<MediaFile> {
    const fileName = this.generateFileName(
      new File([audioBlob], 'voice.webm', { type: 'audio/webm' }), 
      userId
    )

    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, audioBlob, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Simulate progress for now
      if (onProgress) {
        const progressInterval = setInterval(() => {
          const progress = Math.random() * 100
          onProgress({
            loaded: Math.floor((progress / 100) * audioBlob.size),
            total: audioBlob.size,
            percentage: Math.floor(progress)
          })
          
          if (progress >= 100) {
            clearInterval(progressInterval)
          }
        }, 200)
      }

      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName)

      const mediaFile: MediaFile = {
        id: data.id || data.path?.split('/').pop() || '',
        name: `Voice message ${new Date().toLocaleTimeString()}`,
        type: 'voice',
        mimeType: 'audio/webm',
        size: audioBlob.size,
        url: publicUrl,
        duration,
        userId,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }

      await this.saveMediaRecord(mediaFile)

      return mediaFile

    } catch (error) {
      console.error('Voice upload failed:', error)
      throw new Error(`Voice upload failed: ${error}`)
    }
  }

  // Download file
  async downloadFile(mediaFile: MediaFile): Promise<void> {
    try {
      const response = await fetch(mediaFile.url)
      if (!response.ok) {
        throw new Error('Download failed')
      }

      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = mediaFile.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(downloadUrl)

    } catch (error) {
      console.error('Download failed:', error)
      throw new Error(`Download failed: ${error}`)
    }
  }

  // Delete file
  async deleteFile(mediaFile: MediaFile): Promise<void> {
    try {
      // Extract file path from URL
      const url = new URL(mediaFile.url)
      const filePath = url.pathname.split('/').pop()

      if (!filePath) {
        throw new Error('Invalid file path')
      }

      // Delete from storage
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath])

      if (error) throw error

      // Delete from database
      await this.deleteMediaRecord(mediaFile.id)

    } catch (error) {
      console.error('Delete failed:', error)
      throw new Error(`Delete failed: ${error}`)
    }
  }

  // Get media file info
  async getMediaFile(id: string): Promise<MediaFile | null> {
    try {
      const { data, error } = await supabase
        .from('media_files')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data

    } catch (error) {
      console.error('Get media failed:', error)
      return null
    }
  }

  // Get user's media files
  async getUserMediaFiles(userId: string): Promise<MediaFile[]> {
    try {
      const { data, error } = await supabase
        .from('media_files')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []

    } catch (error) {
      console.error('Get user media failed:', error)
      return []
    }
  }

  // Clean up expired files
  async cleanupExpiredFiles(): Promise<void> {
    try {
      const { error } = await supabase
        .from('media_files')
        .delete()
        .lt('expires_at', new Date().toISOString())

      if (error) throw error

      console.log('Cleaned up expired media files')

    } catch (error) {
      console.error('Cleanup failed:', error)
    }
  }

  // Save media record to database
  private async saveMediaRecord(mediaFile: MediaFile): Promise<void> {
    try {
      const { error } = await supabase
        .from('media_files')
        .insert({
          id: mediaFile.id,
          name: mediaFile.name,
          type: mediaFile.type,
          mime_type: mediaFile.mimeType,
          size: mediaFile.size,
          url: mediaFile.url,
          duration: mediaFile.duration,
          thumbnail: mediaFile.thumbnail,
          user_id: mediaFile.userId,
          created_at: mediaFile.createdAt,
          expires_at: mediaFile.expiresAt
        })

      if (error) throw error

    } catch (error) {
      console.error('Save media record failed:', error)
      throw error
    }
  }

  // Delete media record from database
  private async deleteMediaRecord(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('media_files')
        .delete()
        .eq('id', id)

      if (error) throw error

    } catch (error) {
      console.error('Delete media record failed:', error)
      throw error
    }
  }

  // Generate video thumbnail
  private async generateVideoThumbnail(videoUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.src = videoUrl
      video.crossOrigin = 'anonymous'

      video.onloadeddata = () => {
        video.currentTime = 1 // Seek to 1 second
      }

      video.onseeked = () => {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const thumbnail = canvas.toDataURL('image/jpeg', 0.8)
          resolve(thumbnail)
        } else {
          reject(new Error('Failed to generate thumbnail'))
        }
      }

      video.onerror = () => {
        reject(new Error('Failed to load video for thumbnail'))
      }
    })
  }

  // Get media duration
  private async getMediaDuration(mediaUrl: string, mediaType: 'voice' | 'video'): Promise<number> {
    return new Promise((resolve, reject) => {
      const media = mediaType === 'video' ? 
        document.createElement('video') : 
        document.createElement('audio')
      
      media.src = mediaUrl
      media.preload = 'metadata'

      media.onloadedmetadata = () => {
        resolve(media.duration)
      }

      media.onerror = () => {
        reject(new Error('Failed to load media metadata'))
      }
    })
  }

  // Format file size
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Initialize storage bucket (run once)
  async initializeStorage(): Promise<void> {
    try {
      // Check if bucket exists, create if not
      const { data: buckets } = await supabase.storage.listBuckets()
      const bucketExists = buckets?.some(bucket => bucket.name === this.BUCKET_NAME)

      if (!bucketExists) {
        const { error } = await supabase.storage.createBucket(this.BUCKET_NAME, {
          public: true,
          fileSizeLimit: this.MAX_FILE_SIZE,
          allowedMimeTypes: Object.values(this.ALLOWED_MIME_TYPES).flat()
        })

        if (error) throw error
      }

      // Create media_files table if not exists
      const { error } = await supabase.rpc('create_media_files_table', {})
      if (error && error.code !== 'PGRST116') { // Ignore if table already exists
        console.warn('Media files table creation skipped:', error)
      }

    } catch (error) {
      console.error('Storage initialization failed:', error)
    }
  }
}

// Export singleton instance
export const mediaStorage = MediaStorageService.getInstance()

// Auto-cleanup expired files every hour
if (typeof window !== 'undefined') {
  setInterval(() => {
    mediaStorage.cleanupExpiredFiles()
  }, 60 * 60 * 1000) // 1 hour
}
