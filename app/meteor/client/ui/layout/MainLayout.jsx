import React from 'react'
import Blaze from 'meteor/gadicc:blaze-react-component'
import { TAPi18n } from 'meteor/tap:i18n'
import { Topbar } from './topbar'
import { Sidebar } from './sidebar'
import { Login } from 'client/ui/users/login'

export const MainLayout = ({ main, currentUser }) => {
  if (!main) { return null }

  const alwaysRender = () => (
    <div id="loaded" className={TAPi18n.getLanguage()}>
      <Blaze template="sAlert" />
    </div>
  )

  if (currentUser) {
    return (
      <div className="wrapper disable-select">
        <Topbar />
        <Sidebar />
        <div className="content-wrapper print-no-margin">
          {main()}
        </div>
        {alwaysRender()}
      </div>
    )
  } else {
    return (
      <div className="wrapper disable-select">
        <div className="locked-layout">
          <div className="locked-wrapper">
            <div className="locked-logo">
              <img src="/images/logo.svg" />
            </div>
            <div className="locked-content">
              <Login />
            </div>
          </div>
        </div>
        {alwaysRender()}
      </div>
    )
  }
}
