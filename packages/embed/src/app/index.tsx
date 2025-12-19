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

// Check if user is authenticated
const isAuthenticated = () => {
  return !!localStorage.getItem('adminUserId')
}

// Initialize socket.io with admin user ID
const initializeWithAuth = () => {
  const adminUserId = localStorage.getItem('adminUserId')
  if (adminUserId) {
    (window as any).adminUserId = adminUserId
    initiate()
  }
}

// Handle authentication
const handleAuthenticate = (userId: string) => {
  localStorage.setItem('adminUserId', userId)
  ;(window as any).adminUserId = userId
  initiate()
  // Force reload to reinitialize the app
  window.location.reload()
}

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
        componentDidMount() {
          if (isAuthenticated()) {
            initializeWithAuth()
          }
        }

        render() {
          const { screen, locale, translation } = this.props

          // Show admin authentication screen if not authenticated
          if (!isAuthenticated()) {
            return <AdminAuth onAuthenticate={handleAuthenticate} />
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
