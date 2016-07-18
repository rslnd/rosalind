import React from 'react'
import Blaze from 'meteor/gadicc:blaze-react-component'
import { TAPi18n } from 'meteor/tap:i18n'
import { TopbarContainer } from './TopbarContainer'
import { SidebarContainer } from './SidebarContainer'
import { Login } from 'client/ui/users/Login'

export const MainLayout = ({ children, currentUser, loggingIn }) => {
  const alwaysRender = () => (
    <div id="loaded" className={TAPi18n.getLanguage()}>
      <Blaze template="sAlert" />
    </div>
  )

  if (currentUser) {
    return (
      <div className="wrapper disable-select">
        <TopbarContainer />
        <SidebarContainer />
        <div className="content-wrapper print-no-margin">
          {children}
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
              <Login loggingIn={loggingIn} />
            </div>
          </div>
        </div>
        {alwaysRender()}
      </div>
    )
  }
}
