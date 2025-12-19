interface MessageHistory {
  // Original message ID from Discord
  messageId: string
  
  // Channel ID where the message was sent
  channelId: string
  
  // Server/Guild ID
  serverId: string
  
  // Channel name (preserved even if channel is deleted)
  channelName: string
  
  // Author information
  author: {
    id: string
    name: string
    avatar: string
    type: 'bot' | 'sysadmin' | 'guest' | 'member'
  }
  
  // Message content history - array of edits
  contentHistory: Array<{
    content: string
    timestamp: number
    editedAt?: number
  }>
  
  // Current message content
  currentContent: string
  
  // Message creation timestamp
  createdAt: number
  
  // Message deletion info (if deleted)
  deletedAt?: number
  deletedBy?: string
  
  // Message embeds, attachments, etc.
  embeds?: any[]
  attachments?: any[]
  reactions?: any[]
  
  // Metadata
  mentions?: any
  type?: number
}

export default MessageHistory
