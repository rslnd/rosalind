import React from 'react'
import { Link } from 'react-router'
import { SidebarContainer } from './SidebarContainer'
import { UserPanelContainer } from './UserPanelContainer'
import { FooterContainer } from './FooterContainer'
import { Alerts } from './Alerts'
import { Login } from 'client/ui/users/Login'
import style from './mainLayoutStyle'

export const MainLayout = ({ children, currentUser, loggingIn, locale, customerName, printedStamp }) => {
  const alwaysRender = () => (
    <div id="loaded">
      <div className="dropzone"></div>
      <span id="locale" className={locale}></span>
      <Alerts />
    </div>
  )

  if (currentUser) {
    return (
      <div className="wrapper disable-select">
        <div id="logged-in"></div>
        <header className={`main-header ${style.mainHeader}`}>
          <Link to="/" className="logo">
            <img src="/images/logo.svg" />
          </Link>
        </header>
        <SidebarContainer userPanel={<UserPanelContainer />} />
        <div className="content-wrapper print-no-margin">
          {children}
        </div>
        <FooterContainer />
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
