import React from 'react'
import { Meteor } from 'meteor/meteor'
import { sAlert } from 'meteor/juliancwirko:s-alert'
import { TAPi18n } from 'meteor/tap:i18n'

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
    this.setState(Object.assign({}, this.state, {
      name: e.target.value
    }))
  }

  handlePasswordChange (e) {
    this.setState(Object.assign({}, this.state, {
      password: e.target.value
    }))
  }

  handleSubmit (e) {
    e.preventDefault()

    const name = this.state.name
    const password = this.state.password
    if (name && password) {
      Meteor.loginWithPassword(name, password, (err) => {
        if (err) {
          console.error('Failed to log in')
          sAlert.error(TAPi18n.__('login.failedMessage'))
          throw err
        } else {
          Meteor.call('users/login', () => {
            console.log('Done after login call')
          })
        }
      })
    } else {
      sAlert.error(TAPi18n.__('login.failedMessage'))
      console.log('Not done at all')
    }
  }

  render () {
    return (
      <form className="login form-horizontal" onSubmit={this.handleSubmit}>
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">{TAPi18n.__('login.heading')}</h3>
          </div>
          <div className="panel-body">
            <div className="form-group">
              <label className="sr-only" for="nameField">{TAPi18n.__('login.name')}</label>
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
              <label className="sr-only" for="passwordField">{TAPi18n.__('login.password')}</label>
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
                    <button className="btn btn-default btn-block btn-lg" disabled="disabled">
                      <i className="fa fa-refresh fa-spin"></i>
                    </button>
                  ) : <button className="btn btn-success btn-block btn-lg" type="submit">{TAPi18n.__('login.button')}</button>
                }
              </div>
            </div>
          </div>
          <div className="panel-footer">
            <a className="text-muted">{TAPi18n.__('login.help.show')}</a>
          </div>
        </div>
      </form>
    )
  }
}
