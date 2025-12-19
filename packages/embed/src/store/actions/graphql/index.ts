import { Dictionary } from '@cerebral/fluent'
import { BranchContext, Context } from 'fluent'
import { request, GraphQLClient } from 'graphql-request'
import * as _ from 'lodash'
import Log from 'logger'
import * as queries from 'queries'
import { Notification } from 'react-notification-system'
import { subscribe } from 'socket-io'

import { Channel, ChannelResponse, ServerResponse } from '../../../types/responses'
import { getLast } from '../util'

// Helper function to make GraphQL requests with admin authentication
function makeRequest(query: string, variables?: any) {
  const adminUserId = (window as any).adminUserId || localStorage.getItem('adminUserId')
  
  if (adminUserId) {
    const client = new GraphQLClient('/api/graphql', {
      headers: {
        'x-user-id': adminUserId
      }
    })
    return client.request(query, variables)
  }
  
  return request('/api/graphql', query, variables)
}

const serverIssues = {
  level: 'warning',
  title: `Server down`,
  autoDismiss: 0,
  message: 'The server is currently experiencing difficulties',
  action: {
    label: 'Try again',
    callback() {
      location.reload()
    }
  }
}

namespace GraphQL {
  /**
   * Fetches a server (optionally with a selected channel)
   */
  export async function fetchServer({
    state,
    props,
    path
  }: BranchContext<{
    success: ServerResponse
    error: {
      notification: Notification[]
    }
  }>) {
    const loadMessages = !!state.activeChannel

    // If a channel is selected, load its messages
    // else just load the server info
    const variables = {
      server: state.server.id,
      ...(loadMessages
        ? {
            channel: state.activeChannel,
            withChannel: true
          }
        : {
            channel: null,
            withChannel: false
          })
    }

    Log('info', `Fetching server`, state.server.id, ...(loadMessages ? [`with messages on channel`, state.activeChannel] : []))

    try {
      const response = (await makeRequest(queries.server, variables)) as ServerResponse

      if (loadMessages) {
        subscribe(state.activeChannel)
      }

      return path.success(response)
    } catch ({ response }) {
      const errors =
        response && response.errors
          ? response.errors.map(error => ({
              level: 'error',
              title: 'An error occurred while loading this embed (loading messages)',
              message: error.message,
              autoDismiss: 0
            }))
          : serverIssues

      if (response && response.errors) {
        console.log(response)
        response.errors.map(error => console.error(error))
      }

      return path.error({ notification: errors })
    }
  }

  /**
   * Fetches a channel
   */
  export async function fetchChannel({
    state,
    props,
    path
  }: BranchContext<{
    success: { channel: Channel }
    error: {
      notification: Notification[]
    }
  }>) {
    const channel = state.channels.get(state.activeChannel)

    if (channel && channel.messages) {
      subscribe(state.activeChannel)
      // Cached
      return path.success({ channel })
    }

    // Uncached

    try {
      const response = (await makeRequest(queries.channel, {
        server: state.server.id,
        channel: state.activeChannel
      })) as ChannelResponse

      subscribe(state.activeChannel)

      return path.success({
        channel: {
          id: state.activeChannel,
          ...response.server.channel,
          messages: Dictionary(_.keyBy(response.server.channel.messages, 'id'))
        }
      })
    } catch ({ response }) {
      const errors =
        response && response.errors
          ? response.errors.map(error => ({
              level: 'error',
              title: 'An error occurred while loading this embed (fetching channels)',
              message: error.message,
              autoDismiss: 0
            }))
          : serverIssues

      return path.error({ notification: errors })
    }
  }

  /**
   * Updates a channel in the store
   */
  export function updateChannel({ state, props }: Context<{ channel: Channel }>) {
    const channel = props.channel.id
    const prev = state.channels.get(channel)

    state.channels.set(channel, {
      ...prev,
      lastSeenID: getLast(props.channel.messages.values()),
      name: props.channel.name,
      topic: props.channel.topic,
      messages: props.channel.messages,
      permissions: prev && prev.permissions // carry over cached permissions, instead of re-fetching them from the server.
    })
  }

  /**
   * Converts a GraphQL response into the store
   */
  export function store({ state, props }: Context<ServerResponse>) {
    const { server } = props

    if (server.name) {
      // Merge the server info
      state.server = {
        ...state.server,
        name: server.name,
        icon: server.icon,
        memberCount: server.memberCount
      }
    }

    if (server.theme) {
      state.theme = {
        ...state.theme,
        ...server.theme
      }
    }

    server.channels.forEach(channel => {
      state.channels.set(channel.id, {
        unread: false,
        lastSeenID: null,
        ...(state.channels.get(channel.id) as any),
        ...(channel.id === state.activeChannel
          ? {
              lastSeenID: getLast(server.channel.messages),
              ...channel,
              ...server.channel,
              messages: Dictionary(_.keyBy(server.channel.messages, 'id'))
            }
          : channel)
      })
    })
  }
}

export default GraphQL
