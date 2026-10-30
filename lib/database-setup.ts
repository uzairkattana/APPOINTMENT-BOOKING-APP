import { supabase } from './supabase'

export async function setupChatDatabase() {
  try {
    console.log('Setting up chat database...')

    // 1. Create storage bucket if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some(bucket => bucket.name === 'chat-files')

    if (!bucketExists) {
      console.log('Creating chat-files storage bucket...')
      const { error: bucketError } = await supabase.storage.createBucket('chat-files', {
        public: true,
        allowedMimeTypes: [
          'image/*', 'video/*', 'audio/*', 'application/pdf',
          'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.*',
          'application/zip'
        ],
        fileSizeLimit: 10 * 1024 * 1024 // 10MB
      })

      if (bucketError) {
        console.error('Error creating bucket:', bucketError)
      } else {
        console.log('Bucket created successfully')
      }
    }

    // 2. Add file columns to chat_messages table
    const columns = [
      'file_url TEXT',
      'file_name TEXT', 
      'file_size BIGINT',
      'file_type TEXT'
    ]

    for (const column of columns) {
      const [columnName, columnType] = column.split(' ')
      try {
        const { error } = await supabase.rpc('add_column_if_not_exists', {
          table_name: 'chat_messages',
          column_name: columnName,
          column_type: columnType
        })
        
        if (error && !error.message.includes('already exists')) {
          console.log(`Column ${columnName} might already exist or needs manual addition`)
        }
      } catch (err) {
        console.log(`Column ${columnName} setup:`, err)
      }
    }

    // 3. Update existing messages that look like files
    const { error: updateError } = await supabase
      .from('chat_messages')
      .update({ message_type: 'file' })
      .or('message.ilike.%📎%,message.ilike.%Voice message%')
      .eq('message_type', 'text')

    if (updateError) {
      console.error('Error updating message types:', updateError)
    } else {
      console.log('Updated existing file messages')
    }

    console.log('Database setup completed')
    return true

  } catch (error) {
    console.error('Database setup failed:', error)
    return false
  }
}

// Helper function to check if a message has file data
export function hasFileData(message: any): boolean {
  return !!(message.file_url && message.file_name && message.file_type)
}

// Helper function to get file display info
export function getFileDisplayInfo(message: any) {
  if (!hasFileData(message)) {
    // Fallback for old messages without file data
    if (message.message?.includes('📎')) {
      return {
        icon: '📎',
        name: message.message.replace('📎 ', '').split(' (')[0],
        size: 'Unknown size',
        type: 'unknown',
        url: null
      }
    }
    if (message.message?.includes('Voice message')) {
      return {
        icon: '🎵',
        name: 'Voice message',
        size: 'Unknown size',
        type: 'audio/webm',
        url: null
      }
    }
    return null
  }

  return {
    icon: message.file_type?.startsWith('image/') ? '🖼️' :
          message.file_type?.startsWith('video/') ? '🎥' :
          message.file_type?.startsWith('audio/') ? '🎵' :
          message.file_type?.includes('pdf') ? '📄' :
          message.file_type?.includes('document') ? '📝' :
          message.file_type?.includes('sheet') ? '📊' :
          message.file_type?.includes('presentation') ? '📈' : '📎',
    name: message.file_name,
    size: message.file_size,
    type: message.file_type,
    url: message.file_url
  }
}
