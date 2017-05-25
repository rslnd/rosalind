import React from 'react'
import injectSheet from 'react-jss'
import classnames from 'classnames'
import { Link } from 'react-router-dom'
import FlipMove from 'react-flip-move'
import { TAPi18n } from 'meteor/tap:i18n'

const styles = {
  sidebar: {
    minHeight: '100%',
    paddingBottom: 70
  },
  sidebarOpen: {
    width: 230
  },
  sidebarClosed: {
    width: 45
  },
  hidden: {
    opacity: 0,
    pointerEvents: 'none'
  },
  fade: {
    transition: 'opacity .1s cubic-bezier(1, 0, 1, 0)'
  },
  username: {
    padding: '10px 0 10px 0'
  },
  badgeWhenClosed: {
    opacity: 1,
    transform: 'scale(0.65) translateX(10px) translateY(-35px)'
  }
}

const isActive = (path, location) => {
  return location.pathname.indexOf(path) === 0
}

const SidebarItem = injectSheet(styles)(({ item, location, sidebarOpen, classes }) => {
  const hideWhenClosed = classnames({
    [ classes.hidden ]: !sidebarOpen,
    [ classes.fade ]: true
  })

  return (
    <li className={isActive(`/${item.name}`, location) && 'active'}>
      <Link
        to={`/${item.name}`}
        className='pointer level-0 link'
        title={TAPi18n.__(`${item.name}.this`)}>
        <i className={`fa fa-${item.icon}`} />
        <span className={hideWhenClosed}>{TAPi18n.__(`${item.name}.this`)}</span>
        <FlipMove typeName='span'>
          {
            item.count && item.count > 0
            ? <small
              key={item.count}
              className={`label pull-right label-primary ${!sidebarOpen && classes.badgeWhenClosed}`}>
              {item.count}
            </small>
            : (item.subItems &&
              <i
                key='subItems'
                className={`i fa fa-angle-left pull-right ${hideWhenClosed}`} />
            )
          }
        </FlipMove>
      </Link>
      {sidebarOpen && item.subItems &&
        <ul className='treeview-menu'>
          {item.subItems.map((subItem) => (
            <li key={subItem.name} className={isActive(`/${item.name}${subItem.path || ''}`, location) && 'active level-1 link'}>
              <Link
                to={`/${item.name}${subItem.path || ''}`}
                className='level-1 link'
                title={TAPi18n.__([item.name, subItem.name].join('.'))}>
                <span>{TAPi18n.__([item.name, subItem.name].join('.'))}</span>
              </Link>
            </li>
          ))}
        </ul>
      }
    </li>
  )
})

class SidebarItems extends React.Component {
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
    const { classes } = this.props

    const asideClasses = classnames({
      'main-sidebar': true,
      'sidebar': true,
      [ classes.sidebarOpen ]: this.props.isOpen,
      [ classes.sidebarClosed ]: !this.props.isOpen
    })

    const listClasses = classnames({
      'sidebar-menu': true,
      [ classes.sidebar ]: true
    })

    const userPanelClasses = classnames({
      'header': true,
      'text-center': true,
      [ classes.username ]: !this.props.isOpen
    })

    return (
      <aside className={asideClasses}>
        <ul className={listClasses}>

          <li className={userPanelClasses}>
            {this.props.userPanel}
          </li>

          {this.props.items.map((item) => (
            <SidebarItem
              key={item.name}
              item={item}
              location={this.props.location}
              sidebarOpen={this.props.isOpen} />
          ))}

          {/* TODO: Replace with flexbox */}
          <li style={{height: '70px'}} />

          {/* <li className={`header text-center ${classes.customerName} ${this.props.isOpen && style.hidden}`}>{this.props.customerName.split(' - ').map((name, i) => (
            <span key={i}>{name}<br /></span>
          ))}</li> */}
        </ul>
      </aside>
    )
  }
}

export const Sidebar = injectSheet(styles)(SidebarItems)
