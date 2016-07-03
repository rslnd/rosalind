import React from 'react'
import { Link } from 'react-router'

export const Topbar = ({ toggleSidebar }) => (
  <header className="main-header">
    <Link to="/" className="logo">
      <img src="/images/logo.svg" />
    </Link>

    <nav className="navbar navbar-static-top">
      <ul className="nav navbar-nav navbar-left">
        <li>
          <a onClick={() => toggleSidebar()}>
            <i className="fa fa-bars"></i>
          </a>
        </li>
      </ul>

      <div className="navbar-custom-menu">
        <ul className="nav navbar-nav">
          <li className="dropdown user user-menu">
            <a>
              <span>
                Username
                <i className="caret"></i>
              </span>
            </a>
          </li>
        </ul>
      </div>
    </nav>
  </header>
)
