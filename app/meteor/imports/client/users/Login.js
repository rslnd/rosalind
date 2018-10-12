/* global Accounts */
import React from 'react'
import Alert from 'react-s-alert'
import { Button } from 'react-bootstrap'
import { Meteor } from 'meteor/meteor'
import { __ } from '../../i18n'
import { Icon } from '../components/Icon'
import { getClientKey } from '../../util/meteor/getClientKey'
import { isWeakPassword } from '../../api/users/methods'

export class Login extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      name: '',
      password: ''
    }

    this.handleNameChange = this.handleNameChange.bind(this)
    this.handlePasswordChange = this.handlePasswordChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleNameChange (e) {
    this.setState({ ...this.state, name: e.target.value })
  }

  handlePasswordChange (e) {
    this.setState({ ...this.state, password: e.target.value })
  }

  handleSubmit (e) {
    e.preventDefault()

    const username = this.state.name
    const password = this.state.password

    const callback = (err) => {
      if (err) {
        console.warn('[Users] Login failed', err)

        switch (err.error) {
          case 'passwordless-login-disallowed-for-network':
            Alert.error(__('login.passwordlessDisallowedNetworkMessage'))
            break
          case 'passwordless-login-disallowed-for-user':
            Alert.error(__('login.passwordlessDisallowedUserMessage'))
            break
          default:
            console.error(err)
            Alert.error(__('login.failedMessage'))
        }
      } else {
        if (password) {
          isWeakPassword(password).then((weakPassword) => {
            Meteor.call('users/login', { weakPassword }, () => {
              console.log('[Users] Logged in successfully', { weakPassword })
            })
          })
        } else {
          Meteor.call('users/login', {}, () => {
            console.log('[Users] Logged in successfully')
          })
        }
      }
    }

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
    // Note that if a password is supplied, the client key is ignored for login
    // Only passwordless login needs a client key
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
                        <Icon name='refresh' spin />
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
      </div>
    )
  }
}
