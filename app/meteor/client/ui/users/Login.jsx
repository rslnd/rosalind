import React from 'react'
import { TAPi18n } from 'meteor/tap:i18n'

export const Login = () => (
  <form className="login form-horizontal">
    <div className="panel panel-default">
      <div className="panel-heading">
        <h3 className="panel-title">{TAPi18n.__('login.heading')}</h3>
      </div>
      <div className="panel-body">
        <div className="form-group">
          <label className="sr-only" for="nameField">{TAPi18n.__('login.name')}</label>
          <div className="col-sm-12">
            <input name="name" id="nameField" className="input-lg form-control" placeholder={TAPi18n.__('login.form.name.placeholder')} />
          </div>
        </div>
        <div className="form-group">
          <label className="sr-only" for="passwordField">{TAPi18n.__('login.password')}</label>
          <div className="col-sm-12">
            <input type="password" name="password" id="passwordField" className="input-lg form-control" placeholder={TAPi18n.__('login.form.password.placeholder')} />
          </div>
        </div>
        <div className="form-group no-mb">
          <div className="col-sm-12">
            <button className="btn btn-success btn-block btn-lg" type="submit">{TAPi18n.__('login.button')}</button>
          </div>
        </div>
      </div>
      <div className="panel-footer">
        <a className="text-muted">{TAPi18n.__('login.help.show')}</a>
      </div>
    </div>
  </form>
)
