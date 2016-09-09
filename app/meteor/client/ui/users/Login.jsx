/* global Accounts */
import React from 'react'
import { process as server } from 'meteor/clinical:env'
import { Modal, Button } from 'react-bootstrap'
import { Meteor } from 'meteor/meteor'
import { sAlert } from 'meteor/juliancwirko:s-alert'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from 'client/ui/components/Icon'

export class Login extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      name: '',
      password: '',
      showLoginHelpModal: false
    }

    this.handleNameChange = this.handleNameChange.bind(this)
    this.handlePasswordChange = this.handlePasswordChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleOpenLoginHelpModal = this.handleOpenLoginHelpModal.bind(this)
    this.handleCloseLoginHelpModal = this.handleCloseLoginHelpModal.bind(this)
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
            sAlert.error(TAPi18n.__('login.passwordlessDisallowedNetworkMessage'))
            break
          case 'passwordless-login-disallowed-for-user':
            sAlert.error(TAPi18n.__('login.passwordlessDisallowedUserMessage'))
            break
          default:
            sAlert.error(TAPi18n.__('login.failedMessage'))
        }
      } else {
        Meteor.call('users/login', () => {
          console.log('[Users] Logged in successfully')
        })
      }
    }

    if (username && !password) {
      Accounts.callLoginMethod({
        methodArguments: [{ username, passwordless: true }],
        userCallback: callback
      })
    } else if (username && password) {
      Meteor.loginWithPassword(username, password, callback)
    } else {
      console.warn('[Users] Login failed: No username or password provided')
      sAlert.error(TAPi18n.__('login.failedMessage'))
    }
  }

  handleOpenLoginHelpModal () {
    this.setState({ ...this.state, showLoginHelpModal: true })
  }

  handleCloseLoginHelpModal () {
    this.setState({ ...this.state, showLoginHelpModal: false })
  }

  render () {
    return (
      <div>
        <form className="login form-horizontal" onSubmit={this.handleSubmit}>
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">{TAPi18n.__('login.heading')}</h3>
            </div>
            <div className="panel-body">
              <div className="form-group">
                <label className="sr-only" htmlFor="nameField">{TAPi18n.__('login.name')}</label>
                <div className="col-sm-12">
                  <input
                    name="name"
                    id="nameField"
                    className="input-lg form-control"
                    onChange={this.handleNameChange}
                    placeholder={TAPi18n.__('login.form.name.placeholder')} />
                </div>
              </div>
              <div className="form-group">
                <label className="sr-only" htmlFor="passwordField">{TAPi18n.__('login.password')}</label>
                <div className="col-sm-12">
                  <input
                    type="password"
                    name="password"
                    id="passwordField"
                    className="input-lg form-control"
                    onChange={this.handlePasswordChange}
                    placeholder={TAPi18n.__('login.form.password.placeholder')} />
                </div>
              </div>
              <div className="form-group no-mb">
                <div className="col-sm-12">
                  {
                    this.props.loggingIn
                    ? (
                      <Button bsSize="large" block disabled>
                        <Icon name="refresh" spin />
                      </Button>
                    ) : <Button bsStyle="success" bsSize="large" type="submit" block>
                      {TAPi18n.__('login.button')}
                    </Button>
                  }
                </div>
              </div>
            </div>
            <div className="panel-footer">
              <a onClick={this.handleOpenLoginHelpModal} className="text-muted">{TAPi18n.__('login.help.show')}</a>
            </div>
          </div>
        </form>

        <Modal show={this.state.showLoginHelpModal} onHide={this.handleCloseLoginHelpModal}>
          <Modal.Header closeButton>
            <Modal.Title>{TAPi18n.__('login.help.title')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{TAPi18n.__('login.help.body')}</p>
          </Modal.Body>
          <Modal.Footer>
            <span className="text-very-muted pull-left">
              {
                (server.env.COMMIT_HASH && server.env.COMMIT_HASH.substring(0, 7)) || server.env.TEST && 'Test' || 'Development'
              }
              &nbsp;
              {
                (server.env.BUILD_NUMBER && `build ${server.env.BUILD_NUMBER}`)
              }
            </span>
            <Button onClick={this.handleCloseLoginHelpModal} bsStyle="primary" pullRight>{TAPi18n.__('login.help.ok')}</Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}
