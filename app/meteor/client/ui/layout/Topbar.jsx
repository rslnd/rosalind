import React from 'react'
import { Link } from 'react-router'
import { Button } from 'react-bootstrap'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from 'client/ui/components/Icon'

export class Topbar extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      userMenuOpen: false
    }

    this.toggleUserMenu = this.toggleUserMenu.bind(this)
  }

  toggleUserMenu () {
    this.setState({
      ...this.state,
      userMenuOpen: !this.state.userMenuOpen
    })
  }

  render () {
    return (
      <header className="main-header">
        <Link to="/" className="logo">
          <img src="/images/logo.svg" />
        </Link>

        <nav className="navbar navbar-static-top">
          <ul className="nav navbar-nav navbar-left">
            <li>
              <a onClick={this.props.toggleSidebar}>
                <i className="fa fa-bars"></i>
              </a>
            </li>
          </ul>

          <div className="navbar-custom-menu">
            <ul className="nav navbar-nav">
              <li className={`dropdown user user-menu ${this.state.userMenuOpen && 'open'}`}>
                <a onClick={this.toggleUserMenu}>
                  <span >
                    {this.props.username}
                    <i className="caret" />
                  </span>
                </a>
                <ul className="dropdown-menu">
                  <li className="user-body">{this.props.username}</li>
                  <li className="user-footer">
                    {
                      this.props.loggingOut
                      ? <Button bsStyle="default" block disabled>
                        <Icon name="refresh" spin />
                      </Button>
                      : <Button bsStyle="default" block onClick={this.props.handleLogout}>
                        {TAPi18n.__('login.logout')} <Icon name="sign-out" />
                      </Button>
                    }
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </nav>
      </header>
    )
  }
}
