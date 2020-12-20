/* global Accounts */
import React from 'react'
import Alert from 'react-s-alert'
import Button from 'react-bootstrap/lib/Button'
import { Meteor } from 'meteor/meteor'
import { __ } from '../../i18n'
import { Icon } from '../components/Icon'
import { getClientKey } from '../../startup/client/native/events'
import { isWeakPassword } from '../../api/users/methods'
import { withTracker } from '../components/withTracker'
import { getClient } from '../../api/clients/methods/getClient'
import { attemptRegistration } from '../../startup/client/native/attemptRegistration'

const composer = () => {
  const client = getClient()
  const defaultUsername = client && client.settings.defaultUsername
  return { defaultUsername }
}

class LoginScreen extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      name: props.defaultUsername || '',
      namePristine: true, // used for asynchronously filling in defaultUsername as given in client settings
      password: ''
    }

    this.handleNameChange = this.handleNameChange.bind(this)
    this.handlePasswordChange = this.handlePasswordChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.defaultUsername && !prevState.name && prevState.namePristine) {
      // dirty side effect to focus password field after username was autofilled
      setTimeout(() => document.getElementById('passwordField').focus(), 30)

      return { name: nextProps.defaultUsername }
    } else {
      return {}
    }
  }

  handleNameChange (e) {
    this.setState({ ...this.state, name: e.target.value, namePristine: false })
  }

  handlePasswordChange (e) {
    this.setState({ ...this.state, password: e.target.value })
  }

  handleSubmit (e, flags = {}) {
    e.preventDefault()

    const username = this.state.name
    const password = this.state.password

    const callback = err => Meteor.defer(async () => {
      if (err) {
        console.warn('[Users] Login failed', err)

        switch (err.error) {
          case 'passwordless-login-disallowed-for-network':
            Alert.error(__('login.passwordlessDisallowedNetworkMessage'))
            break
          case 'passwordless-login-disallowed-for-user':
            Alert.error(__('login.passwordlessDisallowedUserMessage'))
            break
          case 'user-not-allowed-on-client':
            Alert.error(__('login.userNotAllowedOnClientMessage'))
            break
          case 'client-key-required':
            Alert.error(__('login.clientKeyRequired'))
            break
          case 'unknown-client-key':
            // The client key attached to this.connection may be
            // stale, eg. after a reconnect or server restart.
            // Calling clients/register updates the connectionId of the client.
            const clientKey = getClientKey()
            // Retry transparently once, then fail
            if (clientKey && flags && flags.isRetry) {
              Alert.error(__('login.unknownClientKey'))
            } else if (clientKey) {
              await attemptRegistration({ clientKey })
              handleSubmit(e, { isRetry: true }) // try again
            } else {
              Alert.error(__('login.clientKeyRequired'))
            }
            break;
          default:
          console.error(err)
            Alert.error(__('login.failedMessage'))
        }
      } else {
        if (password) {
          isWeakPassword(password).then((weakPassword) => {
            Meteor.call('users/afterLogin', { weakPassword }, () => {
              console.log('[Users] Logged in successfully', { weakPassword })
            })
          })
        } else {
          Meteor.call('users/afterLogin', { weakPassword: null }, () => {
            console.log('[Users] Logged in successfully')
          })
        }

        if (this.props.onLoginSuccess) {
          this.props.onLoginSuccess()
        }
      }
    })

    const clientKey = getClientKey()

    if (username && !password) {
      if (clientKey) {
        Accounts.callLoginMethod({
          methodArguments: [{ user: { username }, clientKey, passwordless: true }],
          userCallback: callback
        })
      } else {
        console.warn('[Users] Login failed: Attempting passwordless login without clientKey')
        Alert.error(__('login.passwordlessNoClientKeyMessage'))
      }
    // There is no way to pass the client key along with the loginWithPassword call. The server will check for a client key be checking this.connection.id
    } else if (username && password) {
      Meteor.loginWithPassword(username, password, callback)
    } else {
      console.warn('[Users] Login failed: No username or password provided')
      Alert.error(__('login.failedMessage'))
    }
  }

  render () {
    return (
      <div>
        <form className='login form-horizontal' onSubmit={this.handleSubmit}>
          <div className='panel panel-default'>
            <div className='panel-heading'>
              <h3 className='panel-title'>{__('login.heading')}</h3>
            </div>
            <div className='panel-body'>
              <div className='form-group'>
                <label className='sr-only' htmlFor='nameField'>{__('login.name')}</label>
                <div className='col-sm-12'>
                  <input
                    name='name'
                    id='nameField'
                    autoFocus={!this.state.name}
                    value={this.state.name}
                    className='input-lg form-control'
                    onChange={this.handleNameChange}
                    placeholder={__('login.form.name.placeholder')} />
                </div>
              </div>
              <div className='form-group'>
                <label className='sr-only' htmlFor='passwordField'>{__('login.password')}</label>
                <div className='col-sm-12'>
                  <input
                    type='password'
                    name='password'
                    id='passwordField'
                    autoFocus={this.state.name && !this.state.password}
                    value={this.state.password}
                    className='input-lg form-control'
                    onChange={this.handlePasswordChange}
                    placeholder={__('login.form.password.placeholder')} />
                </div>
              </div>
              <div className='form-group no-mb'>
                <div className='col-sm-12'>
                  {
                    this.props.loggingIn
                      ? (
                        <Button bsSize='large' block disabled>
                          <Icon name='refresh' spin style={spinFaster} />
                        </Button>
                      ) : <Button bsStyle='success' bsSize='large' type='submit' block>
                        {__('login.button')}
                      </Button>
                  }
                </div>
              </div>
            </div>
          </div>
        </form>
        {/* Just to preload fontawesome */}
        <Icon name='refresh' style={hiddenStyle} />
      </div>
    )
  }
}

const hiddenStyle = {
  position: 'absolute',
  opacity: 0
}

const spinFaster = {
  animationDuration: '1s'
}

export const Login = withTracker(composer)(LoginScreen)
