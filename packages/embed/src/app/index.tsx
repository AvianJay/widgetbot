import { connect } from 'fluent'
import Notifications from 'notify'
import * as React from 'react'
import { IntlProvider } from 'react-intl'
import initiate from 'socket-io'

import Channels from '../components/Channels'
import Messages from '../components/Messages'
import Modal from '../components/Modal'
import ChooseChannel from '../components/Overlays/ChooseChannel'
import AdminAuth from '../components/AdminAuth'

// SocketIO
export default connect()
  .with(({ state, signals, props }) => ({
    screen: state.screen,
    locale: state.url.lang,
    translation: state.translation
  }))
  .toClass(
    props =>
      class App extends React.PureComponent<typeof props> {
        state = {
          isAuthenticated: false,
          adminUserId: null
        }

        componentDidMount() {
          // Check for stored authentication
          const storedUserId = localStorage.getItem('adminUserId')
          if (storedUserId) {
            this.handleAuthenticate(storedUserId)
          }
        }

        handleAuthenticate = (userId: string) => {
          // Store user ID for API requests
          this.setState({ isAuthenticated: true, adminUserId: userId })
          
          // Store in window for API requests
          (window as any).adminUserId = userId
          
          // Initialize socket.io after authentication
          initiate()
        }

        render() {
          const { screen, locale, translation } = this.props
          const { isAuthenticated } = this.state

          // Show admin authentication screen if not authenticated
          if (!isAuthenticated) {
            return <AdminAuth onAuthenticate={this.handleAuthenticate} />
          }

          return (
            <IntlProvider
              locale={locale}
              messages={translation}
              textComponent={React.Fragment}
            >
              <React.Fragment>
                <Modal />
                <Notifications />
                <Channels />
                {screen === 'active-channel' && <Messages />}
                {screen === 'choose-channel' && <ChooseChannel />}
              </React.Fragment>
            </IntlProvider>
          )
        }
      }
  )
