import React from 'react'
import Blaze from 'meteor/gadicc:blaze-react-component'
import { TopbarContainer } from './TopbarContainer'
import { SidebarContainer } from './SidebarContainer'
import { Login } from 'client/ui/users/Login'

export const MainLayout = ({ children, currentUser, loggingIn, locale }) => {
  const alwaysRender = () => (
    <div id="loaded">
      <div className="dropzone"></div>
      <span id="locale" className={locale}></span>
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
