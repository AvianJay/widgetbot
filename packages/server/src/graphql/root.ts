import { client } from 'engine'
import messageHistoryService from 'database/message-history'
import { isAdmin } from 'modules/admin-auth'

import server from './models/server'
import stats from './models/stats'

const root = {
  stats,
  server,
  invite: () =>
    `https://discordapp.com/oauth2/authorize?client_id=${
      client.user.id
    }&scope=bot&permissions=537218112`,
  authorize: () =>
    `https://discordapp.com/oauth2/authorize?client_id=${
      client.user.id
    }&scope=bot&permissions=537218112`,
  channelHistory: async (args: { serverId: string; channelId: string; limit?: number }, context: any) => {
    // Check if user is admin
    const userId = context.userId || context.req?.headers['x-user-id']
    if (!userId || !isAdmin(userId)) {
      throw new Error('Admin authentication required to access message history')
    }
    
    return await messageHistoryService.getChannelHistory(
      args.serverId,
      args.channelId,
      args.limit || 100
    )
  },
  serverHistory: async (args: { serverId: string; limit?: number }, context: any) => {
    // Check if user is admin
    const userId = context.userId || context.req?.headers['x-user-id']
    if (!userId || !isAdmin(userId)) {
      throw new Error('Admin authentication required to access message history')
    }
    
    return await messageHistoryService.getServerHistory(
      args.serverId,
      args.limit || 1000
    )
  }
}

export default root
