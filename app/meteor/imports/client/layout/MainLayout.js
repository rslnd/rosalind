import React from 'react'
import { Link } from 'react-router-dom'
import { SidebarContainer } from './SidebarContainer'
import { UserPanelContainer } from './UserPanelContainer'
import { FooterContainer } from './FooterContainer'
import { Alerts } from './Alerts'
import { Login } from '../users/Login'
import { MaintenanceMessageContainer } from './MaintenanceMessageContainer'
import { WaitlistContainer } from '../appointments/waitlist/WaitlistContainer'

const mainHeaderStyle = {
  right: 'initial'
}
const contentWrapperSidebarClosedStyle = {
  marginLeft: 45
}

const contentWrapperTinyStyle = {
  marginLeft: 0,
  transform: 'none',
  WebkitTransform: 'none',
  msTransform: 'none',
  OTransform: 'none'
}

const logoSidebarClosedStyle = {
  width: 45
}

const logoStyle = {
  padding: 0
}

const userPanelStyle = {
  padding: 6,
  color: '#4b646f',
  background: '#1a2226',
  textAlign: 'center'
}

export class MainLayout extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      sidebarForceOpen: false
    }

    this.handleSidebarOpen = this.handleSidebarOpen.bind(this)
    this.handleSidebarClose = this.handleSidebarClose.bind(this)
  }

  handleSidebarClose () {
    this.setState({ ...this.state,
      sidebarForceOpen: false
    })
  }

  handleSidebarOpen () {
    this.setState({ ...this.state,
      sidebarForceOpen: true
    })
  }

  render () {
    const { children, currentUser, loggingIn, locale, isPrint, isTinyLayout } = this.props

    const open = this.props.sidebarOpen || this.state.sidebarForceOpen

    // Force content wrapper to stay full-width to avoid reflow, that's why
    // the content wrapper's classes depend on (fixed) props instead of state
    let contentStyle = {}
    if (!this.props.sidebarOpen) {
      contentStyle = contentWrapperSidebarClosedStyle
    }

    if (isTinyLayout) {
      contentStyle = contentWrapperTinyStyle
    }

    let conditionalLogoStyle = {
      ...logoStyle
    }

    if (!open) {
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
          {
            !isTinyLayout &&
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
                      isOpen={open}
                      userPanel={
                        <UserPanelContainer sidebarOpen={open} />
                      }
                    />
                }
              </div>
          }
          <div className='content-wrapper print-no-margin' style={contentStyle}>
            {
              isTinyLayout
              ? <div>
                <div style={userPanelStyle}>
                  <UserPanelContainer sidebarOpen />
                </div>
                <WaitlistContainer />
              </div>
              : children
            }
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
