import { connect } from 'fluent'
import * as React from 'react'

import { Field, Root } from './elements'

export let input: HTMLTextAreaElement = null

export default connect()
  .with(({ state, signals, props }) => ({
    channel: state.channel.get(),
    activeChannel: state.activeChannel
  }))
  .toClass(
    props =>
      class Chat extends React.PureComponent<typeof props> {
        render() {
          const { channel } = this.props

          return (
            <Root className="chat">
              <Field rows={1} className="field">
                <div style={{
                  padding: '10px',
                  textAlign: 'center',
                  color: '#72767d',
                  fontSize: '14px',
                  fontStyle: 'italic'
                }}>
                  Message Logger - Read Only Mode
                </div>
              </Field>
            </Root>
          )
        }
      }
  )
