import React from 'react'
import classnames from 'classnames'
import { Link } from 'react-router-dom'
import { SidebarContainer } from './SidebarContainer'
import { UserPanelContainer } from './UserPanelContainer'
import { FooterContainer } from './FooterContainer'
import { Alerts } from './Alerts'
import { Login } from 'client/ui/users/Login'
import style from './mainLayoutStyle'

export class MainLayout extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      sidebarOpen: this.props.sidebarOpen
    }

    this.handleSidebarOpen = this.handleSidebarOpen.bind(this)
    this.handleSidebarClose = this.handleSidebarClose.bind(this)
  }

  handleSidebarClose () {
    if (!this.props.sidebarOpen) {
      this.setState({ ...this.state,
        sidebarOpen: false
      })
    }
  }

  handleSidebarOpen () {
    this.setState({ ...this.state,
      sidebarOpen: true
    })
  }

  render () {
    const { children, currentUser, loggingIn, locale } = this.props

    // Force content wrapper to stay full-width to avoid reflow, that's why
    // the content wrapper's classes depend on (fixed) props instead of state
    const content = classnames({
      [ style.contentWrappedSidebarClosed ]: !this.props.sidebarOpen,
      'content-wrapper': true,
      'print-no-margin': true
    })

    const logoClasses = classnames({
      [ style.logoSidebarClosed ]: !this.state.sidebarOpen,
      [ style.logo ]: true,
      'logo': true
    })

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
          <div
            onMouseEnter={this.handleSidebarOpen}
            onMouseLeave={this.handleSidebarClose}>
            <header className={`main-header ${style.mainHeader}`}>
              <Link to="/" className={logoClasses}>
                <img src="/images/logo.svg" />
              </Link>
            </header>
            <SidebarContainer
              isOpen={this.state.sidebarOpen}
              userPanel={
                <UserPanelContainer sidebarOpen={this.state.sidebarOpen} />
              } />
          </div>
          <div className={content}>
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
}
