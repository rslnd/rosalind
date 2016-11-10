import React from 'react'
import classnames from 'classnames'
import { Link } from 'react-router'
import FlipMove from 'react-flip-move'
import { TAPi18n } from 'meteor/tap:i18n'
import style from './sidebarStyle.scss'

const SidebarItem = ({ item, router, sidebarOpen }) => {
  const hideWhenClosed = classnames({
    [ style.hidden ]: !sidebarOpen,
    [ style.fade ]: true
  })

  return (
    <li className={router.isActive(`/${item.name}`) && 'active'}>
      <Link
        to={`/${item.name}`}
        className="pointer level-0 link"
        title={TAPi18n.__(`${item.name}.this`)}>
        <i className={`fa fa-${item.icon}`}></i>
        <span className={hideWhenClosed}>{TAPi18n.__(`${item.name}.this`)}</span>
        <FlipMove typeName="span">
          {
            item.count && item.count > 0
            ? <small
              key={item.count}
              className={`label pull-right label-primary ${!sidebarOpen && style.badgeWhenClosed}`}>
              {item.count}
            </small>
            : (item.subItems &&
              <i
                key="subItems"
                className={`i fa fa-angle-left pull-right ${hideWhenClosed}`}>
                &emsp;
              </i>
            )
          }
        </FlipMove>
      </Link>
      {sidebarOpen && item.subItems &&
        <ul className="treeview-menu">
          {item.subItems.map((subItem) => (
            <li key={subItem.name} className={router.isActive(`/${item.name}${subItem.path}`, true) && 'active level-1 link'}>
              <Link
                to={`/${item.name}${subItem.path}`}
                className="level-1 link"
                title={TAPi18n.__([item.name, subItem.name].join('.'))}>
                <span>{TAPi18n.__([item.name, subItem.name].join('.'))}</span>
              </Link>
            </li>
          ))}
        </ul>
      }
    </li>
  )
}

export class Sidebar extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      userMenuOpen: false
    }

    this.handleUserMenuToggle = this.handleUserMenuToggle.bind(this)
  }

  handleUserMenuToggle () {
    this.setState({ ...this.state, userMenuOpen: !this.state.userMenuOpen })
  }

  render () {
    const asideClasses = classnames({
      'main-sidebar': true,
      'sidebar': true,
      [ style.sidebarOpen ]: this.props.isOpen,
      [ style.sidebarClosed ]: !this.props.isOpen
    })

    const userPanelClasses = classnames({
      'header': true,
      'text-center': true,
      [ style.username ]: !this.props.isOpen
    })

    return (
      <aside className={asideClasses}>
        <ul className={`sidebar-menu ${style.sidebar}`}>

          <li className={userPanelClasses}>
            {this.props.userPanel}
          </li>

          {this.props.items.map((item) => (
            <SidebarItem
              key={item.name}
              item={item}
              router={this.props.router}
              sidebarOpen={this.props.isOpen} />
          ))}

          {/* TODO: Replace with flexbox */}
          <li style={{height: '70px'}}></li>

          {/* <li className={`header text-center ${style.customerName} ${this.props.isOpen && style.hidden}`}>{this.props.customerName.split(' - ').map((name, i) => (
            <span key={i}>{name}<br /></span>
          ))}</li> */}
        </ul>
      </aside>
    )
  }
}
