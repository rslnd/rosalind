import React from 'react'
import { Link } from 'react-router'
import Blaze from 'meteor/gadicc:blaze-react-component'
import { SidebarContainer } from './SidebarContainer'
import { UserPanelContainer } from './UserPanelContainer'
import { Login } from 'client/ui/users/Login'
import style from './mainLayoutStyle'

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
        <header className={`main-header ${style.mainHeader}`}>
          <Link to="/" className="logo">
            <img src="/images/logo.svg" />
          </Link>
        </header>
        <SidebarContainer userPanel={<UserPanelContainer />} />
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
