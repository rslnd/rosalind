import React from 'react'
import injectSheet from 'react-jss'
import classnames from 'classnames'
import { Link } from 'react-router-dom'
import FlipMove from 'react-flip-move'
import { __ } from '../../i18n'

const duration = 0.18
export const sidebarTransitionStyle = {
  transition: `width ${duration}s ease-out, transform ${duration}s ease-out, background-color ${duration}s ease-out ${duration}s`
}

const styles = {
  sidebar: {
    minHeight: '100%',
    paddingBottom: 70,
    ...sidebarTransitionStyle
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

  const name = item.label
    ? item.label
    : item.name
    ? item.name.indexOf('.') === -1
      ? __(`${item.name}.this`)
      : __(item.name)
    : ''

  const link = item.link || `/${item.name}`

  if (item.separator) {
    return (
      <li className='header'>{name}</li>
    )
  }

  return (
    <li className={isActive(link, location) ? 'active' : undefined}>
      {
        item.onClick
        ? (
          <a className='pointer level-0 link'
            title={name}
            onClick={() => item.onClick({ item, location })}>
            <i className={`fa fa-${item.icon}`} />
            <span className={hideWhenClosed}>{name}</span>
          </a>
        ) : (
          <Link
            to={link}
            className='pointer level-0 link'
            title={name}>
            <i className={`fa fa-${item.icon}`} />
            <span className={hideWhenClosed}>{name}</span>
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
        )
      }
      {sidebarOpen && item.subItems &&
        <ul className='treeview-menu'>
          {item.subItems.map((subItem) => (
            <SubItem key={subItem.name} item={item} subItem={subItem} location={location} />
          ))}
        </ul>
      }
    </li>
  )
})

const SubItem = ({item, subItem, location}) => {
  const displayName = subItem.label ||
    __([item.name, subItem.name].join('.'))

  return (
    <li key={subItem.name} className={isActive(`/${item.name}${subItem.path || ''}`, location) ? 'active level-1 link' : undefined}>
      {
        item.onClick
          ? <a className='level-1 link' onClick={() => item.onClick({ subItem, location })}>
            <span
              title={displayName}>
              {displayName}
            </span>
          </a>
          : <Link
            to={`/${item.name}${subItem.path || ''}`}
            className='level-1 link'
            title={displayName}>
            <span>{displayName}</span>
          </Link>
      }
    </li>
  )
}

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
      <aside className={asideClasses} style={sidebarTransitionStyle}>
        <ul className={listClasses}>

          <li className={userPanelClasses}>
            {this.props.userPanel}
          </li>

          {this.props.items.map((item, i) => (
            <SidebarItem
              key={item.name || i}
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
