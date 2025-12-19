import { store } from 'database'
import MessageHistory from 'database/models/MessageHistory'
import Message from '../../types/message'
import logger, { Meta } from 'logger'

const meta = Meta('MessageHistory')

class MessageHistoryService {
  /**
   * Logs a new message to the history database
   */
  async logMessage(message: Message, serverId: string, channelId: string, channelName: string) {
    try {
      const messageHistory: MessageHistory = {
        messageId: message.id,
        channelId,
        serverId,
        channelName,
        author: {
          id: message.author.id,
          name: message.author.name,
          avatar: message.author.avatar,
          type: message.author.type
        },
        contentHistory: [
          {
            content: message.content,
            timestamp: message.timestamp,
            editedAt: message.editedAt
          }
        ],
        currentContent: message.content,
        createdAt: message.timestamp,
        embeds: message.embeds,
        attachments: message.attachment ? [message.attachment] : [],
        reactions: message.reactions,
        mentions: message.mentions,
        type: message.type
      }

      await store.messageHistory.insert(messageHistory)
      logger.verbose(`Message logged to history`, {
        ...meta('logMessage'),
        messageId: message.id,
        channelId,
        serverId
      })
    } catch (error) {
      logger.error(`Failed to log message`, {
        ...meta('logMessage'),
        error,
        messageId: message.id
      })
    }
  }

  /**
   * Logs a message edit to the history database
   */
  async logMessageEdit(message: Message, serverId: string, channelId: string, channelName: string) {
    try {
      const existingMessage = await store.messageHistory.findOne<MessageHistory>({
        messageId: message.id,
        serverId,
        channelId
      })

      if (existingMessage) {
        // Add to edit history
        existingMessage.contentHistory.push({
          content: message.content,
          timestamp: Date.now(),
          editedAt: message.editedAt
        })
        existingMessage.currentContent = message.content
        existingMessage.embeds = message.embeds
        existingMessage.reactions = message.reactions

        await store.messageHistory.update(
          { messageId: message.id, serverId, channelId },
          existingMessage
        )

        logger.verbose(`Message edit logged to history`, {
          ...meta('logMessageEdit'),
          messageId: message.id,
          channelId,
          serverId,
          editCount: existingMessage.contentHistory.length
        })
      } else {
        // Message not in history yet, log it as new
        await this.logMessage(message, serverId, channelId, channelName)
      }
    } catch (error) {
      logger.error(`Failed to log message edit`, {
        ...meta('logMessageEdit'),
        error,
        messageId: message.id
      })
    }
  }

  /**
   * Logs a message deletion to the history database
   */
  async logMessageDeletion(messageId: string, serverId: string, channelId: string, deletedBy?: string) {
    try {
      const existingMessage = await store.messageHistory.findOne<MessageHistory>({
        messageId,
        serverId,
        channelId
      })

      if (existingMessage) {
        await store.messageHistory.update(
          { messageId, serverId, channelId },
          {
            $set: {
              deletedAt: Date.now(),
              deletedBy: deletedBy || 'unknown'
            }
          }
        )

        logger.verbose(`Message deletion logged to history`, {
          ...meta('logMessageDeletion'),
          messageId,
          channelId,
          serverId
        })
      }
    } catch (error) {
      logger.error(`Failed to log message deletion`, {
        ...meta('logMessageDeletion'),
        error,
        messageId
      })
    }
  }

  /**
   * Retrieves message history for a channel
   */
  async getChannelHistory(serverId: string, channelId: string, limit: number = 100) {
    try {
      const messages = await store.messageHistory.find<MessageHistory>({ serverId, channelId })
      
      // Sort by createdAt descending and limit
      return messages
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit)
    } catch (error) {
      logger.error(`Failed to get channel history`, {
        ...meta('getChannelHistory'),
        error,
        channelId,
        serverId
      })
      return []
    }
  }

  /**
   * Retrieves all history for a server
   */
  async getServerHistory(serverId: string, limit: number = 1000) {
    try {
      const messages = await store.messageHistory.find<MessageHistory>({ serverId })
      
      // Sort by createdAt descending and limit
      return messages
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit)
    } catch (error) {
      logger.error(`Failed to get server history`, {
        ...meta('getServerHistory'),
        error,
        serverId
      })
      return []
    }
  }
}

export default new MessageHistoryService()
