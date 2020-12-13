import React from 'react'
import { Link } from 'react-router-dom'
import { SidebarContainer } from './SidebarContainer'
import { sidebarTransitionStyle } from './Sidebar'
import { UserPanelContainer } from './UserPanelContainer'
import { FooterContainer } from './FooterContainer'
import { Alerts } from './Alerts'
import { Login } from '../users/Login'
import { MaintenanceMessageContainer } from './MaintenanceMessageContainer'
import { HelpContainer } from '../availabilities/HelpContainer'
import { ErrorBoundary } from './ErrorBoundary'
import { Loading } from '../components/Loading'
import { Lock } from './Lock'
import { DropZone } from '../patientAppointments/DropZone'
import { handleDrop } from '../../startup/client/dataTransfer'
import { Prompts } from './Prompt'
import { isNative } from 'lodash'
import { getClientKey } from '../../startup/client/native/events'

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
  padding: 0,
  ...sidebarTransitionStyle
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
    const {
      children,
      isLoading,
      currentUser,
      loggingIn,
      handleLoginSuccess,
      handleLogout,
      locale,
      isPrint,
      primaryColor
    } = this.props

    const open = this.props.sidebarOpen || this.state.sidebarForceOpen

    // Force content wrapper to stay full-width to avoid reflow, that's why
    // the content wrapper's classes depend on (fixed) props instead of state
    let contentStyle = {}
    if (!this.props.sidebarOpen) {
      contentStyle = contentWrapperSidebarClosedStyle
    }

    let conditionalLogoStyle = {
      ...logoStyle,
      backgroundColor: primaryColor
    }

    if (!open) {
      conditionalLogoStyle = {
        ...conditionalLogoStyle,
        ...logoSidebarClosedStyle
      }
    }

    const alwaysRender = () => (
      <div id='loaded'>
        <ErrorBoundary>
          <div className='dropzone' />
        </ErrorBoundary>
        <span id='locale' className={locale} />
        <ErrorBoundary>
          <Alerts />
        </ErrorBoundary>
        <ErrorBoundary>
          <Prompts />
        </ErrorBoundary>
        <ErrorBoundary>
          <MaintenanceMessageContainer />
        </ErrorBoundary>
        <ErrorBoundary>
          <Lock />
        </ErrorBoundary>
      </div>
    )

    if (currentUser || isPrint) {
      return (
        <Wrapper>
          <div id='logged-in' />
          <ErrorBoundary>
            <div
              onMouseEnter={this.handleSidebarOpen}
              onMouseLeave={this.handleSidebarClose}>
              <header className='main-header' style={mainHeaderStyle}>
                <Link to='/' className='fixed logo' style={conditionalLogoStyle}>
                  <img src='/logo.svg' />
                </Link>
              </header>
              {
                currentUser &&
                  <SidebarContainer
                    isOpen={open}
                    userPanel={
                      <UserPanelContainer
                        onLogout={handleLogout}
                        sidebarOpen={open}
                      />
                    }
                  />
              }
            </div>
          </ErrorBoundary>
          <div className='content-wrapper print-no-margin' style={contentStyle}>
            {
              isLoading
                ? <Loading />
                : children
            }

            {
              // TODO: Can't close drawer on android/touch
              !window.rslndAndroid &&
                <ErrorBoundary silent>
                  <HelpContainer />
                </ErrorBoundary>
            }
          </div>
          <FooterContainer />
          {alwaysRender()}
        </Wrapper>
      )
    } else {
      return (
        <Wrapper>
          <div className='locked-layout' style={primaryColor ? { backgroundColor: primaryColor } : {}}>
            <div className='locked-wrapper'>
              <div className='locked-logo'>
                <img src='/logo.svg' />
              </div>
              <div className='locked-content'>
                <Login
                  loggingIn={loggingIn}
                  onLoginSuccess={handleLoginSuccess}
                />
              </div>
              <small className='copyright'>
                &copy;&nbsp;{new Date().getFullYear()}&nbsp;
                <a
                 href='https://fixpoint.co.at'
                 title='fixpoint.co.at'
                 style={{ cursor: getClientKey() ? 'pointer' : 'default'}}
                >
                  Fixpoint Systems GmbH
                </a>
                <br />
                {/* only show in browsers, not in native wrapper */}
                {!getClientKey() && <span>
                  <a href='https://fixpoint.co.at/datenschutz'>Datenschutz</a> &middot; <a href='https://fixpoint.co.at/impressum'>Impressum</a>
                </span>}

              </small>
            </div>
          </div>
          {alwaysRender()}
        </Wrapper>
      )
    }
  }
}

const Wrapper = ({ children }) =>
  <DropZone onDrop={handleDrop}>
    {({ ref, droppingStyle, isDropping }) =>
      <div className='wrapper disable-select' ref={ref}>
        {isDropping && <div style={droppingStyle} />}
        {children}
      </div>
    }
  </DropZone>
