import React from 'react'
import { Link } from 'react-router-dom'
import { SidebarContainer } from './SidebarContainer'
import { UserPanelContainer } from './UserPanelContainer'
import { FooterContainer } from './FooterContainer'
import { Alerts } from './Alerts'
import { Login } from '../users/Login'
import { MaintenanceMessageContainer } from './MaintenanceMessageContainer'

const mainHeaderStyle = {
  right: 'initial'
}
const contentWrapperSidebarClosedStyle = {
  marginLeft: 45
}

const logoSidebarClosedStyle = {
  width: 45
}

const logoStyle = {
  padding: 0
}

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
    const { children, currentUser, loggingIn, locale, isPrint } = this.props

    // Force content wrapper to stay full-width to avoid reflow, that's why
    // the content wrapper's classes depend on (fixed) props instead of state
    let contentStyle = {}
    if (!this.props.sidebarOpen) {
      contentStyle = contentWrapperSidebarClosedStyle
    }

    let conditionalLogoStyle = {
      ...logoStyle
    }

    if (!this.state.sidebarOpen) {
      conditionalLogoStyle = {
        ...conditionalLogoStyle,
        ...logoSidebarClosedStyle
      }
    }

    const alwaysRender = () => (
      <div id='loaded'>
        <div className='dropzone' />
        <span id='locale' className={locale} />
        <Alerts />
        <MaintenanceMessageContainer />
      </div>
    )

    if (currentUser || isPrint) {
      return (
        <div className='wrapper disable-select'>
          <div id='logged-in' />
          <div
            onMouseEnter={this.handleSidebarOpen}
            onMouseLeave={this.handleSidebarClose}>
            <header className='main-header' style={mainHeaderStyle}>
              <Link to='/' className='logo' style={conditionalLogoStyle}>
                <img src='/images/logo.svg' />
              </Link>
            </header>
            {
              currentUser &&
                <SidebarContainer
                  isOpen={this.state.sidebarOpen}
                  userPanel={
                    <UserPanelContainer sidebarOpen={this.state.sidebarOpen} />
                  }
                />
            }
          </div>
          <div className='content-wrapper print-no-margin' style={contentStyle}>
            {children}
          </div>
          <FooterContainer />
          {alwaysRender()}
        </div>
      )
    } else {
      return (
        <div className='wrapper disable-select'>
          <div className='locked-layout'>
            <div className='locked-wrapper'>
              <div className='locked-logo'>
                <img src='/images/logo.svg' />
              </div>
              <div className='locked-content'>
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
